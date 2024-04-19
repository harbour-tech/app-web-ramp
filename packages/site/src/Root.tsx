import {
  type FunctionComponent,
  PropsWithChildren,
  useState,
  useEffect,
} from 'react';
import { RampClientProvider } from '@/hooks/useRpc';
import { MetaMaskProvider } from '@/hooks/useMetaMask';
import App from '@/App';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const Root: FunctionComponent<PropsWithChildren> = () => {
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

  const onMessage = (payload: MessageEvent<unknown>) => {
    if (!payload.origin.includes(window.location.host)) {
      const data = payload.data;
      if (data === 'onboardingFinished') {
        setIsOnboardingVisible(false);
        // TODO nav to next screen
        // navigation.navigate('ChoosePin', { path: AuthPath.SignIn });
      }
      if (data === 'existingUserIdentityConfirmationFailed') {
        setIsOnboardingVisible(false);
      }
      if (data === 'closeWebOnboarding') {
        setIsOnboardingVisible(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setUrl(
        'https://dev-onboarding.harborapps-nonprod.link?token=eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhdXRoX3N2YyIsInN1YiI6ImRldmljZSIsImV4cCI6MTcxMzUzODEyNiwiaWF0IjoxNzEzNTI3Mjk2LCJ1c2VyX2lkIjoiIiwiZGV2aWNlX2lkIjoiY2VmZTNlY2ItZTNhYy00YzQzLWIxYTktY2UzNTdiNjVlMWUzIiwidXNlcl9zdGF0dXMiOiIifQ.AUkdH1y912oApYKD0Iigq5qO3DVUOhCaYwcSC7ub5fLtl-sPDg4arDyGO1x5386K7CVgZMwmR_zaopYHC8wfC9VpAUOs2Gh5hE2XbNki9YTQNYCkFzJqsKqoZZq_EehnqXeIWHoKR4euZwwof-hXXGm4Dtq7o7-ixPZop9rZ4iXS-xXp',
      );
      setIsOnboardingVisible(true);
    }, 4000);
  }, []);

  return (
    <>
      <div
        className={`absolute w-[100vw] h-[100vh] transition-all duration-1000 ease-in-out bg-black bg-opacity-30 z-10 backdrop-blur-sm flex justify-center items-center
      ${isOnboardingVisible ? '!opacity-100' : 'opacity-0 -translate-y-full '}
      `}
      >
        <div className="h-full max-h-[812px] w-[375px] relative rounded-xl overflow-hidden border-[1px] border-white">
          {isOnboardingLoading && (
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 z-0 flex justify-center items-center">
              <LoadingSpinner className="w-[50px] h-[50px]" />
            </div>
          )}
          {url && (
            <iframe
              className="h-full max-h-[812px] w-[375px] bg-transparent"
              src={url}
              onLoad={() => setIsOnboardingLoading(false)}
            />
          )}
        </div>
      </div>
      <div className="container">
        <div className="flex justify-center items-end  gap-2 pt-8">
          <section className="max-w-[680px] flex-col items-center">
            <h1 className="text-center leading-tight tracking-tighter text-6xl lg:leading-[1.1] hidden md:block">
              Magic Ramp
            </h1>
            <div className="flex justify-start py-2 gap-2 items-center">
              <div className="text-2xl">by</div>
              <svg
                id="logo"
                width="154"
                height="18"
                viewBox="0 0 154 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.9336 7.24271H7.59711C2.13443 7.24271 0.234375 8.57275 0.234375 12.0404V17.313H3.91574V10.3541H12.2523C17.7149 10.3541 19.615 9.14277 19.615 5.67516V0.6875H15.9336V7.24271Z"
                  fill="black"
                />
                <path
                  d="M3.91574 0.6875H0.234375V6.57768H3.91574V0.6875Z"
                  fill="black"
                />
                <path
                  d="M19.615 11.0188H15.9336V17.3127H19.615V11.0188Z"
                  fill="black"
                />
                <path
                  d="M32.8842 0.235962C28.6091 0.235962 27.2078 2.23102 26.0915 4.98611L21.1514 17.3127H24.9277L30.4379 3.44231H35.3306L40.8407 17.3127H44.6171L39.677 4.98611C38.5607 2.23102 37.1594 0.235962 32.8842 0.235962Z"
                  fill="black"
                />
                <path
                  d="M66.1075 5.01014C66.1075 1.89879 63.7324 0.6875 58.7448 0.6875H46.1094V3.89385H62.4261V7.57522H46.1094V17.313H49.7907V10.3303H62.1886V17.313H65.87V14.7954C65.87 11.4133 64.7852 9.66818 62.7428 8.8546C65.0105 8.29629 66.1075 7.09196 66.1075 5.01014Z"
                  fill="black"
                />
                <path
                  d="M150.401 8.8546C152.669 8.29629 153.766 7.09196 153.766 5.01014C153.766 1.89879 151.391 0.6875 146.403 0.6875H133.768V3.89385H150.084V7.57522H133.768V17.313H137.449V10.3303H149.847V17.313H153.528V14.7954C153.528 11.4133 152.443 9.66818 150.401 8.8546Z"
                  fill="black"
                />
                <path
                  d="M84.1487 8.81232C86.69 8.12046 88.0492 6.95007 88.0492 5.17639C88.0492 1.97004 85.6029 0.6875 80.4252 0.6875H68.6211V17.2893L81.0665 17.313C86.4342 17.313 88.9755 16.0067 88.9755 12.7529C88.9755 10.6769 87.3959 9.4349 84.1487 8.81232ZM84.3678 3.89385V7.57522H72.3025V3.89385H84.3678ZM85.2941 14.1067H72.3025V10.3541H85.2941V14.1067Z"
                  fill="black"
                />
                <path
                  d="M102.908 0.235962H97.8725C93.1303 0.235962 90.5187 3.05297 90.51 7.7887H90.5098V10.1875C90.5098 14.9377 93.1223 17.764 97.8725 17.764H102.908C107.658 17.764 110.27 14.9377 110.27 10.1875V7.7887H110.27C110.261 3.05297 107.65 0.235962 102.908 0.235962ZM106.589 14.3202H94.1912V3.67982H106.589V14.3202Z"
                  fill="black"
                />
                <path
                  d="M112.412 0.901001H116.093V14.3202H128.016V0.901001H131.698V10.4251C131.698 15.1752 129.085 17.764 124.335 17.764H119.775C115.025 17.764 112.412 15.1752 112.412 10.4251V0.901001Z"
                  fill="black"
                />
              </svg>
            </div>
          </section>
        </div>

        <MetaMaskProvider>
          <RampClientProvider>
            <App />
          </RampClientProvider>
        </MetaMaskProvider>
      </div>
    </>
  );
};
