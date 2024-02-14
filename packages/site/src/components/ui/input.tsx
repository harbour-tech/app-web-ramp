import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validate?: (value: string) => string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, validate, ...props }, ref) => {
    const [value, setValue] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setValue(value);
      validate && setError(validate(value));
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      const value = event.target.value;
      validate && setError(validate(value));
    };

    return (
      <div className="flex-row w-full">
        <input
          type={type}
          value={value}
          onInput={handleInput}
          onBlur={handleBlur}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
            error && 'border-red',
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-red text-xs mt-1 flex w-full">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
