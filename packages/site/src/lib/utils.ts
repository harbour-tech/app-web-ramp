import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handle32002 = () => {
  alert(
    'There is a pending request to connect to MetaMask. Please approve or reject the request by clicking on the MetaMask extension icon in your browser toolbar. Once you have done this, you can proceed with your current action.',
  );
};
