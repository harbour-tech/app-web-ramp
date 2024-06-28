import { PropsWithChildren, createContext, useMemo } from 'react';

import RampClient from './client';
import { singRequest } from '../utils';
import { EthereumSignature, Signature, SignerFunction } from './types';

export const RampClientContext = createContext<RampClient | null>(null);
RampClientContext.displayName = 'AuthContextContext';

export const RampClientProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const client = useMemo(() => {
    const signer: SignerFunction = async (data: string): Promise<Signature> => {
      const result = await singRequest(data);
      return {
        signature: result?.signature as string,
        publicKey: result?.publicKey as string,
        ...EthereumSignature,
      };
    };
    return new RampClient('/api/', signer);
  }, []);

  return (
    <RampClientContext.Provider value={client}>
      {children}
    </RampClientContext.Provider>
  );
};
