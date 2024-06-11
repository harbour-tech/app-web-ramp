import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ReactNode, createContext, useEffect, useRef, useState } from 'react';

interface OnboardingModalContextType {
  openOnboardingModal: (url: string) => void;
  setOnFinishCallback: (callback: (message?: string) => void) => void;
  closeOnboardingModal: () => void;
}

export const OnboardingModalContext = createContext<OnboardingModalContextType>(
  {} as OnboardingModalContextType,
);

export const OnboardingModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const callbackRef = useRef<(message?: string) => void>();

  const onMessage = (payload: MessageEvent<unknown>) => {
    if (!payload.origin.includes(window.location.host)) {
      const data = payload.data;
      if (data === 'onboardingFinished') {
        setIsOnboardingVisible(false);
        // TODO nav to next screen
      }
      if (data === 'existingUserIdentityConfirmationFailed') {
        setIsOnboardingVisible(false);
      }
      if (data === 'closeWebOnboarding') {
        setIsOnboardingVisible(false);
      }
      callbackRef.current?.(data as unknown as string);
    }
  };

  useEffect(() => {
    window.addEventListener('message', onMessage);
    console.log('faster?');
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  const openOnboardingModal = (url: string) => {
    setIsOnboardingLoading(true);
    setUrl(url);
    setIsOnboardingVisible(true);
  };

  const setOnFinishCallback = (callback?: () => void) => {
    callbackRef.current = callback;
  };

  const closeOnboardingModal = () => {
    setIsOnboardingVisible(false);
    setUrl(null);
  };

  return (
    <OnboardingModalContext.Provider
      value={{ openOnboardingModal, setOnFinishCallback, closeOnboardingModal }}
    >
      <div
        className={`absolute w-[100vw] h-[100vh] transition-all duration-1000 ease-in-out bg-black bg-opacity-30 z-20 backdrop-blur-sm flex justify-center items-center
      ${isOnboardingVisible ? '!opacity-100' : 'opacity-0 -translate-y-full '}
      `}
      >
        <div className="h-full max-h-[812px] w-[375px] relative rounded-xl overflow-hidden border-[1px] border-white">
          {isOnboardingLoading && (
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 z-0 flex justify-center items-center">
              <LoadingSpinner className="w-[50px] h-[50px]" />
            </div>
          )}
          {url && isOnboardingVisible ? (
            <iframe
              key={url}
              frameBorder="0"
              loading="lazy"
              className="h-full max-h-[812px] w-[375px] bg-transparent"
              src={url}
              onLoad={() => setIsOnboardingLoading(false)}
            />
          ) : (
            <div />
          )}
        </div>
      </div>
      {children}
    </OnboardingModalContext.Provider>
  );
};
