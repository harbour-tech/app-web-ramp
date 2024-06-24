/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useMemo, useState } from 'react';
import {
  GetAccountInfoResponse,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  Protocol,
  SetBankAccountRequest,
} from '@/harbour/gen/ramp/v1/public_pb';
import { Button } from '@/components/ui/button';
import {
  bankAccountIsSameAsOnRampBankAccount,
  connectSnap,
  getSnap,
  isLocalSnap,
  requestPersonalSign,
} from '@/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Success } from '@/components/Success';
import { OnRamp } from '@/OnRamp';
import { OffRamp } from '@/OffRamp';
import { Wallet } from '@/components/AddWallet';

import { BankAccount } from '@/types/bankAccount';
import { toast } from 'react-toastify';
import { keccak256, SigningKey } from 'ethers';
import { Note, NoteDescription, NoteTitle } from '@/components/ui/note';
import MetaMaskWithLogo from '@/assets/metamaskWithName.svg?react';
import { Snap } from '@/types';
import {
  MetamaskActions,
  useMetaMask,
  useOnboardingModal,
  useRampClient,
} from '@/contexts';
import { isMobile } from 'react-device-detect';
import { installationLink } from '@/lib/utils';
import { handle32002 } from '@/lib/utils';
import { useLocalAddresses } from '@/contexts/LocalAddresses';

const SupportedNetworks = new Map<Protocol, Protocol>([
  [Protocol.ETHEREUM, Protocol.ETHEREUM],
  [Protocol.AVAX, Protocol.AVAX],
  [Protocol.POLYGON, Protocol.POLYGON],
]);

const App: FC<{ hideLogo: () => void }> = ({ hideLogo }) => {
  const { clearLocalAddresses } = useLocalAddresses();
  const { openOnboardingModal, setOnFinishCallback } = useOnboardingModal();
  const [metamask, metamaskDispatch] = useMetaMask();
  const rampClient = useRampClient();
  // prettier-ignore
  const [accountInfo, setAccountInfo] = useState<GetAccountInfoResponse | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const isMetaMaskReady = metamask.snapsDetected;
  // prettier-ignore
  const [changingBankAccountFailed, setChangingBankAccountFailed] = useState<boolean | string>(false);
  // prettier-ignore
  const [onRampSelectedAsset, setOnRampSelectedAsset] = useState<GetAccountInfoResponse_CryptoAsset | undefined>(undefined);
  // prettier-ignore
  const [onRampSelectedWallet, setOnRampSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined);
  // prettier-ignore
  const [offRampSelectedAsset, setOffRampSelectedAsset] = useState<GetAccountInfoResponse_CryptoAsset | undefined>(undefined);
  // prettier-ignore
  const [offRampSelectedWallet, setOffRampSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined);

  const load = async (message?: string) => {
    if (message === 'onboardingFinished') {
      setShowSuccess(true);
    }
    let response: GetAccountInfoResponse;
    try {
      response = await rampClient.getAccountInfo({});
    } catch (e) {
      toast.error('Failed to load account info');
      throw e;
    }

    if (response.result.case == 'account') {
      response.result.value.cryptoAssets =
        response.result.value.cryptoAssets.filter((a) =>
          SupportedNetworks.has(a.protocol),
        );
    }

    setAccountInfo(response);
  };

  useEffect(() => {
    if (metamask.installedSnap) {
      load();
    }
  }, [metamask.installedSnap]);

  useEffect(() => {
    setOnFinishCallback((message) => load(message));
  }, []);

  const handleConnectClick = async () => {
    clearLocalAddresses();
    try {
      await connectSnap();
      const installedSnap = await getSnap();
      metamaskDispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
      toast.success('Snap connected to MetaMask');
    } catch (error) {
      if (error?.code === -32002) {
        handle32002();
      } else {
        toast.error('Failed to connect to MetaMask');
        metamaskDispatch({ type: MetamaskActions.SetError, payload: error });
      }
    }
  };

  const handleAddWallet = async (wallet: Wallet) => {
    try {
      const result = await requestPersonalSign(wallet.address, wallet.address);
      let digest =
        '\x19Ethereum Signed Message:\n' +
        wallet.address.length +
        wallet.address;
      digest = keccak256(new TextEncoder().encode(digest));
      let compressedPublicKey = SigningKey.recoverPublicKey(
        digest,
        result?.signature,
      );
      compressedPublicKey = SigningKey.computePublicKey(
        compressedPublicKey,
        true,
      );
      // let recoveredAddr = computeAddress(compressedPublicKey);
      // console.log(`Original address: ${wallet.address}`);
      // console.log(`Recovered Address: ${recoveredAddr}`);
      // console.log(`Public Key: ${compressedPublicKey}`);

      const res = await rampClient.whitelistAddress({
        protocol: wallet.protocol,
        name: wallet.name,
        address: wallet.address,
        publicKey: compressedPublicKey,
        addressSignature: result!.signature,
      });

      if (res) {
        toast.success('Wallet added');
      }
    } catch (e) {
      if (e?.code === -32002 || e?.error?.code === -32002) {
        handle32002();
      }
      toast.error('Failed to add wallet');
    }
    await load();
  };

  const handleSaveBankAccount = async (newAccount: BankAccount) => {
    setChangingBankAccountFailed(false);
    if (bankAccountIsSameAsOnRampBankAccount(newAccount, accountInfo)) {
      const errorMessage =
        'You cannot off-ramp to your magic ramp account. Set your personal bank account details instead, where you wish to receive payments.';
      toast.error(errorMessage);
      setChangingBankAccountFailed(errorMessage);
    } else {
      try {
        await rampClient
          .setBankAccount(
            new SetBankAccountRequest({
              bankAccount: newAccount,
            }),
          )
          .then((res) => {
            if (res.errors && res.errors.length > 0) {
              setChangingBankAccountFailed(true);
              res.errors.forEach((error) => {
                let errorMessage = 'Problem with saving bank number';
                switch (error) {
                  case 1:
                    errorMessage = 'Invalid short code';
                    break;
                  case 2:
                    errorMessage = 'Invalid bank number';
                    break;
                  default:
                    break;
                }
                toast.error(errorMessage);
              });
            } else {
              toast.success('Bank account saved');
            }
          });
      } catch (e) {
        setChangingBankAccountFailed(true);
        toast.error('Unknown error');
      }
    }
    await load();
  };

  useEffect(() => {
    if (accountInfo?.result.case == 'account') {
      hideLogo();
    }
  }, [accountInfo?.result.case]);

  const content = useMemo(() => {
    if (isMobile) {
      return (
        <Note>
          <NoteTitle>Desktop requirement</NoteTitle>
          <NoteDescription>
            This app can only be used on desktop browers with MetaMask installed
          </NoteDescription>
        </Note>
      );
    }

    if (accountInfo?.result.case == 'authentication') {
      return (
        <div className="flex flex-col w-[344px] gap-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              if (accountInfo.result.case === 'authentication') {
                openOnboardingModal(accountInfo.result.value.authenticationUrl);
              }
            }}
          >
            Enable Magic ramping
          </Button>
          <Note>
            <NoteTitle>Note:</NoteTitle>
            <NoteDescription>
              Magic Ramping provides a new instant, low cost way to on/off ramp
              Stablecoins into your wallet. It is currently only available to EU
              residents.
            </NoteDescription>
          </Note>
        </div>
      );
    }
    if (accountInfo?.result.case == 'account') {
      return (
        <Tabs defaultValue="onramp" className="grid gap-4">
          <TabsList className="grid grid-cols-2 w-[343px] place-self-center">
            <TabsTrigger value="onramp">On Ramp</TabsTrigger>
            <TabsTrigger value="offramp">Off Ramp</TabsTrigger>
          </TabsList>
          <TabsContent value="onramp">
            <OnRamp
              account={accountInfo.result.value}
              onAddWallet={handleAddWallet}
              onRampSelectedAsset={onRampSelectedAsset}
              onRampSelectedWallet={onRampSelectedWallet}
              handleOnRampAssetSelected={setOnRampSelectedAsset}
              handleOnRampWalletSelected={setOnRampSelectedWallet}
            />
          </TabsContent>
          <TabsContent value="offramp">
            <OffRamp
              account={accountInfo.result.value}
              onAddWallet={handleAddWallet}
              onSaveBankAccount={handleSaveBankAccount}
              changingBankAccountFailed={changingBankAccountFailed}
              offRampSelectedAsset={offRampSelectedAsset}
              offRampSelectedWallet={offRampSelectedWallet}
              handleOffRampAssetSelected={setOffRampSelectedAsset}
              handleOffRampWalletSelected={setOffRampSelectedWallet}
            />
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="flex flex-col w-[344px] gap-4">
        <Note>
          <NoteTitle className="!normal-case">
            To enable Magic Ramping, please connect your MetaMask wallet.
          </NoteTitle>
          <NoteDescription>
            If you are a new user we will then take you thought a very quick
            onboarding jurney
          </NoteDescription>
        </Note>
        {!isMetaMaskReady ? (
          <Button asChild className="leading-3">
            <a href={installationLink()} target="_blank">
              Install <MetaMaskWithLogo className="ml-2" />
            </a>
          </Button>
        ) : (
          <Button onClick={handleConnectClick}>
            Connect <MetaMaskWithLogo className="ml-2" />
          </Button>
        )}

        <Note>
          <NoteTitle>Note:</NoteTitle>
          <NoteDescription>
            Magic Ramping provides a new instant, low cost way to on/off ramp
            Stablecoins into your wallet. It is currently only available to EU
            residents.
          </NoteDescription>
        </Note>
      </div>
    );
  }, [
    accountInfo?.result.case,
    accountInfo?.result.value,
    handleAddWallet,
    handleSaveBankAccount,
    isMetaMaskReady,
    showSuccess,
  ]);

  if (showSuccess)
    return <Success onNextButtonClick={() => setShowSuccess(false)} />;
  const resetLink =
    import.meta.env.VITE_ENABLE_RESET &&
    shouldDisplayReconnectButton(metamask.installedSnap as unknown as Snap);

  return (
    <>
      {accountInfo?.result.case !== 'account' && (
        <div className="max-w-[430px] mt-36 mb-4">
          <h3 className="heading3 mb-2 text-lightSky !font-thin !normal-case">
            Say goodbye to the hassle and costs of on and off ramping
          </h3>
          <p className="text-muted-foreground caption1">
            Experience seamless transfers between your bank account and MetaMask
            wallet with{' '}
            <span
              className={resetLink ? 'text-sky' : ''}
              onClick={() => (resetLink ? handleConnectClick() : () => null)}
            >
              Harbour
            </span>
          </p>
        </div>
      )}
      {content}
    </>
  );
};

const shouldDisplayReconnectButton = (installedSnap?: Snap) =>
  installedSnap && isLocalSnap(installedSnap?.id);

export default App;

// response = new GetAccountInfoResponse({
//   result: {
//     case: "account",
//     value: new GetAccountInfoResponse_Account({
//       wallets: [
//         {
//           name: "My Ethereum Wallet",
//           address: "0x0AA60d97d64616D6Ab798E325a7f381b6C8b4A26",
//           network: Network.ETHEREUM_MAINNET,
//           assets: [
//             {
//               asset: {
//                 shortName: "USDC"
//               },
//               onRamp: {
//                 paymentReference: "ETU1"
//               }
//             },
//             {
//               asset: {
//                 shortName: "CEUR"
//               },
//               onRamp: {
//                 paymentReference: "ETE1"
//               }
//             }
//           ],
//         },
//         {
//           name: "MetaMask Wallet",
//           address: "0x95969409a1A536814C3ca529b3e50f5AB63AaA6b",
//           network: Network.ETHEREUM_MAINNET,
//           assets: [
//             {
//               asset: {
//                 shortName: "USDC"
//               },
//               onRamp: {
//                 paymentReference: "ETU2"
//               }
//             },
//           ],
//         }
//       ],
//       accountHolder: "Max Mustermann",
//       onrampBankAccount: {
//         case: "onrampIban",
//         value: new IbanCoordinates({
//           iban: "DE52 5001 0517 7533 1824 13"
//         })
//       },
//       offrampBankAccount: {
//         case: "offrampIban",
//         value: new IbanCoordinates({
//           iban: "DE52500105177533182413"
//         })
//       },
//     })
//   }
// })
