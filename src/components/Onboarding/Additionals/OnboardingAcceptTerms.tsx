import OnboardingAdditional from "./OnboardingAdditional";
import logo from '../../../assets/images/logo.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
export default function OnboardingAcceptTerms({ accepted, setAccepted }: { accepted: boolean, setAccepted: (accepted: boolean) => void }) {
  return (
    <OnboardingAdditional content={
        <>
            <div className="image">
                <img src={logo} alt="" />
            </div>
            <div className="content">
                <h2>Accept Terms</h2>
                <p>Please read and accept the terms of service and privacy policy</p>
                <div className="checkbox" onClick={() => setAccepted(!accepted)}>
                    <button className={accepted ? 'accepted' : ''}>{accepted ? <FontAwesomeIcon icon={faCheck} /> : ''}</button>
                    <p>I accept the Terms of Service and Privacy Policy</p>
                </div>
            </div>
        </>
    } />
  )
}
