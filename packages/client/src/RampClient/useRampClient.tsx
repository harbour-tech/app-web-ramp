import { useContext } from 'react';
import RampClient from './client';
import { RampClientContext } from './RampClientContext';

export const useRampClient = function (): RampClient {
  const rampClient = useContext(RampClientContext);
  if (!rampClient) {
    throw new Error(
      'Cannot call useRpc unless your component is within a ConnectRpcProvider',
    );
  }

  return rampClient;
};
