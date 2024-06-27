type SingResponse = {
  publicKey: string;
  signature: string;
  signatureType: string;
  encoding: string;
};

/* eslint-disable */

import { MetaMaskInpageProvider } from '@metamask/providers';

/*
 * Window type extension to support ethereum
 */
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider & {
      setProvider?: (provider: MetaMaskInpageProvider) => void;
      detected?: MetaMaskInpageProvider[];
      providers?: MetaMaskInpageProvider[];
    };
  }
}

export const singRequest = async (body: string) => {
  return await window.ethereum.request<SingResponse>({
    method: 'wallet_invokeSnap',
    params: {
      snapId: 'npm:@harbour-fi/ramp-snap',
      request: {
        method: 'sign_request',
        params: {
          message: body,
        },
      },
    },
  });
};
