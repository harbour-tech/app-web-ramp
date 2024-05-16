import {
  AssetId,
  EstimateOnRampFeeRequest,
  EstimateOnRampFeeResponse,
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
  Protocol,
} from '@/harbour/gen/ramp/v1/public_pb';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Wallet, Wallets } from '@/components/Wallets';
import { Assets } from '@/components/Assets';
import { useRampClient } from '@/contexts';
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
import { AmountInput, AmountInputProps } from '@/components/ui/amountInput';
import { Note, NoteDescription, NoteTitle } from '@/components/ui/note';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export interface OnRampProps {
  account: GetAccountInfoResponse_Account;
  onAddWallet: (wallet: Wallet) => Promise<void>;
}

const SmallLoader = (
  <LoadingSpinner className="inline-block mt-[-4px]" height={18} width={18} />
);

export const OnRamp: FunctionComponent<OnRampProps> = ({
  account,
  onAddWallet,
}) => {
  const [ammountInput, setAmmountInput] = useState<string>('');
  const debounceAmmountInput = useDebounce(ammountInput, 900);
  const [countingFees, setCountingFees] = useState<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const rampClient = useRampClient();
  const [selectedWallet, setSelectedWallet] = useState<
    GetAccountInfoResponse_Wallet | undefined
  >(undefined);
  const [selectedAsset, setSelectedAsset] = useState<
    GetAccountInfoResponse_CryptoAsset | undefined
  >(undefined);
  const [rampFeeResponse, setRampFeeResponse] =
    useState<EstimateOnRampFeeResponse>();

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

  useEffect(() => {
    if (currency && onRampAsset?.asset?.shortName && debounceAmmountInput) {
      setCountingFees(true);
      const requestParams = new EstimateOnRampFeeRequest({
        cryptoAssetId: AssetId.USDC,
        protocol: Protocol.AVAX,
        amount: {
          value: debounceAmmountInput,
          case: 'fiatAssetAmount',
        },
      });
      rampClient
        .estimateOnRampFee(requestParams)
        .then((res) => {
          setCountingFees(false);
          setRampFeeResponse(res);
        })
        .catch((_err) => {
          toast.error('Failed to estimate onramp fees');
        });
    }
  }, [currency, onRampAsset?.asset?.shortName, debounceAmmountInput]);

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
          <>
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
            <Card>
              <CardHeader>
                <CardTitle>Onramp Calculator</CardTitle>
                <CardDescription>
                  {' '}
                  Use the calculator below to work out the current conversion
                  rate
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-[10px]">
                <AmountInput
                  ref={firstInputRef}
                  onClick={() => firstInputRef.current?.focus()}
                  currency={currency as AmountInputProps['currency']}
                  label="I SEND:"
                  value={ammountInput}
                  onChange={(event) => setAmmountInput(event.target.value)}
                  onFocus={() =>
                    ammountInput === '0' ? setAmmountInput('') : null
                  }
                />
                <AmountInput
                  currency={
                    onRampAsset.asset?.shortName as AmountInputProps['currency']
                  }
                  label="I will get:"
                  value={rampFeeResponse?.cryptoAssetAmount || '0'}
                  disabled
                  isLoading={countingFees}
                />
                <Note>
                  <NoteTitle>Note</NoteTitle>
                  <NoteDescription>
                    The actual amount will depend on the exchange rate and
                    network fee at the moment of receiving the payment.
                  </NoteDescription>
                </Note>
                <div className="flex flex-col gap-[10px]">
                  <p className="subtitle1 text-gray-50">
                    {currency}:{onRampAsset.asset?.shortName} rate:{' '}
                    {countingFees
                      ? SmallLoader
                      : rampFeeResponse?.exchangeRate || 'unknown'}
                  </p>
                  <p className="subtitle1 text-gray-50">
                    Esimated network fees:{' '}
                    {countingFees
                      ? SmallLoader
                      : rampFeeResponse?.networkFeeAmount || 'unknown'}
                  </p>
                  <p className="subtitle1 text-gray-50">
                    Processing fees:{' '}
                    {countingFees
                      ? SmallLoader
                      : rampFeeResponse?.processingFeeAmount || 'unknown'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
