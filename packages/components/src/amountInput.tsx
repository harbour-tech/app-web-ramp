import * as React from 'react';
import { cn } from './utils';
import AssetSymbolIcon_EUR from './assets/assetSymbolIcon_EUR.svg';
import AssetSymbolIcon_USDC from './assets/assetSymbolIcon_USDC.svg';
import AssetSymbolIcon_GBP from './assets/assetSymbolIcon_GBP.svg';
import { LoadingSpinner } from './loadingSpinner';

export interface AmountInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validate?: (value: string) => string | null;
  currency: 'EUR' | 'GBP' | 'USDC';
  label: string;
  isLoading?: boolean;
}

const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  (
    { className, validate, currency, label, isLoading, ...props },
    forwardedRef,
  ) => {
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
      switch (true) {
        case currency.includes('EUR'):
          return (
            <img
              className="w-6 h-6"
              src={AssetSymbolIcon_EUR}
              alt="EUR symbol"
            />
          );
        case currency.includes('GBP'):
          return (
            <img
              className="w-6 h-6"
              src={AssetSymbolIcon_GBP}
              alt="GBP symbol"
            />
          );
        case currency.includes('USDC'):
          return (
            <img
              className="w-6 h-6"
              src={AssetSymbolIcon_USDC}
              alt="USDC symbol"
            />
          );
        default:
          return null;
      }
    };

    const shouldHaveUSDCBackground = currency.includes('USDC');

    return (
      <div className="flex-row w-full" onClick={props.onClick}>
        <div
          className={cn(
            'flex-col items-center w-full rounded-md bg-light-glass-70 shadow-inner px-4 py-3 space-y-3',
            className,
            error && 'border border-red',
          )}
        >
          <p className="caption1 text-gray-100">{label}</p>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'bg-gray-400 rounded-sm h-8 min-w-8 flex justify-center items-center',
                { 'bg-usdc': shouldHaveUSDCBackground },
              )}
            >
              {assetSymbolIcon()}
            </div>
            <p className="subtitle3 min-w-max">{currency}</p>
            {isLoading ? (
              <div className="w-full flex justify-end">
                <LoadingSpinner
                  className="inline-block mt-[-4px]"
                  height={20}
                  width={20}
                />
              </div>
            ) : (
              <input
                type={'text'}
                value={value}
                onInput={handleAmountInput}
                onBlur={handleBlur}
                className={cn(
                  'flex w-full text-right heading5 bg-transparent ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  className,
                  error &&
                    'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0',
                )}
                ref={ref}
                {...props}
              />
            )}
          </div>
        </div>
        {error && <p className="text-red text-xs mt-1 flex w-full">{error}</p>}
      </div>
    );
  },
);

AmountInput.displayName = 'AmountInput';

export { AmountInput };
