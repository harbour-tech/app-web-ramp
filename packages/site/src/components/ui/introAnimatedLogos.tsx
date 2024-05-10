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
      <style>
        {`
          @keyframes slideFromRight {
            from {
              opacity: 0;
              transform: translateX(400%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideFromLeft {
            from {
              opacity: 0;
              transform: translateX(-400%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes revealMiddle {
            from {
              opacity: 0;
              transform: scale(5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes spinClockwise {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(180deg);
            }
          }

          .animate-slideFromRight {
            animation: slideFromRight 0.25s ease-out forwards;
          }

          .animate-slideFromLeft {
            animation: slideFromLeft 0.25s ease-out forwards;
          }

          .animate-revealMiddle {
            animation: revealMiddle 0.25s ease-out forwards;
          }

          .animate-spinClockwise {
            animation: spinClockwise 0.25s ease-out forwards;
            animation-delay: 0.25s;
          }
        `}
      </style>
      <div className={`flex flex-col items-center justify-center space-y-12`}>
        <img
          src={LogotypeHarbourMedium}
          className={`${disabledAnimations ? '' : 'animate-slideFromLeft'}`}
          alt="Top SVG"
        />
        <div
          className={`w-16 h-16 flex justify-center items-center bg-sky rounded-2xl p-1 ${
            disabledAnimations
              ? ''
              : 'animate-revealMiddle animate-spinClockwise'
          }`}
        >
          <img src={ExchangeIcon} alt="Middle SVG" />
        </div>
        <img
          src={LogotypeMetamaskMedium}
          className={`${disabledAnimations ? '' : 'animate-slideFromRight'}`}
          alt="Bottom SVG"
        />
      </div>
    </div>
  );
};

export default IntroAnimatedLogos;
