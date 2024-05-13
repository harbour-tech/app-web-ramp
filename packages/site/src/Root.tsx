import {
  type FunctionComponent,
  PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import { RampClientProvider } from '@/hooks/useRpc';
import { MetaMaskProvider } from '@/hooks/useMetaMask';
import App from '@/App';
import { cn } from '@/lib/utils';
import HarbourLogo from '@/assets/harbourLogo.svg?react';

export const Root: FunctionComponent<PropsWithChildren> = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setReady(true);
    }, 1);
  }, []);
  return (
    <>
      <div className="relative h-full w-full z-10">
        <div className="flex flex-col justify-center items-center gap-2 pt-8 z-10 absolute w-full">
          <div className="max-w-[680px] flex-col justify-center items-center p-8 animate-in animate-slide-up">
            <h1 className="text-center tracking-tighter leading-[80px] text-7xl md:block font-light bg-gradient-to-l from-transparent via-gray to-white text-transparent bg-clip-text animate-gradient">
              Magic Ramp
            </h1>
            <div className="flex py-2 gap-2 items-center justify-center">
              <div className="text-3xl">by</div>
              <HarbourLogo />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-around items-center  h-full">
          <div>
            <MetaMaskProvider>
              <RampClientProvider>
                <App />
              </RampClientProvider>
            </MetaMaskProvider>
          </div>
        </div>
      </div>
      <div className="absolute w-full h-full left-0 top-0 z-0">
        <div className="absolute z-0 bg-gray-600 w-full h-1/2 overflow-hidden top-0">
          <div
            className={cn(
              'absolute bg-first-part-of-screen w-[976px] h-full overflow-hidden bg-no-repeat right-0 transition-transform duration-700',
              {
                'translate-x-0': ready,
                'translate-x-[400px]': !ready,
              },
            )}
          />
        </div>
        <div className="absolute z-0 bg-gray-500 w-full h-1/2 overflow-hidden bottom-0">
          <div
            className={cn(
              'absolute bg-second-part-of-screen w-[976px] h-full overflow-hidden bg-no-repeat gradient-moved-to-left transition-transform duration-700',
              {
                'translate-x-0': ready,
                'translate-x-[-400px]': !ready,
              },
            )}
          />
        </div>
      </div>
    </>
  );
};
