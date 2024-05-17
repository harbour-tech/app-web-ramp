import { MetaMaskContext } from './MetaMaskContext';
import { useContext } from 'react';

export const useMetaMask = () => {
  const metaMask = useContext(MetaMaskContext);

  if (!metaMask) {
    throw new Error(
      'Cannot call useMetaMask unless your component is within a MetaMaskProvider',
    );
  }
  return metaMask;
};
