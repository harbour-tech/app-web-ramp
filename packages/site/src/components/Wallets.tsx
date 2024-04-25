import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GemIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  GetAccountInfoResponse_Wallet,
  Protocol,
} from '@/harbour/gen/ramp/v1/public_pb';
import { cn } from '@/lib/utils';
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
  const style = (wallet: GetAccountInfoResponse_Wallet) => {
    if (
      wallet.protocol == selectedWallet?.protocol &&
      wallet.address == selectedWallet?.address
    ) {
      return 'bg-accent text-accent-foreground';
    } else {
      return 'hover:bg-accent hover:text-accent-foreground';
    }
  };

  const handleSelect = (wallet: GetAccountInfoResponse_Wallet) => {
    onWalletSelected(wallet);
  };
  const handleAddWallet = async (wallet: Wallet) => {
    wallet.name;
    return onAddWallet(wallet);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {wallets
          .filter((w) => w.protocol == protocol)
          .map((wallet) => (
            <div
              onClick={() => handleSelect(wallet)}
              key={wallet.protocol + ':' + wallet.address}
              className={cn(
                style(wallet),
                'flex flex-row space-x-2 rounded-md p-2 cursor-pointer',
              )}
            >
              <GemIcon className="h-5 w-5" />
              {/*TODO: map network to icon*/}
              <div className="space-y-1 flex flex-col overflow-hidden max-w-xs">
                <p className="text-sm font-medium leading-none">
                  {wallet.name ? wallet.name : wallet.address.substring(0, 6)}
                  {false && (
                    <p className="font-thin">
                      {
                        {
                          [Protocol.UNSPECIFIED]: '',
                          [Protocol.ETHEREUM]: 'Ethereum',
                          [Protocol.AVAX]: 'Avalance',
                          [Protocol.TERRA]: 'Terra',
                          [Protocol.POLYGON]: 'Polygon',
                        }[wallet.protocol]
                      }
                    </p>
                  )}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {wallet.address}
                </p>
              </div>
            </div>
          ))}

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
