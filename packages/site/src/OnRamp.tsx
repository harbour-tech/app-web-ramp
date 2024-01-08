import {
  GetAccountInfoResponse_Account, GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset
} from "@/harbour/gen/ramp/v1/public_pb";
import {FunctionComponent, useState} from "react";
import {Wallet, Wallets} from "@/components/Wallets";
import {Assets} from "@/components/Assets";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {BankAccount as BankAccountComponent} from "@/components/BankAccount";
import {BankAccount} from "@/types/bankAccount";

export interface OnRampProps {
  account: GetAccountInfoResponse_Account,
  onAddWallet: (wallet: Wallet) =>void
}

export const OnRamp: FunctionComponent<OnRampProps> = ({account, onAddWallet}) => {
  const [selectedWallet, setSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined)
  const [selectedAsset, setSelectedAsset] = useState<GetAccountInfoResponse_Wallet_RampAsset | undefined>(undefined)

  const handleSelectWalletClick = (wallet: GetAccountInfoResponse_Wallet) => {
    setSelectedWallet(wallet)
    setSelectedAsset(undefined)
  }
  const getOnRampBankAccount = (): BankAccount => {
    switch (account.onrampBankAccount.case) {
      case "onrampIban": return {
        case: "iban",
        value: account.onrampBankAccount.value
      }
      case "onrampScan": return {
        case: "scan",
        value: account.onrampBankAccount.value
      }
      default: throw "onramp bank account must be set!"
    }
  }

  return (
  <div className="flex flex-row gap-8">
    <div className="basis-1/3 grid gap-4">
      <Wallets wallets={account.wallets}
               selectedWallet={selectedWallet}
               onWalletSelected={handleSelectWalletClick}
               onAddWallet={onAddWallet}/>
    </div>
    <div className="basis-1/3">
      {selectedWallet?.assets &&
        <Assets assets={selectedWallet?.assets!} onSelected={setSelectedAsset} selected={selectedAsset}></Assets>}
    </div>
    <div className="basis-1/3">
      {selectedAsset &&
        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle>Bank Transfer Details</CardTitle>
            <CardDescription>
              Find you bank transfer details below.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {account.onrampBankAccount.case && <BankAccountComponent account={getOnRampBankAccount()}/>}
            <div className="w-full max-w-sm items-center">
              <Label htmlFor="holder">Account Holder</Label>
              {account.accountHolder &&
                <Input type="text" id="holder" placeholder="Account Holder" readOnly={true}
                       value={account.accountHolder}/>}
            </div>
            <div className="w-full max-w-sm items-center">
              <Label htmlFor="ref">Payment Reference</Label>
              {selectedAsset &&
                <Input type="text" id="ref" readOnly={true}
                       value={selectedAsset.onRamp?.paymentReference}/>}
            </div>
          </CardContent>
        </Card>}
    </div>
  </div>
)}

