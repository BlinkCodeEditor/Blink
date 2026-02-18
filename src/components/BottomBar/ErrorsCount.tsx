import { faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ErrorsCountProps {
    errors: number;
    warnings: number;
    onClick: () => void;
}

export default function ErrorsCount({ errors, warnings, onClick }: ErrorsCountProps) {
    const values = [
        {
            label: 'Errors',
            value: errors,
            icon: faTimesCircle
        },
        {
            label: 'Warnings',
            value: warnings,
            icon: faExclamationCircle
        }
    ]

  return (
    <div className="leftside" onClick={onClick} style={{ cursor: 'pointer' }}>  
        {values.map((value, index) => (
            <div key={index} className="value">
                <FontAwesomeIcon icon={value.icon} />
                <span className="label">{value.label}</span>
                <span className="value_text">{value.value}</span>
            </div>
        ))}
    </div>
  )
}
