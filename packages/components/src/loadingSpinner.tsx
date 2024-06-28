import { cn } from './utils';
import { FC } from 'react';

export const LoadingSpinner: FC<{
  className?: string;
  width?: number;
  height?: number;
}> = ({ className, height, width }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || '24'}
      height={height || '24'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export const SmallLoader = (
  <LoadingSpinner className="inline-block mt-[-4px]" height={18} width={18} />
);
