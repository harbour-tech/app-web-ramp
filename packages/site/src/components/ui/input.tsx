import * as React from 'react';
import { cn } from '@/lib/utils';
import CopyIcon from '@/assets/copyIcon.svg';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  validate?: (value: string) => string | null;
  withCopyToClipboard?: boolean;
  error?: string | null;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      validate,
      withCopyToClipboard,
      error,
      disabled,
      ...props
    },
    forwardedRef,
  ) => {
    const [value, setValue] = React.useState('');
    const [_error, setError] = React.useState<string | null>(error || null);
    const internalRef = React.useRef<HTMLInputElement>(null);
    const ref = forwardedRef ?? internalRef;

    useEffect(() => {
      if (_error !== error) {
        setError(error || null);
      }
    }, [_error, error]);

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const copyToClipboard = () => {
      if ('current' in ref && ref.current) {
        const input = ref.current;
        input.focus();
        input.select();
        navigator.clipboard.writeText(input.value).then(
          () => {
            toast.success('Content copied to clipboard');
          },
          (error) => {
            toast.error(`Unable to copy to clipboard: ${error}`);
          },
        );
        window.getSelection()?.removeAllRanges();
      }
    };

    const displayAsDisabled = withCopyToClipboard || props.readOnly;

    return (
      <div className="flex-row w-full">
        <div className="rounded-md p-px bg-gray-glass">
          <div
            className={cn(
              'flex items-center w-full rounded-md bg-light-glass shadow-inner px-2',
              className,
              {
                'border !border-red': _error,
                'border-gray-200 border': displayAsDisabled,
              },
            )}
          >
            <input
              type={type}
              value={value}
              onInput={handleInput}
              onBlur={handleBlur}
              className={cn(
                'flex h-10 w-full rounded-md bg-transparent px-3 py-2 body2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className,
                {
                  'ready-to-copy-font text-gray-100': displayAsDisabled,
                  'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0':
                    _error,
                },
              )}
              ref={ref}
              {...props}
            />
            {withCopyToClipboard && (
              <img
                width={16}
                src={CopyIcon}
                onClick={copyToClipboard}
                className="cursor-pointer mx-2"
              />
            )}
          </div>
        </div>
        {_error && (
          <p className="text-red text-xs mt-1 flex w-full">{_error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
