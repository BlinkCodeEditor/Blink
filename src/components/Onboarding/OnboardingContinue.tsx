export default function OnboardingContinue({ accepted, currentStep, totalSteps, onNextStep, onPreviousStep, onClose }: { accepted: boolean, currentStep: number, totalSteps: number, onNextStep: () => void, onPreviousStep: () => void, onClose: () => void }) {
  return (
    <div className="onboarding_left_continue">
        {currentStep > 1 && <button className='previous' onClick={onPreviousStep}>Previous</button>}
        {currentStep < totalSteps && <button className='next' onClick={onNextStep}>Next</button>}
        {currentStep === totalSteps && <button className='finish' disabled={!accepted} onClick={accepted ? onClose : () => {}}>Finish</button>}
    </div>
  )
}
