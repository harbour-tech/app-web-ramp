import {
  type FunctionComponent,
  PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import App from '@/App';
import { cn, IntroAnimatedLogos } from '@harbour/components';
import HarbourLogo from '@/assets/harbourLogo.svg?react';
import { MetaMaskContextProvider } from '@/contexts';
import { RampClientProvider } from '@harbour/client';
import { useWindowDimensions } from '@harbour/hooks';

export const Root: FunctionComponent<PropsWithChildren> = () => {
  const [gradientsReady, setGradientsReady] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    setTimeout(() => {
      setGradientsReady(true);
    }, 1);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setControlsVisible(true);
    }, 1500);
  }, []);

  const hideLogo = () => {
    setLogoVisible(false);
  };

  const maxWidthToShowLogo = 1220;
  const shouldNotShowLogo = width < maxWidthToShowLogo;

  return (
    <>
      <div className="relative h-full w-full z-1 animate-in overflow-auto no-scrollbar">
        <div className="flex flex-col justify-center items-center gap-2 pt-8 absolute w-full">
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
        <div
          className="flex flex-row justify-around items-center h-full"
          style={{ transition: 'transform 0.5s ease' }}
        >
          <div
            className="absolute animate-in no-scrollbar"
            style={{
              transition: 'all 1s ease',
              marginLeft:
                controlsVisible && logoVisible
                  ? shouldNotShowLogo
                    ? 0
                    : '-25vw'
                  : 0,
              opacity: controlsVisible ? 1 : 0,
              width: !logoVisible ? '100%' : 'auto',
              padding: logoVisible ? '0' : '0 10vw',
              top: '220px',
              height: 'calc(100% - 220px)',
              paddingBottom: '20px',
              overflow: 'visible',
            }}
          >
            <MetaMaskContextProvider>
              <RampClientProvider>
                <App hideLogo={hideLogo} />
              </RampClientProvider>
            </MetaMaskContextProvider>
          </div>
          {logoVisible && (
            <div
              className="absolute"
              style={{
                transition: 'all 1s ease',
                transform: controlsVisible
                  ? shouldNotShowLogo
                    ? 'translateX(150vw)'
                    : 'translateX(15vw)'
                  : 'translateX(0)',
              }}
            >
              <IntroAnimatedLogos />
            </div>
          )}
        </div>
      </div>
      <div className="absolute w-full h-full left-0 top-0 z-0">
        <div
          className={cn(
            'absolute z-0 bg-gray-600 w-full overflow-hidden top-0',
          )}
          style={{
            height: logoVisible ? '50%' : '100vh',
            transition: 'height 1s ease',
          }}
        >
          <div
            className={cn(
              'absolute bg-first-part-of-screen w-full h-full overflow-hidden bg-no-repeat right-0 transition-transform duration-700',
              {
                'translate-x-0': gradientsReady,
                'translate-x-[400px]': !gradientsReady,
              },
            )}
          />
        </div>
        <div
          className="absolute z-0 bg-gray-500 w-full overflow-hidden bottom-0"
          style={{
            height: logoVisible ? '50%' : '0px',
            transition: 'height 1s ease',
          }}
        >
          <div
            className={cn(
              'absolute bg-second-part-of-screen w-full h-full overflow-hidden bg-no-repeat gradient-moved-to-left transition-transform duration-700',
              {
                'translate-x-0': gradientsReady,
                'translate-x-[-400px]': !gradientsReady,
              },
            )}
          />
        </div>
      </div>
    </>
  );
};
