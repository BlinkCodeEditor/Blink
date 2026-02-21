export default function OnboardingLeftHeader({ currentStep, totalSteps, onboardingSteps }: { currentStep: number, totalSteps: number, onboardingSteps: { title: string, description: string }[] }) {
  return (
    <div className="onboarding_left_header">
        <div className="top">
            <span>{currentStep} / {totalSteps}</span>
            <h1>{onboardingSteps[currentStep - 1].title}</h1>
        </div>
        <p>{onboardingSteps[currentStep - 1].description}</p>
    </div>
  )
}
