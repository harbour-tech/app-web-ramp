import { FunctionComponent } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CircleDollarSignIcon } from 'lucide-react';

import { GetAccountInfoResponse_Asset } from '@/harbour/gen/ramp/v1/public_pb';
import { cn } from '@/lib/utils';

export interface AssetsProps {
  assets: GetAccountInfoResponse_Asset[];
  selected?: GetAccountInfoResponse_Asset;
  onSelected: (asset: GetAccountInfoResponse_Asset) => void;
  description: string;
}

export const Assets: FunctionComponent<AssetsProps> = ({
  assets,
  selected,
  onSelected,
  description,
}) => {
  const style = (asset: GetAccountInfoResponse_Asset) => {
    if (asset!.shortName == selected?.shortName) {
      return 'bg-accent text-accent-foreground';
    } else {
      return 'hover:bg-accent hover:text-accent-foreground';
    }
  };
  const handleClick = (asset: GetAccountInfoResponse_Asset) => {
    onSelected(asset);
  };

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <CardTitle>Asset</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        {assets.map((asset) => (
          <div
            key={asset!.shortName}
            className={cn(
              '-mx-2 flex space-x-4 rounded-md p-2 transition-all items-center cursor-pointer',
              style(asset),
            )}
            onClick={() => handleClick(asset)}
          >
            <CircleDollarSignIcon className="h-5 w-5" />{' '}
            {/*TODO: map asset onto icon*/}
            <div className="space-y-1 flex items-center">
              <p className="text-sm font-medium">{asset.shortName}</p>
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
