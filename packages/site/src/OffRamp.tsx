import { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  EstimateOffRampFeeRequest,
  EstimateOffRampFeeResponse,
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
  IbanCoordinates,
  Network,
  ScanCoordinates,
} from '@harbour/client/src/schema/gen/ramp/v1/public_pb';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BankAccount as BankAccountComponent } from '@/components/BankAccount';
import { BankAccountWithIcon } from '@/components/BankAccountWithEditIcon';
import { BankAccount, useRampClient } from '@harbour/client';
import { WalletIcon } from 'lucide-react';
import { ethers, parseUnits } from 'ethers';
import Metamask from '@/assets/metamask.svg';
import { toast } from 'react-toastify';
import {
  AVALANCHE_FUJI_PARAMS,
  AVALANCHE_MAINNET_PARAMS,
  Erc20Token,
  ETHEREUM_MAINNET_PARAMS,
  ETHERUM_TESTNET_SEPOLIA_PARAMS,
  NetworkParams,
  POLYGON_AMOY_PARAMS,
  POLYGON_MAINNET_PARAMS,
  requestAccounts,
  switchNetwork,
} from '@/utils';
import { AssetAndWallet } from './components/AssetAndWallet';
import { AmountInput, AmountInputProps } from '@/components/ui/amountInput';
import { useDebounce } from '@harbour/hooks';
import { Note, NoteDescription, NoteTitle } from '@/components/ui/note';
import { LoadingSpinner, SmallLoader } from '@/components/LoadingSpinner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import InfoSvg from '@/assets/info.svg?react';
import { TransactionProcessingSpinner } from '@/components/TransactionProcessingSpinner';
import WarningIcon from '@/assets/warningIcon';
import { handle32002 } from '@/lib/utils';
import { Wallet } from '@/components/AddWallet';
import { inputFormatter } from './utils/inputFormatter';
import { getRampBankAccount } from './utils/getRampBankAccount';

export interface OffRampProps {
  account: GetAccountInfoResponse_Account;
  onAddWallet: (wallet: Wallet) => Promise<void>;
  onSaveBankAccount: (account: BankAccount) => void;
  changingBankAccountFailed: boolean | string;
  offRampSelectedAsset: GetAccountInfoResponse_CryptoAsset | undefined;
  offRampSelectedWallet: GetAccountInfoResponse_Wallet | undefined;
  handleOffRampAssetSelected: (
    asset: GetAccountInfoResponse_CryptoAsset,
  ) => void;
  handleOffRampWalletSelected: (
    wallet: GetAccountInfoResponse_Wallet | undefined,
  ) => void;
}

export const OffRamp: FunctionComponent<OffRampProps> = ({
  account,
  onAddWallet,
  onSaveBankAccount,
  changingBankAccountFailed,
  offRampSelectedAsset,
  offRampSelectedWallet,
  handleOffRampAssetSelected,
  handleOffRampWalletSelected,
}) => {
  const rampClient = useRampClient();
  const [networkSwitchInProgress, setNetworkSwitchInProgress] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountInput, setAmountInput] = useState<string>('0');
  const debounceAmountInput = useDebounce(amountInput, 400);
  const [countingFees, setCountingFees] = useState<boolean>(false);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [selectedWallet, setSelectedWallet] = useState<
    GetAccountInfoResponse_Wallet | undefined
  >(offRampSelectedWallet);
  const [selectedAsset, setSelectedAsset] = useState<
    GetAccountInfoResponse_CryptoAsset | undefined
  >(offRampSelectedAsset);
  const [offRampAsset, setOffRampAsset] = useState<
    GetAccountInfoResponse_Wallet_RampAsset | undefined
  >(undefined);
  const [rampFeeResponse, setRampFeeResponse] = useState<
    EstimateOffRampFeeResponse | undefined
  >();

  const handleSwitchNetworkError = () => {
    toast.error('There was a problem with switching the network');
  };

  async function handleTransfer() {
    setNetworkSwitchInProgress(true);
    let switchNetworkResult: boolean | undefined | void = false;
    const provider = new ethers.BrowserProvider(window.ethereum);

    if (offRampAsset?.asset?.details.case != 'ethereumErc20Token') {
      throw `unsupported token: ${offRampAsset?.asset?.details.case}`;
    }

    const erc20Asset: Erc20Token = {
      address: offRampAsset?.asset?.details.value.tokenAddress,
      abi: [
        'function balanceOf(address _owner) public view returns (uint256 balance)',
        'function transfer(address _to, uint256 _value) public returns (bool success)',
      ],
    };
    let networkParams: NetworkParams;
    switch (offRampAsset?.asset?.network) {
      case Network.ETHEREUM_MAINNET:
        networkParams = ETHEREUM_MAINNET_PARAMS;
        break;
      case Network.AVAX_C_MAINNET:
        networkParams = AVALANCHE_MAINNET_PARAMS;
        break;
      case Network.AVAX_FUJI:
        networkParams = AVALANCHE_FUJI_PARAMS;
        break;
      case Network.POLYGON_MAINNET:
        networkParams = POLYGON_MAINNET_PARAMS;
        break;
      case Network.POLYGON_AMOY:
        networkParams = POLYGON_AMOY_PARAMS;
        break;
      case Network.ETHEREUM_SEPOLIA:
        networkParams = ETHERUM_TESTNET_SEPOLIA_PARAMS;
        break;
      default:
        toast.error('Something went wrong during network switch');
        setNetworkSwitchInProgress(false);
        throw `unsupported network: ${offRampAsset?.asset?.network}`;
    }

    switchNetworkResult = await switchNetwork(networkParams).catch(
      handleSwitchNetworkError,
    );

    if (switchNetworkResult !== true) {
      setNetworkSwitchInProgress(false);
      return;
    }

    if (!(await provider.hasSigner(selectedWallet!.address))) {
      await requestAccounts().catch((_e) => {
        setNetworkSwitchInProgress(false); //this catch need to be in place, we want to fail silently
      });
      if (!(await provider.hasSigner(selectedWallet!.address))) {
        toast.error(`No access to account ${selectedWallet!.address}`);
        setNetworkSwitchInProgress(false);
        throw '';
      }
    }

    const signer = await provider
      .getSigner(selectedWallet!.address)
      .catch((e) => {
        setNetworkSwitchInProgress(false);
        if (e?.error?.code === -32002) {
          handle32002();
          throw e;
        }
        if (e?.code === 'ACTION_REJECTED') {
          toast.error('User rejected the request');
          throw e;
        }
        toast.error('Failed to connect to MetaMask signer');
        throw e;
      });

    setNetworkSwitchInProgress(false);

    const usdcContract = new ethers.Contract(
      erc20Asset.address,
      erc20Asset.abi,
      signer,
    );
    setIsProcessingTransfer(true);
    const xAmount = parseUnits(amount, 6);
    await usdcContract
      .transfer(offRampAsset!.offRamp!.address, xAmount, {
        /*gasPrice: 0*/
      })
      .then(() => {
        setIsProcessingTransfer(false);
        toast.success('Success, transaction sent');
      })
      .catch((err) => {
        setIsProcessingTransfer(false);
        if (err.reason) {
          if (err.reason.includes('amount exceeds balance')) {
            toast.error('Insuficient balance on MetaMask account');
          } else {
            toast.error(
              `Error sending with MetaMask: ${err.reason || 'unknown'}`,
            );
          }
        } else {
          toast.error(
            `Error sending with MetaMask: ${err.message || 'unknown'}`,
          );
        }
      });
    setAmount('');
  }

  const handleSelectAsset = (asset: GetAccountInfoResponse_CryptoAsset) => {
    setSelectedAsset(asset);
    handleOffRampAssetSelected(asset);
    setSelectedWallet(undefined);
    handleOffRampWalletSelected(undefined);
    setAmount('');
  };

  const handleSelectWalletClick = (
    wallet: GetAccountInfoResponse_Wallet | undefined,
  ) => {
    if (!wallet) {
      setSelectedWallet(undefined);
      setOffRampAsset(undefined);
      return;
    }
    setSelectedWallet(wallet);
    handleOffRampWalletSelected(wallet);
    const asset = wallet.assets.find(
      (ra) => ra.asset!.assetId == selectedAsset!.assetId,
    );
    setOffRampAsset(asset);
  };
  const needSetBankAccount = !account.offrampBankAccount.case;

  const [bankAccount, setBankAccount] = useState<BankAccount>(
    getRampBankAccount(account),
  );

  const currency = {
    iban: 'EUR',
    scan: 'GBP',
  }[getRampBankAccount(account).case];

  useEffect(() => {
    if (
      currency &&
      offRampAsset?.asset?.assetId &&
      Number(debounceAmountInput)
    ) {
      setCountingFees(true);
      const requestParams = new EstimateOffRampFeeRequest({
        cryptoAssetId: offRampAsset?.asset?.assetId,
        protocol: offRampAsset.asset.protocol,
        amount: {
          value: debounceAmountInput,
          case: 'cryptoAssetAmount',
        },
      });
      rampClient
        .estimateOffRampFee(requestParams)
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
    rampClient,
    offRampAsset?.asset?.shortName,
    offRampAsset?.asset?.assetId,
    offRampAsset?.asset?.protocol,
    debounceAmountInput,
  ]);

  const onChangeBankAccount = (account: BankAccount) => {
    setBankAccount(account);
  };

  const updateBankAccount = (account: BankAccount) => {
    setBankAccount(account);
    onSaveBankAccount(account);
  };

  const bankAccountType =
    currency === 'GBP' ? 'instant Faster Payments' : 'SEPA Instant';

  useEffect(() => {
    if (selectedAsset && selectedWallet) {
      const asset = selectedWallet.assets.find(
        (ra) => ra.asset!.assetId == selectedAsset!.assetId,
      );
      setOffRampAsset(asset);
    }
  }, [selectedAsset, selectedWallet]);

  return (
    <TooltipProvider>
      {isProcessingTransfer && <TransactionProcessingSpinner />}
      <div className="flex items-start justify-center gap-8 mb-10">
        {needSetBankAccount && (
          <>
            <div className="basis-1/3 grid gap-4"></div>
            <div className="basis-1/3 grid gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Setup your bank account</CardTitle>
                  <CardDescription>
                    Set bank account you want your funds to be transferred to.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <BankAccountComponent
                    account={bankAccount}
                    onChange={onChangeBankAccount}
                    error={changingBankAccountFailed}
                  />
                  <div>
                    <Button
                      className="w-full"
                      onClick={() => onSaveBankAccount(bankAccount)}
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="basis-1/3 grid gap-4"></div>
          </>
        )}
        {account.offrampBankAccount.case && (
          <div className="flex flex-col items-center w-full">
            <div className="flex items-start justify-center gap-8 pt-4 w-full flex-wrap">
              <div
                className={`basis-[300px] flex-shrink-0 flex-grow ${
                  !selectedWallet && 'min-w-[430px]'
                } ${!offRampAsset && 'max-w-[33%]'}`}
              >
                <AssetAndWallet
                  assets={account?.cryptoAssets}
                  onAssetSelected={handleSelectAsset}
                  selectedAsset={selectedAsset}
                  selectAssetDescription="Choose the asset you want to offramp:"
                  selectWalletDescription="Choose the wallet you want to offramp the asset from:"
                  wallets={account.wallets}
                  selectedWallet={selectedWallet}
                  onWalletSelected={handleSelectWalletClick}
                  onAddWallet={onAddWallet}
                  protocol={selectedAsset ? selectedAsset.protocol : undefined}
                />
              </div>
              {offRampAsset && (
                <>
                  <div className="basis-[300px] flex-shrink-0 flex-grow">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex justify-between">
                          Transaction Details
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoSvg />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-80 p-3 pl-10 pr-5">
                              <ul className="list-disc">
                                <li className="mb-1">
                                  If your bank supports {bankAccountType} your
                                  account will be funded in a couple of minutes.
                                </li>
                                <li className="mb-1">
                                  We strongly recommend using our app to sign
                                  the transaction. If you manually send an asset
                                  we don't support, we may not be able to
                                  recover it, or the process may be subject to
                                  delays and additional fees.
                                </li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </CardTitle>
                        <CardDescription>
                          Just enter amount and confirm transaction with
                          MetaMask.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col w-full items-start mb-3">
                          <Label htmlFor="amount">
                            Amount of USDC to offramp
                          </Label>
                          <Input
                            type="text"
                            id="amount"
                            value={amount}
                            onChange={(event) =>
                              inputFormatter(event, setAmount)
                            }
                            disabled={false}
                          />
                        </div>
                        <CardDescription>
                          Receive {currency} on:
                        </CardDescription>
                        <div className="w-full items-center">
                          <BankAccountWithIcon
                            key={bankAccount.value.toString()}
                            account={getRampBankAccount(account)}
                            onChange={updateBankAccount}
                            error={changingBankAccountFailed}
                          />
                        </div>
                        <p className="subtitle1 text-gray-50 mt-4">
                          You can only offramp to a bank account in your name.
                        </p>
                        <div>
                          {networkSwitchInProgress ? (
                            <Button className="w-full mt-4 gap-2" disabled>
                              <LoadingSpinner /> Accept in MetaMask
                            </Button>
                          ) : (
                            <Button
                              className="w-full mt-4"
                              onClick={handleTransfer}
                              disabled={
                                Number(amount) === 0 ||
                                amount === null ||
                                !!changingBankAccountFailed
                              }
                            >
                              <img src={Metamask} className="mr-2 h-4 w-4" />
                              Sign with MetaMask
                            </Button>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="grid gap-4">
                        <div className="flex items-center">
                          <div className="w-full h-px bg-muted-foreground" />
                          <span className="px-2 text-muted-foreground">or</span>
                          <div className="w-full h-px bg-muted-foreground" />
                        </div>

                        <div className="flex items-center space-x-4 rounded-md border p-4">
                          <WalletIcon />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Alternatively send USDC from a{' '}
                              <u>whitelisted address</u> to the{' '}
                              <u>Magic Ramp address</u>. Please note that
                              transfers from other addresses will be bounced
                              back, minus network fees.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col w-full items-start">
                          <Label htmlFor="address">
                            Magic Ramp address for USDC
                          </Label>
                          <div className="flex items-center gap-4"></div>
                          <Input
                            type="text"
                            id="address"
                            placeholder="address"
                            readOnly
                            value={offRampAsset.offRamp?.address}
                            withCopyToClipboard
                          />
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                  <div className="basis-[300px] flex-shrink-0 flex-grow">
                    <Card>
                      <CardHeader>
                        <CardTitle className="relative">
                          <span className="w-full">Off Ramp Calculator</span>
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
                          currency={'USDC'}
                          label="SEND:"
                          value={amountInput}
                          onChange={(event) =>
                            inputFormatter(event.target.value, setAmountInput)
                          }
                          onFocus={() =>
                            amountInput === '0' ? setAmountInput('') : null
                          }
                          onBlur={() =>
                            amountInput === '' ? setAmountInput('0') : null
                          }
                        />
                        <AmountInput
                          currency={currency as AmountInputProps['currency']}
                          label="RECEIVE:"
                          value={rampFeeResponse?.fiatAssetAmount || 'N/A'}
                          disabled
                          isLoading={countingFees}
                        />
                        <Note>
                          <NoteTitle>Note</NoteTitle>
                          <NoteDescription>
                            The actual amount will depend on the exchange rate
                            and network fee at the moment of receiving the
                            payment.
                          </NoteDescription>
                        </Note>
                        {rampFeeResponse && (
                          <div className="flex flex-col gap-[10px]">
                            <p className="subtitle1 text-gray-50">
                              USDC/{currency} rate:{' '}
                              {countingFees
                                ? SmallLoader
                                : rampFeeResponse?.exchangeRate || 'unknown'}
                            </p>
                            <p className="subtitle1 text-gray-50">
                              Processing fees:{' '}
                              {countingFees
                                ? SmallLoader
                                : rampFeeResponse?.processingFeeAmount ||
                                  'unknown'}{' '}
                              {currency}
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
        )}
      </div>
    </TooltipProvider>
  );
};
