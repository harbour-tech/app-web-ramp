import React, { PropsWithChildren, useContext } from 'react';
import { singRequest } from '@/utils';
import RampClient, {
  EthereumSignature,
  Signature,
  SignerFunction,
} from '../harbour';

export const RampClientContext = React.createContext<RampClient | null>(null);

export const useRampClient = function (): RampClient {
  const rampClient = useContext(RampClientContext);
  if (!rampClient) {
    throw new Error(
      'Cannot call useRpc unless your component is within a ConnectRpcProvider',
    );
  }

  return rampClient;
};

export const RampClientProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const signer: SignerFunction = async (data: string): Promise<Signature> => {
    const result = await singRequest(data);
    return {
      signature: result?.signature!,
      publicKey: result?.publicKey!,
      ...EthereumSignature,
    };
  };
  const client = new RampClient('/api/', signer);

  RampClientContext.displayName = 'AuthContextContext';
  return (
    <RampClientContext.Provider value={client}>
      {children}
    </RampClientContext.Provider>
  );
};
