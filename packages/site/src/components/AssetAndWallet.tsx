import { FunctionComponent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  GetAccountInfoResponse_Wallet,
  Protocol,
} from '@/harbour/gen/ramp/v1/public_pb';
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
import CryptoNetworkLogo_AlephZero from '@/assets/cryptoNetworkLogo_AlephZero.svg';

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
import { useLocalAddresses } from '@/contexts/LocalAddresses';
import { AddWallet, Wallet } from './AddWallet';

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
  const { localAddresses } = useLocalAddresses();

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
    [Protocol.ALEPH_ZERO]: CryptoNetworkLogo_AlephZero,
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
    [AssetId.ASSET_ID_UNSPECIFIED]: undefined,
    [AssetId.ASSET_ID_USDC]: AssetSymbolIcon_USDC,
    [AssetId.ASSET_ID_AXL_USDC]: AssetSymbolIcon_USDC,
    [AssetId.ASSET_ID_1USD]: AssetSymbolIcon_USDC,
  };

  const assetItemIcon = (asset: AssetId) => {
    return <img width={24} src={assetLogos[asset]} />;
  };

  const assetSelectedIcon = selectedAsset ? (
    assetItemIcon(selectedAsset.assetId as AssetId)
  ) : (
    <img width={24} src={MoneyIcon} />
  );

  const fillteredOutWallets = wallets
    .filter((w) => w.protocol === protocol)
    .filter((w) => localAddresses.includes(w.address));
  const hasWalletsForSelectedAsset = fillteredOutWallets.length > 0;

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
              {assets.map((asset) => {
                console.log(asset.assetId);
                return (
                  <SelectAssetItem
                    key={asset!.shortName}
                    value={asset.shortName}
                    icon={assetItemIcon(asset.assetId)}
                  >
                    {asset.shortName}
                  </SelectAssetItem>
                );
              })}
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
                  <SelectWalletTrigger
                    disabled={fillteredOutWallets.length === 0}
                  >
                    {walletSelectedIcon}
                    <SelectWalletValue
                      placeholder="Select Wallet"
                      key={selectedWallet?.protocol}
                    >
                      {selectedWallet?.name}
                    </SelectWalletValue>
                  </SelectWalletTrigger>
                  <SelectWalletContent>
                    {fillteredOutWallets.map((wallet) => (
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
