import {FunctionComponent} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CircleDollarSignIcon} from "lucide-react";

import {
  GetAccountInfoResponse_Wallet_RampAsset,
} from "@/harbour/gen/ramp/v1/public_pb";
import {cn} from "@/lib/utils";

export interface AssetsProps {
  assets: GetAccountInfoResponse_Wallet_RampAsset[],
  selected?: GetAccountInfoResponse_Wallet_RampAsset,
  onSelected: (asset: GetAccountInfoResponse_Wallet_RampAsset) => void,
  description: string
}

export const Assets: FunctionComponent<AssetsProps> = ({
                                                         assets,
                                                         selected,
                                                         onSelected,
                                                         description}) => {
  const style = (asset: GetAccountInfoResponse_Wallet_RampAsset) => {
    if (asset!.asset!.shortName == selected?.asset?.shortName) {
      return "bg-accent text-accent-foreground"
    } else {
      return "hover:bg-accent hover:text-accent-foreground"
    }
  }
  const handleClick = (wallet: GetAccountInfoResponse_Wallet_RampAsset) => {
    onSelected(wallet)
  }

  return (
    <Card className="shadow">
      <CardHeader className="pb-3">
        <CardTitle>Asset</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-1">
        {assets.map(asset => (
          <div key={asset.asset!.shortName}
               className={cn("-mx-2 flex items-start space-x-4 rounded-md p-2 transition-all", style(asset))}
                onClick={ () => handleClick(asset) }>
            <CircleDollarSignIcon className="mt-px h-5 w-5"/> {/*TODO: map asset onto icon*/}
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{asset.asset!.shortName}</p>
              <p className="text-sm text-muted-foreground">

              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
