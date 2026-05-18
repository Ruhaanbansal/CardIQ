import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  step: number;
  spendProfile: {
    monthlySpend: number;
    topCategory: string;
  };
  preferences: {
    wantsTravel: boolean;
    wantsCashback: boolean;
  };
  selectedCards: string[];
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateSpendProfile: (data: Partial<OnboardingState['spendProfile']>) => void;
  updatePreferences: (data: Partial<OnboardingState['preferences']>) => void;
  toggleCard: (cardId: string) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      spendProfile: {
        monthlySpend: 20000,
        topCategory: '',
      },
      preferences: {
        wantsTravel: false,
        wantsCashback: true,
      },
      selectedCards: [],
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      updateSpendProfile: (data) =>
        set((state) => ({ spendProfile: { ...state.spendProfile, ...data } })),
      updatePreferences: (data) =>
        set((state) => ({ preferences: { ...state.preferences, ...data } })),
      toggleCard: (cardId) =>
        set((state) => ({
          selectedCards: state.selectedCards.includes(cardId)
            ? state.selectedCards.filter((id) => id !== cardId)
            : [...state.selectedCards, cardId],
        })),
    }),
    {
      name: 'cardiq-onboarding',
    }
  )
);
