import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  EstimateOnRampFeeRequest,
  EstimateOnRampFeeResponse,
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
} from '@harbour/client/src/schema/gen/ramp/v1/public_pb';

import { useRampClient } from '@harbour/client';
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
import { AmountInput, AmountInputProps } from '@/components/ui/amountInput';
import { Note, NoteDescription, NoteTitle } from '@/components/ui/note';
import { useDebounce } from '@harbour/hooks';
import { toast } from 'react-toastify';
import { SmallLoader } from '@/components/LoadingSpinner';
import { AssetAndWallet } from './components/AssetAndWallet';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import InfoSvg from '@/assets/info.svg?react';
import WarningIcon from '@/assets/warningIcon';
import { Wallet } from '@/components/AddWallet';
import { amountInputFormatter } from './utils/amountInputFormatter';
import { getRampBankAccount } from './utils/getRampBankAccount';

export interface OnRampProps {
  account: GetAccountInfoResponse_Account;
  onAddWallet: (wallet: Wallet) => Promise<void>;
  onRampSelectedAsset: GetAccountInfoResponse_CryptoAsset | undefined;
  onRampSelectedWallet: GetAccountInfoResponse_Wallet | undefined;
  handleOnRampAssetSelected: (
    asset: GetAccountInfoResponse_CryptoAsset,
  ) => void;
  handleOnRampWalletSelected: (
    wallet: GetAccountInfoResponse_Wallet | undefined,
  ) => void;
}

export const OnRamp: FunctionComponent<OnRampProps> = ({
  account,
  onAddWallet,
  onRampSelectedAsset,
  onRampSelectedWallet,
  handleOnRampAssetSelected,
  handleOnRampWalletSelected,
}) => {
  const [calculatorAmountInput, setCalculatorAmountInput] =
    useState<string>('0');
  const debounceAmountInput = useDebounce(calculatorAmountInput, 400);
  const [countingFees, setCountingFees] = useState<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const rampClient = useRampClient();
  const [selectedWallet, setSelectedWallet] = useState<
    GetAccountInfoResponse_Wallet | undefined
  >(onRampSelectedWallet);
  const [selectedAsset, setSelectedAsset] = useState<
    GetAccountInfoResponse_CryptoAsset | undefined
  >(onRampSelectedAsset);
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
    handleOnRampWalletSelected(wallet);
    const asset = wallet.assets.find(
      (ra) => ra.asset!.assetId == selectedAsset!.assetId,
    );
    setOnRampAsset(asset);
  };

  const handleSelectAsset = (asset: GetAccountInfoResponse_CryptoAsset) => {
    setSelectedAsset(asset);
    setSelectedWallet(undefined);
    handleOnRampAssetSelected(asset);
    handleOnRampWalletSelected(undefined);
  };

  const bankAccount = getRampBankAccount(account);

  const currency = bankAccount.case === 'iban' ? 'EUR' : 'GBP';

  const bankAccountType =
    currency === 'GBP' ? 'instant Faster Payments' : 'SEPA Instant';

  useEffect(() => {
    if (
      currency &&
      onRampAsset?.asset?.assetId &&
      Number(debounceAmountInput)
    ) {
      setCountingFees(true);
      const requestParams = new EstimateOnRampFeeRequest({
        cryptoAssetId: onRampAsset.asset.assetId,
        protocol: onRampAsset.asset.protocol,
        amount: {
          value: debounceAmountInput,
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
          toast.error('Something went wrong. Please try again later.');
          setRampFeeResponse(undefined);
        })
        .finally(() => {
          setCountingFees(false);
        });
    }
  }, [
    currency,
    onRampAsset?.asset?.assetId,
    onRampAsset?.asset?.protocol,
    debounceAmountInput,
    rampClient,
  ]);

  useEffect(() => {
    if (selectedAsset && selectedWallet) {
      const asset = selectedWallet.assets.find(
        (ra) => ra.asset!.assetId == selectedAsset!.assetId,
      );
      setOnRampAsset(asset);
    }
  }, [selectedAsset, selectedWallet]);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        <div className="flex items-start justify-center gap-8 pt-4 w-full flex-wrap">
          <div
            className={`flex-shrink-0 flex-grow basis-[300px] ${
              !selectedWallet && 'min-w-[430px]'
            } ${!onRampAsset && 'max-w-[33%]'}`}
          >
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
              <div className="flex-shrink-0 flex-grow basis-[300px]">
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
                        account={bankAccount}
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
                    <div className="flex items-center space-x-4 rounded-md border p-4 mt-5">
                      <WarningIcon />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          Please ensure the payment reference is correct so we
                          know exactly which stablecoin you wish to buy. A wrong
                          reference will lead to rejected payments.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="basis-[300px] flex-shrink-0 flex-grow">
                <Card>
                  <CardHeader>
                    <CardTitle className="relative">
                      <span className="w-full">On Ramp Calculator</span>
                    </CardTitle>
                    <CardDescription>
                      {' '}
                      Use the calculator below to work out the current
                      conversion rate
                    </CardDescription>
                    <div className="flex items-center space-x-4 rounded-md border p-4 mt-5">
                      <WarningIcon />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
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
                      label="SEND:"
                      value={calculatorAmountInput}
                      onChange={(event) =>
                        amountInputFormatter(event, setCalculatorAmountInput)
                      }
                      onFocus={() =>
                        calculatorAmountInput === '0'
                          ? setCalculatorAmountInput('')
                          : null
                      }
                      onBlur={() =>
                        calculatorAmountInput === ''
                          ? setCalculatorAmountInput('0')
                          : null
                      }
                    />
                    <AmountInput
                      currency={'USDC'}
                      label="RECEIVE:"
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
                          {currency}/USDC rate:{' '}
                          {countingFees
                            ? SmallLoader
                            : rampFeeResponse?.exchangeRate || 'unknown'}
                        </p>
                        <p className="subtitle1 text-gray-50">
                          Esimated network fees:{' '}
                          {countingFees ? (
                            SmallLoader
                          ) : (
                            <>
                              {rampFeeResponse?.networkFeeAmount || 'unknown'}{' '}
                              {currency}
                            </>
                          )}
                        </p>
                        <p className="subtitle1 text-gray-50">
                          Processing fees:{' '}
                          {countingFees ? (
                            SmallLoader
                          ) : (
                            <>
                              {rampFeeResponse?.processingFeeAmount ||
                                'unknown'}{' '}
                              {currency}
                            </>
                          )}
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
