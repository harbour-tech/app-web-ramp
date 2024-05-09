import * as React from 'react';
import { cn } from '@/lib/utils';
import AssetSymbolIcon_EUR from '@/assets/assetSymbolIcon_EUR.svg';
import AssetSymbolIcon_USDC from '@/assets/assetSymbolIcon_USDC.svg';
import AssetSymbolIcon_GBP from '@/assets/assetSymbolIcon_GBP.svg';

export interface AmountInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validate?: (value: string) => string | null;
  currency: 'EUR' | 'GBP' | 'USDC';
  label: string;
}

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ className, validate, currency, label, ...props }, forwardedRef) => {
    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const internalRef = React.useRef<HTMLInputElement>(null);
    const ref = forwardedRef ?? internalRef;

    const handleAmountInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setValue(newValue);
      if (validate) {
        setError(validate(newValue));
      }
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (validate) {
        setError(validate(newValue));
      }
    };

    const assetSymbolIcon = () => {
      switch (currency) {
        case 'EUR':
          return <img src={AssetSymbolIcon_EUR} alt="EUR symbol" />;
        case 'GBP':
          return <img src={AssetSymbolIcon_GBP} alt="GBP symbol" />;
        case 'USDC':
          return <img src={AssetSymbolIcon_USDC} alt="USDC symbol" />;
        default:
          return null;
      }
    };

    return (
      <div className="flex-row w-full">
        <div
          className={cn(
            'flex-col items-center w-full rounded-md bg-light-glass-70 shadow-inner px-4 py-3 space-y-3',
            className,
            error && 'border border-red',
          )}
        >
          <p className="caption1 text-gray-100">{label}</p>
          <div className="flex items-center">
            <div className="bg-gray-400 p-1 mr-2 rounded-sm">
              {assetSymbolIcon()}
            </div>
            <p className="subtitle3 mr-2">{currency}</p>
            <input
              type={'text'}
              value={value}
              onInput={handleAmountInput}
              onBlur={handleBlur}
              className={cn(
                'flex w-full truncate rounded-md bg-transparent text-right heading5 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className,
                error &&
                  'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
              )}
              ref={ref}
              {...props}
            />
          </div>
        </div>
        {error && <p className="text-red text-xs mt-1 flex w-full">{error}</p>}
      </div>
    );
  },
);

AmountInput.displayName = 'AmountInput';

export { AmountInput };
