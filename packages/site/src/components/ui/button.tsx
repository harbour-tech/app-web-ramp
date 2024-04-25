import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm disabled:opacity-40 py-2 px-4',
  {
    variants: {
      variant: {
        primary: 'h-12 bg-sky hover:bg-sky/65 subtitle3 text-snow',
        secondary_outlined:
          'h-11 bg-transparent caption1 hover:bg-snow/10 border border-snow',
        text_button_large:
          'bg-transparent body1 text-lightSky hover:opacity-50',
        text_button_medium: 'bg-transparent body4 hover:opacity-50',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
