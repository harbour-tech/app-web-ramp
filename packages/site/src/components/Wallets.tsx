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

export interface WalletsProps {
  protocol: Protocol;
  wallets: GetAccountInfoResponse_Wallet[];
  selectedWallet?: GetAccountInfoResponse_Wallet;
  onWalletSelected: (wallet: GetAccountInfoResponse_Wallet) => void;
  onAddWallet: (wallet: Wallet) => Promise<void>;
  description: string;
}

export const Wallets: FunctionComponent<WalletsProps> = ({
  protocol,
  wallets,
  selectedWallet,
  onWalletSelected,
  onAddWallet,
  description,
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

  const itemIcon = (wallet: Protocol) => {
    return <img width={24} src={protocolLogos[wallet]} />;
  };

  const selectedIcon = selectedWallet ? (
    itemIcon(selectedWallet.protocol as Protocol)
  ) : (
    <img width={24} src={WalletIcon} />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SelectWallet
          onValueChange={(value) => {
            const selectedWallet = wallets.find((w) => w.name === value);
            if (selectedWallet) handleSelect(selectedWallet);
          }}
        >
          <SelectWalletTrigger disabled={wallets.length === 0}>
            {selectedIcon}
            <SelectWalletValue placeholder="Select Wallet" />
          </SelectWalletTrigger>
          <SelectWalletContent>
            {wallets
              .filter((w) => w.protocol === protocol)
              .map((wallet) => (
                <SelectWalletItem
                  key={wallet.protocol + ':' + wallet.address}
                  value={wallet.name || wallet.address}
                  icon={itemIcon(wallet.protocol)}
                  walletAddress={wallet.address}
                >
                  {wallet.name || wallet.address.substring(0, 6)}
                </SelectWalletItem>
              ))}
          </SelectWalletContent>
        </SelectWallet>

        <AddWallet
          protocol={protocol}
          existing={wallets
            .filter((w) => w.protocol == protocol)
            .map((w) => w.address)}
          onAdd={handleAddWallet}
        />
      </CardContent>
    </Card>
  );
};

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
          alert(
            'There is pending request to connect to MetaMask, please approve/reject it first by clicking on the MetaMask extension icon.',
          );
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
            You can add as many Ethereum wallets as you want but they all must
            be owned by you!
          </DialogDescription>
        </DialogHeader>
        {!address && (
          <div className="text-center">
            Please select the address in MetaMask
          </div>
        )}
        {address && (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Address
                </Label>
                <Input
                  id="link"
                  value={address.address}
                  readOnly
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">
                  Wallet Name
                </Label>
                <Input
                  id="link"
                  value={address.name}
                  className="col-span-3"
                  autoFocus={true}
                  onChange={handleNameChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="primary" onClick={handleAdd}>
                Add wallet
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export interface Wallet {
  protocol: Protocol;
  name: string;
  address: string;
}
