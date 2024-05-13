/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { MetamaskActions, useMetaMask } from '@/hooks/useMetaMask';
import { useRampClient } from '@/hooks/useRpc';
import {
  GetAccountInfoResponse,
  Protocol,
  SetBankAccountRequest,
} from '@/harbour/gen/ramp/v1/public_pb';
import { Button } from '@/components/ui/button';
import {
  connectSnap,
  getSnap,
  isLocalSnap,
  requestPersonalSign,
} from '@/utils';
import { Separator } from '@radix-ui/react-separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnRamp } from '@/OnRamp';
import { Snap } from '@/types';
import { Wallet } from '@/components/Wallets';
import { OffRamp } from '@/OffRamp';

import { BankAccount } from '@/types/bankAccount';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RocketIcon } from 'lucide-react';
import splash from '@/assets/splash.png';
import { toast } from 'react-toastify';
import { keccak256, SigningKey } from 'ethers';
import { useOnboardingModal } from '@/contexts/OnboardingModal';
import { Note, NoteDescription, NoteTitle } from '@/components/ui/note';
import MetaMaskWithLogo from '@/assets/metamaskWithName.svg?react';

const SupportedNetworks = new Map<Protocol, Protocol>([
  [Protocol.ETHEREUM, Protocol.ETHEREUM],
  [Protocol.AVAX, Protocol.AVAX],
  [Protocol.POLYGON, Protocol.POLYGON],
]);

const App = () => {
  const triggerModalOnceRef = useRef(false);
  const { openOnboardingModal, setOnFinishCallback } = useOnboardingModal();
  const [metamask, metamaskDispatch] = useMetaMask();
  const rampClient = useRampClient();
  const [accountInfo, setAccountInfo] = useState<GetAccountInfoResponse | null>(
    null,
  );
  const isMetaMaskReady = metamask.snapsDetected;

  const load = async () => {
    let response: GetAccountInfoResponse;
    try {
      response = await rampClient.getAccountInfo({});
    } catch (e) {
      toast.error('Failed to load account info');
      throw e;
    }

    if (response.result.case == 'account') {
      // filter out unnecessary assets
      response.result.value.cryptoAssets =
        response.result.value.cryptoAssets.filter((a) =>
          SupportedNetworks.has(a.protocol),
        );
      // response.result.value.onrampBankAccount = {
      //   case:"onrampScan",
      //   value: new ScanCoordinates({
      //     sortCode: "DEXXXX",
      //     accountNumber: "12345678"
      //   })
      // }
      // response.result.value.onrampBankAccount = {
      //     case:"onrampIban",
      //     value: new IbanCoordinates({
      //       iban: "DE1233231231",
      //     })
      //   }
      //response.result.value.wallets[0].address = "0x73c2D5103898a0a850886314B6099b4DE03FC0Bb";
      //response.result.value.wallets[0].name = "Stepan's Metamask";
      // response.result.value.offrampBankAccount = {
      //   case: 'offrampIban',
      //   value: new IbanCoordinates({
      //     iban: 'DE39 5001 0517 3186 9541 84',
      //   }),
      // };
    }

    // response.result = {
    //   case: "authentication",
    //   value: new GetAccountInfoResponse_Authentication({}),
    // }

    setAccountInfo(response);
  };

  useEffect(() => {
    if (metamask.installedSnap) {
      load();
    }
  }, [metamask.installedSnap, rampClient]);

  useEffect(() => {
    setOnFinishCallback(() => load());
  }, []);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();
      metamaskDispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
      toast.success('Snap connected to MetaMask');
    } catch (error) {
      toast.error('Failed to connect to MetaMask');
      metamaskDispatch({ type: MetamaskActions.SetError, payload: error });
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
      console.log(e);
      toast.error('Failed to add wallet');
    }
    await load();
  };

  const handleSaveBankAccount = async (account: BankAccount) => {
    try {
      await rampClient
        .setBankAccount(
          new SetBankAccountRequest({
            bankAccount: account,
          }),
        )
        .then((res) => {
          if (res.errors) {
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
      toast.error('Unknown error');
    }
    await load();
  };

  useEffect(() => {
    if (
      accountInfo?.result.case == 'authentication' &&
      !triggerModalOnceRef.current
    ) {
      triggerModalOnceRef.current = true;
      openOnboardingModal(accountInfo.result.value.authenticationUrl);
    }
  }, [accountInfo?.result.case]);

  const content = useMemo(() => {
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
            ></OnRamp>
          </TabsContent>
          <TabsContent value="offramp">
            <OffRamp
              account={accountInfo.result.value}
              onAddWallet={handleAddWallet}
              onSaveBankAccount={handleSaveBankAccount}
            ></OffRamp>
          </TabsContent>
        </Tabs>
      );
    }

    return (
      <div className="flex flex-col w-[344px] gap-4">
        <Note>
          <NoteTitle>
            To enable Magic Ramping, please connect your MetaMask wallet.
          </NoteTitle>
          <NoteDescription>
            If you are a new user we will then take you thought a very quick
            onboarding jurney
          </NoteDescription>
        </Note>
        {!isMetaMaskReady ? (
          <Button asChild className="leading-3">
            <a
              href="https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk"
              target="_blank"
            >
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
  ]);

  return (
    <>
      <div className="max-w-[430px] mt-4 mb-4">
        <h3 className="heading3 mb-2 text-lightSky !font-thin">
          Say goodbye to the hassle and costs of on and off ramping
        </h3>
        <p className="text-muted-foreground caption1">
          Experience seamless transfers between your bank account and MetaMask
          wallet with Harbour
        </p>
      </div>
      {content}
    </>
  );
};

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
