import {
  GetAccountInfoResponse_Account, GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset, IbanCoordinates, ScanCoordinates
} from "@/harbour/gen/ramp/v1/public_pb";
import {FunctionComponent, useState} from "react";
import {Wallet, Wallets} from "@/components/Wallets";
import {Assets} from "@/components/Assets";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {BankAccount as BankAccountComponent} from "@/components/BankAccount";
import BankAccount from "@/types/bankAccount";
import {PiggyBankIcon} from "lucide-react";

export interface OffRampProps {
  account: GetAccountInfoResponse_Account,
  onAddWallet: (wallet: Wallet) => void
  onSaveBankAccount: (account: BankAccount) => void
}

export const OffRamp: FunctionComponent<OffRampProps> = (
  {account, onAddWallet}) => {
  const [selectedWallet, setSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined)
  const [selectedAsset, setSelectedAsset] = useState<GetAccountInfoResponse_Wallet_RampAsset | undefined>(undefined)

  const handleSelectWalletClick = (wallet: GetAccountInfoResponse_Wallet) => {
    setSelectedWallet(wallet)
    setSelectedAsset(undefined)
  }
  const needSetBankAccount = !account.offrampBankAccount.case

  const getOffRampBankAccount = (acc: GetAccountInfoResponse_Account): BankAccount => {
    switch (acc.offrampBankAccount.case) {
      case "offrampIban": return {
        case: "iban",
        value: acc.offrampBankAccount.value
      }
      case "offrampScan": return {
        case: "scan",
        value: acc.offrampBankAccount.value
      }
      case undefined:
        switch (acc.onrampBankAccount.case) {
          case "onrampIban": return {
            case: "iban",
            value: new IbanCoordinates()
          }
          case "onrampScan": return {
            case: "scan",
            value: new ScanCoordinates()
          }
          default:
            throw "onramp bank account must always be set!"
        }
    }
  }
  const [bankAccount, setBankAccount] = useState<BankAccount>(getOffRampBankAccount(account))

  const onChangeBankAccount = (account: BankAccount) => {
    setBankAccount(account)
  }

  return (
  <div className="flex flex-row gap-8">
    {needSetBankAccount && <>
      <div className="basis-1/3 grid gap-4"></div>
      <div className="basis-1/3 grid gap-4">
        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle>Setup you bank account</CardTitle>
            <CardDescription>
              Set bank account you want your funds to be transferred to.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <BankAccountComponent account={bankAccount} onChange={onChangeBankAccount}/>
            <div>
              <Button className="w-full" onClick={() => console.log(bankAccount)}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="basis-1/3 grid gap-4"></div>
    </>}
    {account.offrampBankAccount.case && <>
    <div className="basis-1/3 grid gap-4">
      <Wallets wallets={account.wallets}
               selectedWallet={selectedWallet}
               onWalletSelected={handleSelectWalletClick}
               onAddWallet={onAddWallet}
               description="Step 1: Choose the wallet you want to offramp assets from"/>
    </div>
    <div className="basis-1/3">
      {selectedWallet?.assets &&
        <Assets assets={selectedWallet?.assets!}
                onSelected={setSelectedAsset}
                selected={selectedAsset}
                description="Step 2: Choose the asset you want to offramp"/>}
    </div>
    <div className="basis-1/3">
      {selectedAsset &&
        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle>Crypto Transactions Details</CardTitle>
            <CardDescription>
              Step 3: Send your funds from selected address or just enter amount and sign transaction. Please note that
              transfers from other addresses could cause unrecoverable loss of assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="w-full max-w-sm items-center">
              <Label htmlFor="address">Address</Label>
              <Input type="text" id="address" placeholder="address" readOnly={true} value={selectedAsset.offRamp?.address}/>
            </div>
            {<>
              <div className="w-full max-w-sm items-center">
                <Label htmlFor="amount">Amount {selectedAsset!.asset?.shortName}</Label>
                <Input type="text" id="amount" placeholder={`amount in ${selectedAsset!.asset?.shortName}`} disabled/>
              </div>
              <div>
                <Button className="w-full" disabled>Sign and submit transaction</Button>
              </div>
            </>}
          </CardContent>
          <CardFooter className="grid gap-4">
            <div className=" flex items-center space-x-4 rounded-md border p-4">
              <PiggyBankIcon/>
              <div className="flex-1 space-y-1">
                {false &&<p className="text-sm font-medium leading-none">
                  Push Notifications
                </p>}
                <p className="text-sm text-muted-foreground">
                  You will receive your funds directly to your bank account.
                </p>
              </div>
            </div>
            <div className="w-full max-w-sm items-center">
              <BankAccountComponent account={getOffRampBankAccount(account)}/>
            </div>
          </CardFooter>
        </Card>}
    </div>
    </>}
  </div>
  )
}

