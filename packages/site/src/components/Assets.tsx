import { FunctionComponent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

export interface AssetsProps {
  assets: GetAccountInfoResponse_CryptoAsset[];
  selected?: GetAccountInfoResponse_CryptoAsset;
  onSelected: (asset: GetAccountInfoResponse_CryptoAsset) => void;
  description: string;
}

export const Assets: FunctionComponent<AssetsProps> = ({
  assets,
  selected,
  onSelected,
  description,
}) => {
  const handleClick = (asset: GetAccountInfoResponse_CryptoAsset) => {
    onSelected(asset);
  };

  const assetLogos = {
    [AssetId.UNSPECIFIED]: undefined,
    [AssetId.USDC]: AssetSymbolIcon_USDC,
  };

  const itemIcon = (asset: AssetId) => {
    return <img width={24} src={assetLogos[asset]} />;
  };

  const selectedIcon = selected ? (
    itemIcon(selected.assetId as AssetId)
  ) : (
    <img width={24} src={MoneyIcon} />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SelectAsset
          onValueChange={(value) => {
            const asset = assets.find((asset) => asset.shortName === value);
            if (asset) handleClick(asset);
          }}
        >
          <SelectAssetTrigger>
            {selectedIcon}
            <SelectAssetValue placeholder="Select Asset" />
          </SelectAssetTrigger>
          <SelectAssetContent>
            {assets.map((asset) => (
              <SelectAssetItem
                key={asset!.shortName}
                value={asset.shortName}
                icon={itemIcon(asset.assetId)}
              >
                {asset.shortName}
              </SelectAssetItem>
            ))}
          </SelectAssetContent>
        </SelectAsset>
      </CardContent>
    </Card>
  );
};
