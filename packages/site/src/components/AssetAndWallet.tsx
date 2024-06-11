import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GetAccountInfoResponse_Wallet,
  Protocol,
} from '@/harbour/gen/ramp/v1/public_pb';
import { requestAccounts } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import {
  SelectWallet,
  SelectWalletContent,
  SelectWalletItem,
  SelectWalletTrigger,
  SelectWalletValue,
} from './ui/selectWallet';
import CryptoNetworkLogo_Avalanche from '@/assets/cryptoNetworkLogo_Avalanche.svg';
import CryptoNetworkLogo_Ethereum from '@/assets/cryptoNetworkLogo_Ethereum.svg';
import CryptoNetworkLogo_Polygon from '@/assets/cryptoNetworkLogo_Polygon.svg';
import CryptoNetworkLogo_Terra from '@/assets/cryptoNetworkLogo_Terra.svg';
import WalletIcon from '@/assets/walletIcon.svg';
import AssetSymbolIcon_USDC from '@/assets/assetSymbolIcon_USDC.svg';
import MoneyIcon from '@/assets/moneyIcon.svg';

import {
  AssetId,
  GetAccountInfoResponse_CryptoAsset,
} from '@/harbour/gen/ramp/v1/public_pb';
import {
  SelectAsset,
  SelectAssetContent,
  SelectAssetItem,
  SelectAssetTrigger,
  SelectAssetValue,
} from './ui/selectAsset';
import MetaMaskLogo from '@/assets/metamask.svg';
import { handle32002 } from '@/lib/utils';

export interface AssetAndWalletProps {
  protocol: Protocol | undefined;
  wallets: GetAccountInfoResponse_Wallet[];
  selectedWallet?: GetAccountInfoResponse_Wallet;
  onWalletSelected: (wallet: GetAccountInfoResponse_Wallet | undefined) => void;
  onAddWallet: (wallet: Wallet) => Promise<void>;
  assets: GetAccountInfoResponse_CryptoAsset[];
  selectedAsset?: GetAccountInfoResponse_CryptoAsset;
  onAssetSelected: (asset: GetAccountInfoResponse_CryptoAsset) => void;
  selectAssetDescription: string;
  selectWalletDescription: string;
}

export const AssetAndWallet: FunctionComponent<AssetAndWalletProps> = ({
  protocol,
  wallets,
  selectedWallet,
  onWalletSelected,
  onAddWallet,
  assets,
  selectedAsset,
  onAssetSelected,
  selectAssetDescription,
  selectWalletDescription,
}) => {
  const handleSelect = (wallet: GetAccountInfoResponse_Wallet) => {
    onWalletSelected(wallet);
  };
  const handleAddWallet = async (wallet: Wallet) => {
    wallet.name;
    return onAddWallet(wallet);
  };

  const protocolLogos = {
    [Protocol.UNSPECIFIED]: undefined,
    [Protocol.AVAX]: CryptoNetworkLogo_Avalanche,
    [Protocol.ETHEREUM]: CryptoNetworkLogo_Ethereum,
    [Protocol.POLYGON]: CryptoNetworkLogo_Polygon,
    [Protocol.TERRA]: CryptoNetworkLogo_Terra,
  };

  const walletItemIcon = (wallet: Protocol) => {
    return <img width={24} src={protocolLogos[wallet]} />;
  };

  const walletSelectedIcon = selectedWallet ? (
    walletItemIcon(selectedWallet.protocol as Protocol)
  ) : (
    <img width={24} src={WalletIcon} />
  );
  const handleClick = (asset: GetAccountInfoResponse_CryptoAsset) => {
    onAssetSelected(asset);
    onWalletSelected(undefined);
  };

  const assetLogos = {
    [AssetId.UNSPECIFIED]: undefined,
    [AssetId.USDC]: AssetSymbolIcon_USDC,
    [AssetId.AXL_USDC]: AssetSymbolIcon_USDC,
  };

  const assetItemIcon = (asset: AssetId) => {
    return <img width={24} src={assetLogos[asset]} />;
  };

  const assetSelectedIcon = selectedAsset ? (
    assetItemIcon(selectedAsset.assetId as AssetId)
  ) : (
    <img width={24} src={MoneyIcon} />
  );

  const hasWalletsForSelectedAsset =
    wallets.filter((w) => w.protocol === protocol).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset & Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <SelectAsset
          value={selectedAsset?.shortName}
          onValueChange={(value) => {
            const asset = assets.find((asset) => asset.shortName === value);
            if (asset) handleClick(asset);
          }}
        >
          <div>
            <CardDescription className="mb-2">
              {selectAssetDescription}
            </CardDescription>
            <SelectAssetTrigger disabled={assets.length === 0}>
              {assetSelectedIcon}
              <SelectAssetValue placeholder="Select Asset" />
            </SelectAssetTrigger>
            <SelectAssetContent>
              {assets.map((asset) => (
                <SelectAssetItem
                  key={asset!.shortName}
                  value={asset.shortName}
                  icon={assetItemIcon(asset.assetId)}
                >
                  {asset.shortName}
                </SelectAssetItem>
              ))}
            </SelectAssetContent>
          </div>
        </SelectAsset>
        {selectedAsset && (
          <>
            {hasWalletsForSelectedAsset && (
              <SelectWallet
                value={selectedWallet?.name}
                key={selectedAsset.network}
                onValueChange={(value) => {
                  const selectedWallet = wallets.find(
                    (w) => `${w.address}:${w.protocol}` === value,
                  );
                  if (selectedWallet) handleSelect(selectedWallet);
                }}
              >
                <div>
                  <CardDescription className="mb-2">
                    {selectWalletDescription}
                  </CardDescription>
                  <SelectWalletTrigger disabled={wallets.length === 0}>
                    {walletSelectedIcon}
                    <SelectWalletValue
                      placeholder="Select Wallet"
                      key={selectedWallet?.protocol}
                    >
                      {selectedWallet?.name}
                    </SelectWalletValue>
                  </SelectWalletTrigger>
                  <SelectWalletContent>
                    {wallets
                      .filter((w) => w.protocol === protocol)
                      .map((wallet) => (
                        <SelectWalletItem
                          key={`${wallet.address}:${wallet.protocol}`}
                          value={`${wallet.address}:${wallet.protocol}`}
                          icon={walletItemIcon(wallet.protocol)}
                          walletAddress={wallet.address}
                        >
                          {wallet.name || wallet.address.substring(0, 6)}
                        </SelectWalletItem>
                      ))}
                  </SelectWalletContent>
                </div>
              </SelectWallet>
            )}
            <AddWallet
              protocol={protocol ? protocol : Protocol.UNSPECIFIED}
              existing={wallets
                .filter((w) => w.protocol == protocol)
                .map((w) => w.address)}
              onAdd={handleAddWallet}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
export interface Wallet {
  protocol: Protocol;
  name: string;
  address: string;
}
interface AddWalletProps {
  protocol: Protocol;
  existing: string[];
  onAdd: (wallet: Wallet) => Promise<void>;
}

export const AddWallet: FunctionComponent<AddWalletProps> = ({
  protocol,
  existing,
  onAdd,
}) => {
  const [open, setOpen] = useState(false);

  const [address, setAddress] = useState<Wallet | undefined>(undefined);

  const handleOpenChange = async (open: boolean) => {
    setOpen(open);
  };

  const handleAdd = async () => {
    await onAdd(address!);
    setOpen(false);
  };

  useEffect(() => {
    async function load() {
      if (!open) {
        return;
      }
      setAddress(undefined);
      const address: string[] = [];
      try {
        const result = await requestAccounts();
        if (result) {
          result.accounts!.forEach((v) => v && address.push(v));
        }
      } catch (e) {
        const code = e?.code || 0;
        if (code === -32002) {
          handle32002();
        }
        if (code === 4001) {
          toast.error(
            'You rejected the request to connect to MetaMask wallets.',
          );
        }
        if (code !== 4001 && code !== -32002) {
          toast.error('Failed to connect to MetaMask, unknown error');
        }
        setOpen(false);
        return;
      }

      const addr = address.find((a) => !existing.includes(a!));
      if (addr) {
        setAddress({
          protocol: protocol,
          address: addr,
          name: 'MetaMask Wallet',
        });
      } else {
        toast.error('No new wallet found');
      }
    }
    load();
  }, [open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      protocol: protocol,
      name: e.target.value,
      address: address!.address,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="mt-4 w-full"
          disabled={existing.length > 0 && import.meta.env.VITE_SINGLE_WALLET}
        >
          Add wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Metamask Wallet</DialogTitle>
          <DialogDescription>
            You may add as many wallets as you like, however they must all be
            owned by you. By clicking the ADD WALLET button, you'll be prompted
            by MetaMask to sign a transaction. Don't worry, there's no
            transaction fees and no money transfer, this is purely to
            demonstrate ownership of the wallet.
          </DialogDescription>
        </DialogHeader>
        {!address && (
          <div className="text-center">
            Please select the address in MetaMask
          </div>
        )}
        {address && (
          <>
            <div className="flex flex-col space-y-4 py-4">
              <div className="flex flex-col items-start">
                <Label htmlFor="link" className="text-right">
                  Address
                </Label>
                <Input id="link" value={address.address} readOnly />
              </div>
              <div className="flex flex-col items-start">
                <Label htmlFor="link" className="text-right">
                  Wallet Name
                </Label>
                <Input
                  id="link"
                  value={address.name}
                  autoFocus={true}
                  onChange={handleNameChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="primary" onClick={handleAdd}>
                <img src={MetaMaskLogo} className="mr-2 h-5 w-5" />
                Add wallet
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
