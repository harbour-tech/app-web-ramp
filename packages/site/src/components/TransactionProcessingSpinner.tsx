import { FC, useEffect, useState } from 'react';

export const TransactionProcessingSpinner: FC<{
  className?: string;
  width?: number;
  height?: number;
}> = ({ className, height, width }) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-screen h-screen flex flex-col items-center justify-center bg-opacity-90 z-50 backdrop-blur-2xl">
      <div className="flex flex-col items-center -mt-96">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width || '64'}
          height={height || '64'}
          viewBox="0 0 24 24"
          fill="none"
          stroke={'currentColor'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`animate-spin ${className}`}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <div className="mt-2 heading2">
          Processing transaction
          <span>
            <span style={{ color: dots >= 1 ? 'white' : 'transparent' }}>
              .
            </span>
            <span style={{ color: dots >= 2 ? 'white' : 'transparent' }}>
              .
            </span>
            <span style={{ color: dots >= 3 ? 'white' : 'transparent' }}>
              .
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
