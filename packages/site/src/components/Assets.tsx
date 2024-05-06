import { FunctionComponent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BusIcon, CircleDollarSignIcon } from 'lucide-react';

import { GetAccountInfoResponse_CryptoAsset } from '@/harbour/gen/ramp/v1/public_pb';
import { cn } from '@/lib/utils';
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
  const style = (asset: GetAccountInfoResponse_CryptoAsset) => {
    if (asset!.shortName == selected?.shortName) {
      return 'bg-accent text-accent-foreground';
    } else {
      return 'hover:bg-accent hover:text-accent-foreground';
    }
  };
  const handleClick = (asset: GetAccountInfoResponse_CryptoAsset) => {
    onSelected(asset);
  };

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
            <SelectAssetValue placeholder="Select Asset" />
          </SelectAssetTrigger>
          <SelectAssetContent>
            {assets.map((asset) => (
              <SelectAssetItem
                key={asset!.shortName}
                value={asset.shortName}
                icon={<CircleDollarSignIcon className="h-5 w-5" />}
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
