import { useEffect, useState } from 'react';
import { MetamaskActions, useMetaMask } from '@/hooks/useMetaMask';
import { useRampClient } from '@/hooks/useRpc';
import {
  Ecosystem,
  GetAccountInfoResponse, IbanCoordinates,
  SetBankAccountRequest,
  WhitelistAddressRequest,
} from '@/harbour/gen/ramp/v1/public_pb';
import { Button } from '@/components/ui/button';
import { connectSnap, getSnap, isLocalSnap } from '@/utils';
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

      response.result.value.wallets[0].address = "0x73c2D5103898a0a850886314B6099b4DE03FC0Bb";
      response.result.value.wallets[0].name = "Stepan's Metamask";

      response.result.value.offrampBankAccount = {
        case: 'offrampIban',
        value: new IbanCoordinates({
          iban: 'DE39 5001 0517 3186 9541 84',
        }),
      };
    }

    // response.result = {
    //   case: "authentication",
    //   value: new GetAccountInfoResponse_Authentication({}),
    // }

    setAccountInfo(response);
    console.log('loaded account');
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
    } catch (error) {
      console.error(error);
      metamaskDispatch({ type: MetamaskActions.SetError, payload: error });
    }
  };

  const handleAddWallet = async (wallet: Wallet) => {
    try {
      await rampClient.whitelistAddress(
        new WhitelistAddressRequest({
          name: wallet.name,
          address: wallet.address,
          ecosystem: Ecosystem.ETHEREUM,
        }),
        async (_) => 'not implemented',
      );
    } catch (e) {
      console.log(e);
    }
    await load();
  };

  const handleSaveBankAccount = async (account: BankAccount) => {
    try {
      await rampClient.setBankAccount(
        new SetBankAccountRequest({
          bankAccount: account,
        }),
      );
    } catch (e) {
      console.log(e);
    }
    await load();
  };

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
            <a href="/login" target="_blank">
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

      {accountInfo?.result.case == 'authentication' && (
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
      )}
      {accountInfo?.result.case == 'account' && (
        <>
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
        </>
      )}
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
