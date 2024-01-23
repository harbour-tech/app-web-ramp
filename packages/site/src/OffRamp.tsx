import {
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
  IbanCoordinates,
  ScanCoordinates
} from "@/harbour/gen/ramp/v1/public_pb";
import React, {FunctionComponent, useState} from "react";
import {Wallet, Wallets} from "@/components/Wallets";
import {Assets} from "@/components/Assets";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {BankAccount as BankAccountComponent} from "@/components/BankAccount";
import BankAccount from "@/types/bankAccount";
import {WalletIcon} from "lucide-react";
import {ethers, parseUnits} from "ethers"
import Metamask from "@/assets/metamask.svg"

export interface OffRampProps {
  account: GetAccountInfoResponse_Account,
  onAddWallet: (wallet: Wallet) => Promise<void>
  onSaveBankAccount: (account: BankAccount) => void
}

export const OffRamp: FunctionComponent<OffRampProps> = (
  {account, onAddWallet, onSaveBankAccount}) => {
  const [selectedWallet, setSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined)
  const [selectedAsset, setSelectedAsset] = useState<GetAccountInfoResponse_Wallet_RampAsset | undefined>(undefined)
  const [amount, setAmount] = useState("5.43")

  async function handleTransfer() {
     const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner(selectedWallet!.address)

    const usdc = {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      abi: [
        "function balanceOf(address _owner) public view returns (uint256 balance)",
        "function transfer(address _to, uint256 _value) public returns (bool success)",
      ],
    };
    console.log(selectedAsset!.offRamp!.address)

    const usdcContract = new ethers.Contract(usdc.address, usdc.abi, signer);
    const xAmount = parseUnits(amount, 6);
    const tx = await usdcContract.transfer(selectedAsset!.offRamp!.address, xAmount, { /*gasPrice: 0*/  });
    const receipt = await tx.wait();
    console.log(receipt)
  }

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
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
              <Button className="w-full" onClick={() => onSaveBankAccount(bankAccount)}>Save</Button>
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
              Step 3: Just enter amount and confirm transaction with MetaMask.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <div className="w-full max-w-sm items-center">
                <Label htmlFor="amount">Amount {selectedAsset!.asset?.shortName}</Label>
                <Input type="text" id="amount" placeholder={`amount in ${selectedAsset!.asset?.shortName}`}
                       value={amount} onChange={handleAmountChange} disabled={false}/>
              </div>
              <div className="w-full max-w-sm items-center">
                <BankAccountComponent account={getOffRampBankAccount(account)}/>
              </div>
              <div>
                <Button className="w-full" onClick={handleTransfer} disabled={false}>
                  <img src={Metamask} className="mr-2 h-4 w-4"/>
                  Send with MetaMask
                </Button>
              </div>
          </CardContent>
          <CardFooter className="grid gap-4">
            <div className="relative m-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
              <div className="relative flex justify-center text-xs"><span
                className="bg-background px-2 text-muted-foreground">or</span></div>
            </div>

            <div className=" flex items-center space-x-4 rounded-md border p-4">
              <WalletIcon/>
              <div className="flex-1 space-y-1">
                {false && <p className="text-sm font-medium leading-none">
                  Push Notifications
                </p>}
                <p className="text-sm text-muted-foreground">
                  Alternatively send {selectedAsset!.asset?.shortName} from the <u>selected address</u> to the <u>following
                  address</u>.
                  Please note that transfers from other addresses will be bounced back, minus network fees.
                </p>
              </div>

            </div>
            <div className="w-full max-w-sm items-center">
              <Label htmlFor="address">Address</Label>
              <Input type="text" id="address" placeholder="address" readOnly={true}
                     value={selectedAsset.offRamp?.address}/>
            </div>
          </CardFooter>
        </Card>}
    </div>
    </>}
  </div>
  )
}

