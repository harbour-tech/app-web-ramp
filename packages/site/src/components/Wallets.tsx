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
import { GetAccountInfoResponse_Wallet } from '@/harbour/gen/ramp/v1/public_pb';
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
  wallets: GetAccountInfoResponse_Wallet[];
  selectedWallet?: GetAccountInfoResponse_Wallet;
  onWalletSelected: (wallet: GetAccountInfoResponse_Wallet) => void;
  onAddWallet: (wallet: Wallet) => Promise<void>;
  description: string;
}

export const Wallets: FunctionComponent<WalletsProps> = ({
  wallets,
  selectedWallet,
  onWalletSelected,
  onAddWallet,
  description,
}) => {
  const style = (wallet: GetAccountInfoResponse_Wallet) => {
    if (
      wallet.ecosystem == selectedWallet?.ecosystem &&
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

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <CardTitle>Wallet</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        {wallets.map((wallet) => (
          <div
            onClick={() => handleSelect(wallet)}
            key={wallet.ecosystem + ':' + wallet.address}
            className={cn(
              'flex-1 space-x-4 items-center rounded-md p-2 cursor-pointer overflow-hidden',
              style(wallet),
            )}
          >
            <GemIcon className="h-5 w-5 bg-red" />{' '}
            {/*TODO: map network to icon*/}
            <div className="space-y-1 flex-row bg-orange">
              <p className="text-sm font-medium leading-none">
                {wallet.name ? wallet.name : wallet.address.substring(0, 6)}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {wallet.address}
              </p>
              {/* <p className="text-sm text-muted-foreground truncate">
                lalalasdasdasdasswdasdasfssdfsddfsjkdf83452397sdf897sd98f7sd89f7s
              </p> */}
            </div>
          </div>
        ))}

        <AddWallet
          existing={wallets.map((w) => w.address)}
          onAdd={onAddWallet}
        />
      </CardContent>
    </Card>
  );
};

interface AddWalletProps {
  existing: string[];
  onAdd: (wallet: Wallet) => Promise<void>;
}

export const AddWallet: FunctionComponent<AddWalletProps> = ({
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
        setOpen(false);
        toast.success('Wallets added');
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
          address: addr,
          name: 'MetaMask Wallet',
        });
      }
    }
    load();
  }, [open]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      name: e.target.value,
      address: address!.address,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full" disabled={existing.length > 0}>
          Add wallet
        </Button>
      </DialogTrigger>
      {/* <DialogContent className="sm:max-w-[600px]"> */}
      <DialogContent>
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
                  defaultValue={address.address}
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
              <Button type="button" variant="default" onClick={handleAdd}>
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
  name: string;
  address: string;
}
