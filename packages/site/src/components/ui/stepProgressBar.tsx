import { FC } from "react";

interface IProps {
  currentStep: number;
  totalSteps: number;
  withDefaultPadding?: boolean;
}

export const StepProgressBar: FC<IProps> = ({
  totalSteps,
  currentStep,
  withDefaultPadding = true,
}) => {
  return (
    <div className={`h-0.5 gap-0.5 flex ${withDefaultPadding && "mx-4 my-2"}`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`flex-auto ${
            index < currentStep ? "bg-blueberry" : "bg-gray-400"
          } }`}
        />
      ))}
    </div>
  );
};

export default StepProgressBar;
