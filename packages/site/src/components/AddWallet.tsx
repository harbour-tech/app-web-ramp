import React, { FunctionComponent, useEffect, useState } from 'react';
import { Protocol } from '@harbour/client/src/schema/gen/ramp/v1/public_pb';
import { requestAccounts } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Label,
  Input,
  LoadingSpinner,
} from '@harbour/components';
import { toast } from 'react-toastify';

import MetaMaskLogo from '@/assets/metamask.svg';
import { handle32002 } from '@/lib/utils';
import { useLocalAddresses } from '@/contexts/LocalAddresses';

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
  const { setLocalAddresses } = useLocalAddresses();
  const [addingAddressInProgress, setAddingAddressInProgress] = useState(false);
  const [address, setAddress] = useState<Wallet | undefined>(undefined);
  const [showLoadingInAddressModal, setShowLoadingInAddressModal] =
    useState(false);

  const handleAddWallet = async (open: boolean) => {
    setAddingAddressInProgress(open);
  };

  const handleAdd = async () => {
    setShowLoadingInAddressModal(true);
    await onAdd(address!).finally(() => {
      setAddress(undefined);
      setShowLoadingInAddressModal(false);
      setAddingAddressInProgress(false);
    });
  };

  useEffect(() => {
    async function load() {
      if (!addingAddressInProgress) {
        return;
      }
      setAddress(undefined);
      const address: string[] = [];
      try {
        const result = await requestAccounts();
        if (result) {
          result.accounts &&
            result.accounts.length > 0 &&
            setLocalAddresses(result.accounts);
          result.accounts!.forEach(
            (singleAddress) => singleAddress && address.push(singleAddress),
          );
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
        setAddingAddressInProgress(false);
        return;
      }
      if (address.length === 0) {
        toast.error('No account selected in MetaMask');
        setAddingAddressInProgress(false);
        return;
      }

      const addr = address.find((a) => !existing.includes(a!));
      if (addr) {
        setAddress({
          protocol,
          address: addr,
          name: 'MetaMask Wallet',
        });
      } else {
        toast.success('Accounts ready to use');
        setAddingAddressInProgress(false);
      }
    }
    load();
  }, [addingAddressInProgress]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      protocol,
      name: e.target.value,
      address: address!.address,
    });
  };

  return (
    <>
      {addingAddressInProgress ? (
        <Button className="mt-4 w-full gap-2" disabled>
          <LoadingSpinner /> Accept in MetaMask
        </Button>
      ) : (
        <Button
          className="mt-4 w-full"
          disabled={existing.length > 0 && import.meta.env.VITE_SINGLE_WALLET}
          onClick={() => handleAddWallet(true)}
        >
          Add wallet
        </Button>
      )}
      <Dialog
        open={!!address}
        onOpenChange={() => {
          setAddress(undefined);
          setAddingAddressInProgress(false);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Metamask Wallet</DialogTitle>
            <DialogDescription>
              You may add as many wallets as you like, however they must all be
              owned by you. By clicking the ADD WALLET button, you'll be
              prompted by MetaMask to sign a transaction. Don't worry, there's
              no transaction fees and no money transfer, this is purely to
              demonstrate ownership of the wallet.
            </DialogDescription>
          </DialogHeader>
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
                {showLoadingInAddressModal ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="gap-2"
                    disabled
                  >
                    <LoadingSpinner /> Accept in MetaMask
                  </Button>
                ) : (
                  <Button onClick={handleAdd}>
                    <img src={MetaMaskLogo} className="mr-2 h-5 w-5" />
                    Add wallet
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
