import {
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
} from '@/harbour/gen/ramp/v1/public_pb';
import { FunctionComponent, useState } from 'react';
import { Wallet, Wallets } from '@/components/Wallets';
import { Assets } from '@/components/Assets';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { BankAccount as BankAccountComponent } from '@/components/BankAccount';
import { BankAccount } from '@/types/bankAccount';

export interface OnRampProps {
  account: GetAccountInfoResponse_Account;
  onAddWallet: (wallet: Wallet) => Promise<void>;
}

export const OnRamp: FunctionComponent<OnRampProps> = ({
  account,
  onAddWallet,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<
    GetAccountInfoResponse_Wallet | undefined
  >(undefined);
  const [selectedAsset, setSelectedAsset] = useState<
    GetAccountInfoResponse_CryptoAsset | undefined
  >(undefined);

  const [onRampAsset, setOnRampAsset] = useState<
    GetAccountInfoResponse_Wallet_RampAsset | undefined
  >(undefined);

  const handleSelectWalletClick = (wallet: GetAccountInfoResponse_Wallet) => {
    setSelectedWallet(wallet);
    const asset = wallet.assets.find(
      (ra) => ra.asset!.assetId == selectedAsset!.assetId,
    );
    setOnRampAsset(asset);
  };

  const handleSelectAsset = (asset: GetAccountInfoResponse_CryptoAsset) => {
    setSelectedAsset(asset);
    setSelectedWallet(undefined);
  };

  const getOnRampBankAccount = (): BankAccount => {
    switch (account.onrampBankAccount.case) {
      case 'onrampIban':
        return {
          case: 'iban',
          value: account.onrampBankAccount.value,
        };
      case 'onrampScan':
        return {
          case: 'scan',
          value: account.onrampBankAccount.value,
        };
      default:
        throw 'onramp bank account must be set!';
    }
  };
  const currency = {
    iban: 'EUR',
    scan: 'GBP',
  }[getOnRampBankAccount().case];

  return (
    <div className="flex items-start gap-8">
      <div className="basis-1/3">
        <Assets
          assets={account?.cryptoAssets}
          onSelected={handleSelectAsset}
          selected={selectedAsset}
          description="Step 2: Choose the asset you want to onramp"
        />
      </div>
      <div className="basis-1/3">
        {selectedAsset && (
          <Wallets
            protocol={selectedAsset.protocol}
            wallets={account.wallets}
            selectedWallet={selectedWallet}
            onWalletSelected={handleSelectWalletClick}
            onAddWallet={onAddWallet}
            description="Step 1: Choose the wallet you want to onramp assets to"
          />
        )}
      </div>

      <div className="basis-1/3">
        {onRampAsset && (
          <Card>
            <CardHeader>
              <CardTitle>Magic Ramp Details</CardTitle>
              <CardDescription>
                Step 3: Transfer {currency} to these details to receive{' '}
                {onRampAsset.asset!.shortName} on your selected wallet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {account.onrampBankAccount.case && (
                <BankAccountComponent account={getOnRampBankAccount()} />
              )}
              <div className="w-full max-w-sm items-center">
                <Label htmlFor="holder">Account Holder</Label>
                {account.accountHolder && (
                  <Input
                    type="text"
                    id="holder"
                    placeholder="Account Holder"
                    readOnly={true}
                    value={account.accountHolder}
                  />
                )}
              </div>
              <div className="w-full max-w-sm items-center">
                <Label htmlFor="ref">Payment Reference</Label>
                {selectedAsset && (
                  <div className="flex items-center gap-4">
                    <Input
                      type="text"
                      id="ref"
                      readOnly={true}
                      value={onRampAsset!.onRamp!.paymentReference}
                      withCopyToClipboard
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
