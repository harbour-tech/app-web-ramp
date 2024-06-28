import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import ChevronDownIcon from './assets/chevronDownIcon.svg';

import { cn } from './utils';

const SelectAsset = SelectPrimitive.Root;

const SelectAssetGroup = SelectPrimitive.Group;

const SelectAssetValue = SelectPrimitive.Value;

const SelectAssetTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <div className="rounded-sm p-px bg-gray-glass">
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-sm bg-light-glass shadow-inner px-3 py-2 body2 ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        className,
      )}
      {...props}
    >
      <div className="flex items-center space-x-3">{children}</div>
      <SelectPrimitive.Icon asChild>
        <img width={24} src={ChevronDownIcon} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  </div>
));
SelectAssetTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectAssetScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectAssetScrollUpButton.displayName =
  SelectPrimitive.ScrollUpButton.displayName;

const SelectAssetScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectAssetScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectAssetContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-none bg-night text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectAssetScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          position === 'popper' &&
            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        <div className="p-px bg-gray-glass">
          <div className="p-3 space-y-3 bg-night">{children}</div>
        </div>
      </SelectPrimitive.Viewport>
      <SelectAssetScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectAssetContent.displayName = SelectPrimitive.Content.displayName;

const SelectAssetLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
    {...props}
  />
));
SelectAssetLabel.displayName = SelectPrimitive.Label.displayName;

const SelectAssetItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    icon?: JSX.Element;
  }
>(({ className, children, icon, ...props }, ref) => (
  <div className="p-px bg-gray-glass">
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full bg-light-glass cursor-default select-none items-center rounded-none py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3 w-3 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <div className="mr-3">{icon}</div>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  </div>
));
SelectAssetItem.displayName = SelectPrimitive.Item.displayName;

const SelectAssetSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
SelectAssetSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  SelectAsset,
  SelectAssetGroup,
  SelectAssetValue,
  SelectAssetTrigger,
  SelectAssetContent,
  SelectAssetLabel,
  SelectAssetItem,
  SelectAssetSeparator,
  SelectAssetScrollUpButton,
  SelectAssetScrollDownButton,
};
