import { OnboardingModalContext } from '@/contexts/OnboardingModal/OnboardingModalContext';
import { useContext } from 'react';

export const useOnboardingModal = () => useContext(OnboardingModalContext);
