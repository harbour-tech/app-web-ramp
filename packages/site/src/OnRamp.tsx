import {
  EstimateOnRampFeeRequest,
  EstimateOnRampFeeResponse,
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
} from '@/harbour/gen/ramp/v1/public_pb';

import { FunctionComponent, useEffect, useRef, useState } from 'react';
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
import { SmallLoader } from '@/components/LoadingSpinner';
import { AssetAndWallet, Wallet } from './components/AssetAndWallet';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import InfoSvg from '@/assets/info.svg?react';
import WarningIconSvg from '@/assets/warningIcon.svg?react';

export interface OnRampProps {
  account: GetAccountInfoResponse_Account;
  onAddWallet: (wallet: Wallet) => Promise<void>;
}

export const OnRamp: FunctionComponent<OnRampProps> = ({
  account,
  onAddWallet,
}) => {
  const [ammountInput, setAmmountInput] = useState<string>('0');
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

  const handleSelectWalletClick = (
    wallet: GetAccountInfoResponse_Wallet | undefined,
  ) => {
    if (!wallet) {
      setSelectedWallet(undefined);
      setOnRampAsset(undefined);
      return;
    }
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
    if (
      currency &&
      onRampAsset?.asset?.assetId &&
      Number(debounceAmmountInput)
    ) {
      setCountingFees(true);
      const requestParams = new EstimateOnRampFeeRequest({
        cryptoAssetId: onRampAsset.asset.assetId,
        protocol: onRampAsset.asset.protocol,
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
  }, [
    currency,
    onRampAsset?.asset?.assetId,
    onRampAsset?.asset?.protocol,
    debounceAmmountInput,
    rampClient,
  ]);

  const validateAmountFormat = (value: string) => {
    const regex = /^\d+(\.\d+)?$/;
    if (!regex.test(value)) {
      return 'Use only numbers and optionally one decimal point separator';
    }
    return null;
  };

  const bankAccountType =
    currency === 'GBP' ? 'instant Faster Payments' : 'SEPA Instant';

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        <div className="flex items-start justify-center gap-8 pt-4 w-full">
          <div className={`basis-1/3 ${!selectedWallet && 'min-w-[430px]'}`}>
            <AssetAndWallet
              assets={account?.cryptoAssets}
              onAssetSelected={handleSelectAsset}
              selectedAsset={selectedAsset}
              selectAssetDescription="Choose the asset you want to onramp:"
              selectWalletDescription="Choose the wallet you want to onramp the asset to:"
              wallets={account.wallets}
              selectedWallet={selectedWallet}
              onWalletSelected={handleSelectWalletClick}
              onAddWallet={onAddWallet}
              protocol={selectedAsset ? selectedAsset.protocol : undefined}
            />
          </div>

          {onRampAsset && (
            <>
              <div className="basis-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      Magic Ramp Details
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoSvg />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-80 p-3 pl-10 pr-5">
                          <ul className="list-disc">
                            <li className="mb-1">
                              Please only send {currency} to your Magic Ramp
                              Account.
                            </li>
                            <li className="mb-1">
                              Please only send from a bank account in your name.
                            </li>
                            <li className="mb-1">
                              If your bank supports {bankAccountType} your
                              wallet will be funded in a couple of minutes.
                            </li>
                            <li>
                              Note: Unsupported payments will be returned to
                              sender.
                            </li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </CardTitle>
                    <CardDescription>
                      This is your personal Magic Ramp Account. Send {currency}{' '}
                      to this account to receive USDC on the wallet you have
                      selected.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {account.onrampBankAccount.case && (
                      <BankAccountComponent
                        account={getOnRampBankAccount()}
                        withCopyToClipboard
                      />
                    )}
                    <div className="flex flex-col w-full items-start">
                      <Label htmlFor="holder">Account Holder</Label>
                      {account.accountHolder && (
                        <Input
                          type="text"
                          id="holder"
                          placeholder="Account Holder"
                          readOnly={true}
                          value={account.accountHolder}
                          withCopyToClipboard
                        />
                      )}
                    </div>
                    <div className="flex flex-col w-full items-start">
                      <Label htmlFor="ref">Payment Reference</Label>
                      {selectedAsset && (
                        <div className="flex items-center gap-4 w-full">
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
              </div>
              <div className="basis-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle className="relative">
                      <span className="w-full">Onramp Calculator</span>
                    </CardTitle>
                    <CardDescription>
                      {' '}
                      Use the calculator below to work out the current
                      conversion rate
                    </CardDescription>
                    <div className="flex items-center space-x-4 rounded-md border p-4 mt-5">
                      <WarningIconSvg />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          This product is currently in beta testing, please
                          transact with small amounts, up to 200 {currency}.
                        </p>
                      </div>
                    </div>
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
                      validate={validateAmountFormat}
                    />
                    <AmountInput
                      currency={'USDC'}
                      label="I will get:"
                      value={rampFeeResponse?.cryptoAssetAmount || 'N/A'}
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
                    {rampFeeResponse && (
                      <div className="flex flex-col gap-[10px]">
                        <p className="subtitle1 text-gray-50">
                          {currency}:USDC rate:{' '}
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
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
