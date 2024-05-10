import React from 'react';
import ExchangeIcon from '@/assets/exchangeIcon.svg';
import LogotypeHarbourMedium from '@/assets/logotypeHarbourMedium.svg';
import LogotypeMetamaskMedium from '@/assets/logotypeMetamaskMedium.svg';

interface IntroAnimatedLogosProps {
  disabledAnimations?: boolean;
}

const IntroAnimatedLogos: React.FC<IntroAnimatedLogosProps> = ({
  disabledAnimations = false,
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className={`flex flex-col items-center justify-center space-y-12`}>
        <img
          src={LogotypeHarbourMedium}
          className={`${disabledAnimations ? '' : 'animate-slideFromLeft'}`}
          alt="Harbour logotype"
        />
        <div
          className={`w-16 h-16 flex justify-center items-center bg-sky rounded-2xl p-1 ${
            disabledAnimations
              ? ''
              : 'animate-revealMiddle animate-spinClockwise'
          }`}
        >
          <img src={ExchangeIcon} alt="swap icon" />
        </div>
        <img
          src={LogotypeMetamaskMedium}
          className={`${disabledAnimations ? '' : 'animate-slideFromRight'}`}
          alt="Metamask logotype"
        />
      </div>
    </div>
  );
};

export default IntroAnimatedLogos;
