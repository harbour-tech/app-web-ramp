import {
  GetAccountInfoResponse_Account,
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
  GetAccountInfoResponse_Wallet_RampAsset,
  IbanCoordinates,
  Network,
  ScanCoordinates,
} from '@/harbour/gen/ramp/v1/public_pb';
import React, { FunctionComponent, useState } from 'react';
import { Wallet, Wallets } from '@/components/Wallets';
import { Assets } from '@/components/Assets';
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
import BankAccount from '@/types/bankAccount';
import { WalletIcon } from 'lucide-react';
import { ethers, parseUnits } from 'ethers';
import Metamask from '@/assets/metamask.svg';
import { toast } from 'react-toastify';
import {
  AVALANCHE_FUJI_PARAMS,
  AVALANCHE_MAINNET_PARAMS,
  Erc20Token,
  ETHEREUM_MAINNET_PARAMS,
  POLYGON_AMOY_PARAMS,
  POLYGON_MAINNET_PARAMS,
  requestAccounts,
  switchNetwork,
} from '@/utils';

export interface OffRampProps {
  account: GetAccountInfoResponse_Account;
  onAddWallet: (wallet: Wallet) => Promise<void>;
  onSaveBankAccount: (account: BankAccount) => void;
}

export const OffRamp: FunctionComponent<OffRampProps> = ({
  account,
  onAddWallet,
  onSaveBankAccount,
}) => {
  const [selectedWallet, setSelectedWallet] = useState<
    GetAccountInfoResponse_Wallet | undefined
  >(undefined);
  const [selectedAsset, setSelectedAsset] = useState<
    GetAccountInfoResponse_CryptoAsset | undefined
  >(undefined);
  const [offRampAsset, setOffRampAsset] = useState<
    GetAccountInfoResponse_Wallet_RampAsset | undefined
  >(undefined);
  const [amount, setAmount] = useState('0');

  const handleSwitchNetworkError = () => {
    toast.error('There was problem with switching newtork');
  };

  async function handleTransfer() {
    const provider = new ethers.BrowserProvider(window.ethereum);

    let erc20Asset: Erc20Token;
    switch (offRampAsset?.asset?.network) {
      case Network.ETHEREUM_MAINNET:
        await switchNetwork(ETHEREUM_MAINNET_PARAMS).catch(
          handleSwitchNetworkError,
        );
        erc20Asset = {
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          abi: [
            'function balanceOf(address _owner) public view returns (uint256 balance)',
            'function transfer(address _to, uint256 _value) public returns (bool success)',
          ],
        };
        break;
      case Network.AVAX_C_MAINNET:
        await switchNetwork(AVALANCHE_MAINNET_PARAMS).catch(
          handleSwitchNetworkError,
        );
        erc20Asset = {
          address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
          abi: [
            'function balanceOf(address _owner) public view returns (uint256 balance)',
            'function transfer(address _to, uint256 _value) public returns (bool success)',
          ],
        };
        break;
      case Network.AVAX_FUJI:
        await switchNetwork(AVALANCHE_FUJI_PARAMS).catch(
          handleSwitchNetworkError,
        );
        erc20Asset = {
          address: '0x5425890298aed601595a70AB815c96711a31Bc65',
          abi: [
            'function balanceOf(address _owner) public view returns (uint256 balance)',
            'function transfer(address _to, uint256 _value) public returns (bool success)',
          ],
        };
        break;
      case Network.POLYGON_MAINNET:
        await switchNetwork(POLYGON_MAINNET_PARAMS).catch(
          handleSwitchNetworkError,
        );
        erc20Asset = {
          address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
          abi: [
            'function balanceOf(address _owner) public view returns (uint256 balance)',
            'function transfer(address _to, uint256 _value) public returns (bool success)',
          ],
        };
        break;
      case Network.POLYGON_AMOY:
        await switchNetwork(POLYGON_AMOY_PARAMS).catch(
          handleSwitchNetworkError,
        );
        erc20Asset = {
          address: '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582',
          abi: [
            'function balanceOf(address _owner) public view returns (uint256 balance)',
            'function transfer(address _to, uint256 _value) public returns (bool success)',
          ],
        };
        break;
      default:
        throw `unsupported network: ${offRampAsset?.asset?.network}`;
    }

    if (!(await provider.hasSigner(selectedWallet!.address))) {
      await requestAccounts();
      if (!(await provider.hasSigner(selectedWallet!.address))) {
        alert(`No access to account ${selectedWallet!.address}`);
        throw '';
      }
    }

    const signer = await provider
      .getSigner(selectedWallet!.address)
      .catch((e) => {
        if (e?.error?.code === -32002) {
          alert(
            'There is pending request to connect to MetaMask, please approve/reject it first by clicking on the MetaMask extension icon.',
          );
          throw e;
        }
        if (e?.code === 'ACTION_REJECTED') {
          toast.error('User rejected the request');
          throw e;
        }
        toast.error('Failed to connect to MetaMask signer');
        throw e;
      });

    const usdcContract = new ethers.Contract(
      erc20Asset.address,
      erc20Asset.abi,
      signer,
    );
    const xAmount = parseUnits(amount, 6);
    await usdcContract
      .transfer(offRampAsset!.offRamp!.address, xAmount, {
        /*gasPrice: 0*/
      })
      .then(() => {
        toast.success('Success, transaction sent');
      })
      .catch((err) => {
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
    setAmount('0');
  }

  const handleSelectAsset = (asset: GetAccountInfoResponse_CryptoAsset) => {
    setSelectedAsset(asset);
    setSelectedWallet(undefined);
  };

  const handleSelectWalletClick = (wallet: GetAccountInfoResponse_Wallet) => {
    setSelectedWallet(wallet);
    const asset = wallet.assets.find(
      (ra) => ra.asset!.assetId == selectedAsset!.assetId,
    );
    setOffRampAsset(asset);
  };
  const needSetBankAccount = !account.offrampBankAccount.case;

  const getOffRampBankAccount = (
    acc: GetAccountInfoResponse_Account,
  ): BankAccount => {
    switch (acc.offrampBankAccount.case) {
      case 'offrampIban':
        return {
          case: 'iban',
          value: acc.offrampBankAccount.value,
        };
      case 'offrampScan':
        return {
          case: 'scan',
          value: acc.offrampBankAccount.value,
        };
      case undefined:
        switch (acc.onrampBankAccount.case) {
          case 'onrampIban':
            return {
              case: 'iban',
              value: new IbanCoordinates(),
            };
          case 'onrampScan':
            return {
              case: 'scan',
              value: new ScanCoordinates(),
            };
          default:
            throw 'onramp bank account must always be set!';
        }
    }
  };
  const [bankAccount, setBankAccount] = useState<BankAccount>(
    getOffRampBankAccount(account),
  );

  const currency = {
    iban: 'EUR',
    scan: 'GBP',
  }[getOffRampBankAccount(account).case];

  const onChangeBankAccount = (account: BankAccount) => {
    setBankAccount(account);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const validateAmountFormat = (value: string) => {
    const regex = /^\d+(\.\d+)?$/;
    if (!regex.test(value)) {
      return 'Use only numbers and optionally one decimal point separator';
    }
    return null;
  };

  return (
    <div className="flex items-start gap-8">
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
        <>
          <div className="basis-1/3">
            <Assets
              assets={account.cryptoAssets}
              onSelected={handleSelectAsset}
              selected={selectedAsset}
              description="Step 2: Choose the asset and chain you want to offramp"
            />
          </div>
          <div className="basis-1/3 grid gap-4">
            {selectedAsset && (
              <Wallets
                protocol={selectedAsset.protocol}
                wallets={account.wallets}
                selectedWallet={selectedWallet}
                onWalletSelected={handleSelectWalletClick}
                onAddWallet={onAddWallet}
                description="Step 1: Choose the wallet you want to offramp assets from"
              />
            )}
          </div>
          <div className="basis-1/3">
            {offRampAsset && (
              <Card>
                <CardHeader>
                  <CardTitle>Crypto Transactions Details</CardTitle>
                  <CardDescription>
                    Step 3: Just enter amount and confirm transaction with
                    MetaMask.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-sm items-center">
                    <Label htmlFor="amount">
                      Amount {offRampAsset!.asset?.shortName}
                    </Label>
                    <Input
                      type="text"
                      id="amount"
                      placeholder={`amount in ${
                        offRampAsset!.asset?.shortName
                      }`}
                      value={amount}
                      onChange={handleAmountChange}
                      disabled={false}
                      validate={validateAmountFormat}
                    />
                  </div>
                  <CardDescription>Receive {currency} on:</CardDescription>
                  <div className="w-full max-w-sm items-center">
                    <BankAccountComponent
                      account={getOffRampBankAccount(account)}
                      withEditButton
                      onEditButtonClick={() =>
                        toast.info(
                          'Bank account editing disabled during beta testing.',
                        )
                      }
                    />
                  </div>
                  <div>
                    <Button
                      className="w-full mt-4"
                      onClick={handleTransfer}
                      disabled={false}
                    >
                      <img src={Metamask} className="mr-2 h-4 w-4" />
                      Sign with MetaMask
                    </Button>
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
                      {false && (
                        <p className="text-sm font-medium leading-none">
                          Push Notifications
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Alternatively send {offRampAsset!.asset?.shortName} from
                        a <u>whitelisted address</u> to the{' '}
                        <u>Magic Ramp address</u>. Please note that transfers
                        from other addresses will be bounced back, minus network
                        fees.
                      </p>
                    </div>
                  </div>
                  <div className="flex-row w-full max-w-sm items-center">
                    <Label htmlFor="address">
                      Magic Ramp address for {offRampAsset.asset?.shortName}
                    </Label>
                    <div className="flex items-center gap-4"></div>
                    <Input
                      type="text"
                      id="address"
                      placeholder="address"
                      readOnly={true}
                      value={offRampAsset.offRamp?.address}
                      withCopyToClipboard
                    />
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};
