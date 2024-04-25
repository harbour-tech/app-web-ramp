import { type FunctionComponent, PropsWithChildren } from 'react';
import { RampClientProvider } from '@/hooks/useRpc';
import { MetaMaskProvider } from '@/hooks/useMetaMask';
import App from '@/App';

export const Root: FunctionComponent<PropsWithChildren> = () => {
  return (
    <div className="container">
      <div className="flex justify-center items-end  gap-2 pt-8">
        <section className="max-w-[680px] flex-col justify-center items-center">
          <h1 className="text-center tracking-tighter text-7xl md:block">
            Magic Ramp
          </h1>
          <div className="flex py-2 gap-2 items-center justify-center">
            <div className="text-3xl">by</div>
            <svg
              width="249"
              height="29"
              viewBox="0 0 249 29"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.7749 11.2972H12.3328C3.52466 11.2972 0.460938 13.4418 0.460938 19.0331V27.5349H6.39689V16.3141H19.839C28.6471 16.3141 31.7109 14.361 31.7109 8.76968V0.727417H25.7749V11.2972Z"
                fill="white"
              />
              <path
                d="M6.39689 0.727417H0.460938V10.2249H6.39689V0.727417Z"
                fill="white"
              />
              <path
                d="M31.7109 17.3862H25.775V27.5348H31.7109V17.3862Z"
                fill="white"
              />
              <path
                d="M53.1071 0C46.2137 0 43.9542 3.2169 42.1543 7.6593L34.1886 27.5352H40.2777L49.1625 5.17003H57.0516L65.9364 27.5352H72.0255L64.0599 7.6593C62.2599 3.2169 60.0004 0 53.1071 0Z"
                fill="white"
              />
              <path
                d="M106.675 7.69737C106.675 2.68054 102.845 0.727417 94.8032 0.727417H74.4294V5.89744H100.739V11.8334H74.4294V27.5349H80.3654V16.2758H100.356V27.5349H106.292V23.4755C106.292 18.022 104.543 15.2082 101.25 13.8963C104.906 12.9961 106.675 11.0542 106.675 7.69737Z"
                fill="white"
              />
              <path
                d="M242.593 13.8963C246.25 12.9961 248.019 11.0542 248.019 7.69737C248.019 2.68054 244.189 0.727417 236.147 0.727417H215.773V5.89744H242.083V11.8334H215.773V27.5349H221.709V16.2758H241.7V27.5349H247.636V23.4755C247.636 18.022 245.886 15.2082 242.593 13.8963Z"
                fill="white"
              />
              <path
                d="M135.767 13.8281C139.865 12.7126 142.057 10.8254 142.057 7.96545C142.057 2.79543 138.112 0.727417 129.764 0.727417H110.73V27.4967L130.798 27.5349C139.453 27.5349 143.55 25.4286 143.55 20.182C143.55 16.8347 141.003 14.832 135.767 13.8281ZM136.121 5.89744V11.8334H116.666V5.89744H136.121ZM137.614 22.3649H116.666V16.3141H137.614V22.3649Z"
                fill="white"
              />
              <path
                d="M166.016 0H157.897C150.251 0 146.04 4.54223 146.025 12.1783H146.025V16.0462C146.025 23.7055 150.238 28.2628 157.897 28.2628H166.016C173.675 28.2628 177.888 23.7055 177.888 16.0462V12.1783H177.887C177.873 4.54223 173.662 0 166.016 0ZM171.952 22.7098H151.961V5.55299H171.952V22.7098Z"
                fill="white"
              />
              <path
                d="M181.339 1.07227H187.275V22.7098H206.499V1.07227H212.435V16.4292C212.435 24.0884 208.223 28.2628 200.563 28.2628H193.211C185.551 28.2628 181.339 24.0884 181.339 16.4292V1.07227Z"
                fill="white"
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
  );
};
