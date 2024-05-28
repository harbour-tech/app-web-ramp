import RampClient, {
  EthereumSignature,
  Signature,
  SignerFunction,
} from '@/harbour';
import { singRequest } from '@/utils';
import { PropsWithChildren, createContext, useMemo } from 'react';

export const RampClientContext = createContext<RampClient | null>(null);

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

  RampClientContext.displayName = 'AuthContextContext';
  return (
    <RampClientContext.Provider value={client}>
      {children}
    </RampClientContext.Provider>
  );
};
