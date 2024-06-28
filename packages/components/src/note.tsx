import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './utils';

const noteVariants = cva('rounded-lg p-3', {
  variants: {
    variant: {
      default: 'bg-night',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Note = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof noteVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="note"
    className={cn(noteVariants({ variant }), className)}
    {...props}
  />
));
Note.displayName = 'Note';

const NoteTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('subtitle4 mb-1 text-gray-50', className)}
    {...props}
  />
));
NoteTitle.displayName = 'NoteTitle';

const NoteDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('body3', className)} {...props} />
));
NoteDescription.displayName = 'NoteDescription';

export { Note, NoteTitle, NoteDescription };
