import { useState } from "react";
import OnboardingLeft from "./OnboardingLeft";
import './_Onboarding.scss'
import OnboardingAcceptTerms from "./Additionals/OnboardingAcceptTerms";

export default function Onboarding({ onClose }: { onClose: () => void }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [totalSteps] = useState(5)
    const [accepted, setAccepted] = useState(false)

    const onboardingSteps = [
        {
            title: "Welcome to Blink",
            description: "Welcome to Blink, the next-generation code editor meticulously crafted for speed, focus, and modern development workflows. Experience a workspace that adapts to your needs and helps you write better code faster than ever before. Whether you are building complex web applications or simple scripts, Blink provides the tools you need to succeed."
        },
        {
            title: "Blazing Fast by Design",
            description: "Experience unparalleled performance with instant startup times, zero input lag, and lightning-fast file handling. Blink is engineered to stay out of your way, ensuring that your tools never interrupt your creative flow or slow down your development process. Our custom-built engine ensures that even the largest projects load in the blink of an eye."
        },
        {
            title: "Built for Real Developers",
            description: "Designed with the needs of professional developers in mind, Blink features smart editing capabilities, powerful keyboard shortcuts, and a clean, distraction-free interface. Boost your productivity by focusing on what matters most: your code. With deep integration and intelligent suggestions, you can spend less time fighting your editor and more time solving problems."
        },
        {
            title: "Not Another VS Code Fork",
            description: "Blink isn't just another VS Code fork. It's built from the ground up with a custom-engineered engine and a unique vision for the future of software development. Discover a fresh, high-performance alternative to traditional editors that prioritizes efficiency and user experience above all else, giving you a truly native feel on every platform."
        },
        {
            title: "Ready to Code?",
            description: "You're all set to experience the future of coding. Open your first project folder, explore the intuitive interface, and start building something amazing with the power and speed of Blink at your fingertips. We can't wait to see what you create with the most advanced development environment ever built.",
            additionalComponent: <OnboardingAcceptTerms accepted={accepted} setAccepted={setAccepted} />,
        }
    ]

    const handleNextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

  return (
    <>
        <div className="onboarding_overlay"></div>
        <div className="onboarding">
            <OnboardingLeft accepted={accepted} currentStep={currentStep} totalSteps={totalSteps} onboardingSteps={onboardingSteps} additionalComponent={onboardingSteps[currentStep - 1]?.additionalComponent} onNextStep={handleNextStep} onPreviousStep={handlePreviousStep} onClose={onClose} />
        </div>
    </>
  )
}
