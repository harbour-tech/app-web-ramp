/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from 'react';
import { MetamaskActions, useMetaMask } from '@/hooks/useMetaMask';
import { useRampClient } from '@/hooks/useRpc';
import {
  GetAccountInfoResponse,
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

function App() {
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

  const content = useMemo(() => {
    if (accountInfo?.result.case == 'authentication') {
      return (
        <div className="grid justify-items-center">
          <Alert className="mt-10 sm:max-w-[700px]">
            <RocketIcon className="h-4 w-4" />
            <AlertTitle>This is private beta</AlertTitle>
            <AlertDescription>
              We are working hard on the letting magic happen. We strongly
              encourage you to come back later. See you soon!
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    if (accountInfo?.result.case == 'account') {
      return (
        <Tabs defaultValue="onramp" className="grid gap-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="onramp">On Ramp</TabsTrigger>
            <TabsTrigger value="offramp">Off Ramp</TabsTrigger>
          </TabsList>
          <TabsContent value="onramp">
            <OnRamp
              account={accountInfo.result.value}
              onAddWallet={handleAddWallet}
            ></OnRamp>
          </TabsContent>
          <TabsContent value="offramp" className="grid gap-4">
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
      <div className="grid justify-items-center">
        <Alert className="mt-10 sm:max-w-[700px]">
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Please open MetaMask</AlertTitle>
          <AlertDescription>
            Please open MetaMask extension and login to your account
          </AlertDescription>
        </Alert>
      </div>
    );
  }, [
    accountInfo?.result.case,
    accountInfo?.result.value,
    handleAddWallet,
    handleSaveBankAccount,
  ]);

  return (
    <div>
      <div className="">
        <h2 className="text-2xl font-bold tracking-tight">
          Say goodbye to the hassle and costs of on and off ramping
        </h2>
        <p className="text-muted-foreground">
          Experience seamless transfers between your bank account and MetaMask
          wallet with Harbour
        </p>
      </div>
      <div className="py-2">
        <Separator className="my-4" />
        {!isMetaMaskReady && (
          <Button asChild>
            <a
              href="https://chromewebstore.google.com/detail/metamask-flask-developmen/ljfoeinjpaedjfecbmggjgodbgkmjkjk"
              target="_blank"
            >
              Install MetaMask
            </a>
          </Button>
        )}
        {shouldDisplayReconnectButton(metamask.installedSnap) && (
          <Button onClick={handleConnectClick}>Reconnect Snap</Button>
        )}
      </div>
      <div>
        {!metamask.installedSnap && (
          <>
            <Button onClick={handleConnectClick}>Install Snap</Button>
            <div className="flex justify-center">
              <img width="600" src={splash} className="mt-8" />
            </div>
          </>
        )}
      </div>
      {content}
    </div>
  );
}

export default App;

const shouldDisplayReconnectButton = (installedSnap?: Snap) =>
  installedSnap && isLocalSnap(installedSnap?.id);

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
