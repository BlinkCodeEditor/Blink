import OnboardingContinue from "./OnboardingContinue";
import OnboardingLeftHeader from "./OnboardingLeftHeader";

export default function OnboardingLeft({ accepted, currentStep, totalSteps, onboardingSteps, additionalComponent, onNextStep, onPreviousStep, onClose }: { accepted: boolean, currentStep: number, totalSteps: number, onboardingSteps: { title: string, description: string }[], additionalComponent: React.ReactNode, onNextStep: () => void, onPreviousStep: () => void, onClose: () => void }) {
  return (
    <div className="onboarding_left">
        <OnboardingLeftHeader currentStep={currentStep} totalSteps={totalSteps} onboardingSteps={onboardingSteps} />
        {additionalComponent}
        <OnboardingContinue accepted={accepted} currentStep={currentStep} totalSteps={totalSteps} onNextStep={onNextStep} onPreviousStep={onPreviousStep} onClose={onClose} />
    </div>
  )
}
