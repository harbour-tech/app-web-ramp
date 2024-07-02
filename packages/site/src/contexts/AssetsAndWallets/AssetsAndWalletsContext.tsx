import React, { createContext, useState, FC, ReactNode } from 'react';
import {
  GetAccountInfoResponse_CryptoAsset,
  GetAccountInfoResponse_Wallet,
} from '@harbour/client/src/schema/gen/ramp/v1/public_pb';

// prettier-ignore
interface AssetsAndWalletsContextProps {
  changingBankAccountFailed: boolean | string;
  onRampSelectedAsset?: GetAccountInfoResponse_CryptoAsset | undefined;
  onRampSelectedWallet: GetAccountInfoResponse_Wallet | undefined;
  offRampSelectedAsset: GetAccountInfoResponse_CryptoAsset | undefined;
  offRampSelectedWallet: GetAccountInfoResponse_Wallet | undefined;
  setChangingBankAccountFailed: React.Dispatch<React.SetStateAction<boolean | string>>;
  setOnRampSelectedAsset: React.Dispatch<React.SetStateAction<GetAccountInfoResponse_CryptoAsset | undefined>>;
  setOnRampSelectedWallet: React.Dispatch<React.SetStateAction<GetAccountInfoResponse_Wallet | undefined>>;
  setOffRampSelectedAsset: React.Dispatch<React.SetStateAction<GetAccountInfoResponse_CryptoAsset | undefined>>;
  setOffRampSelectedWallet: React.Dispatch<React.SetStateAction<GetAccountInfoResponse_Wallet | undefined>>;
}

// prettier-ignore
export const AssetsAndWalletsContext = createContext<AssetsAndWalletsContextProps>({} as AssetsAndWalletsContextProps);

// prettier-ignore
export const AssetsAndWalletsContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [changingBankAccountFailed, setChangingBankAccountFailed] = useState<boolean | string>(false);
  const [onRampSelectedAsset, setOnRampSelectedAsset] = useState<GetAccountInfoResponse_CryptoAsset | undefined>(undefined);
  const [onRampSelectedWallet, setOnRampSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined);
  const [offRampSelectedAsset, setOffRampSelectedAsset] = useState<GetAccountInfoResponse_CryptoAsset | undefined>(undefined);
  const [offRampSelectedWallet, setOffRampSelectedWallet] = useState<GetAccountInfoResponse_Wallet | undefined>(undefined);

  return (
    <AssetsAndWalletsContext.Provider
      value={{
        changingBankAccountFailed,
        onRampSelectedAsset,
        onRampSelectedWallet,
        offRampSelectedAsset,
        offRampSelectedWallet,
        setChangingBankAccountFailed,
        setOnRampSelectedAsset,
        setOnRampSelectedWallet,
        setOffRampSelectedAsset,
        setOffRampSelectedWallet,
      }}
    >
      {children}
    </AssetsAndWalletsContext.Provider>
  );
};
