import { Button } from './ui/button';
import Confetti from '@/assets/confetti.svg';

export interface SuccessProps {
  onNextButtonClick?: () => void;
}

export const Success: React.FC<SuccessProps> = ({ onNextButtonClick }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-32">
      <img src={Confetti} className="mb-16" />
      <p className="heading1 text-snow mb-3">Welcome to Magic Ramps!</p>
      <p className="heading5 text-gray-50 text-center mb-14">
        We have successfully verified
        <br />
        your identity!
      </p>
      <Button onClick={onNextButtonClick}>Next</Button>
    </div>
  );
};
