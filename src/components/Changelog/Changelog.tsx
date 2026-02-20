import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './_Changelog.scss';
import { typeIconMap } from '../../utils/typeIcon';

interface ChangelogProps {
    version: string;
    onClose: () => void;
}

export default function Changelog({ version, onClose }: ChangelogProps) {
    const changes = [
        {
            type: 'New Features',
            items: [
                'Nothing for this version 😭',
            ]
        },
        {
            type: 'Improvements',
            items: [
                "A lot of QOL improvements, I've added the brand new file and folder icons for:",
                <><FontAwesomeIcon color={typeIconMap['mjs'].color} icon={typeIconMap['mjs'].icon} /> .mjs</>,
                <><FontAwesomeIcon color={typeIconMap['gitignore'].color} icon={typeIconMap['gitignore'].icon} /> .gitignore</>,
                <><FontAwesomeIcon color={typeIconMap['LICENSE'].color} icon={typeIconMap['LICENSE'].icon} /> LICENSE</>,
                <><FontAwesomeIcon color={typeIconMap['md'].color} icon={typeIconMap['md'].icon} /> .md</>,
                <><FontAwesomeIcon color={typeIconMap['sh'].color} icon={typeIconMap['sh'].icon} /> .sh</>,
                <><FontAwesomeIcon color={typeIconMap['json'].color} icon={typeIconMap['json'].icon} /> .json</>,
                <><FontAwesomeIcon color={typeIconMap['node_modules'].color} icon={typeIconMap['node_modules'].icon} /> node_modules</>,
                <><FontAwesomeIcon color={typeIconMap['exe'].color} icon={typeIconMap['exe'].icon} /> .exe</>,
                <><FontAwesomeIcon color={typeIconMap['git'].color} icon={typeIconMap['git'].icon} /> .git</>,
                <><FontAwesomeIcon color={typeIconMap['github'].color} icon={typeIconMap['github'].icon} /> .github</>,
                <><FontAwesomeIcon color={typeIconMap['electron'].color} icon={typeIconMap['electron'].icon} /> .electron</>,
            ]
        }
    ];

    return (
        <div className="changelog_modal">
            <div className="changelog_header">
                <div className="title_area">
                    <h3>What's New</h3>
                    <span className="version">v{version}</span>
                </div>
                <button className="close_btn" onClick={onClose} aria-label="Close">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <div className="changelog_content">
                {changes.map((section, idx) => (
                    <div key={idx} className="change_section">
                        <h4>{section.type}</h4>
                        <ul>
                            {section.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="changelog_footer">
                <button className="got_it_btn" onClick={onClose}>
                    Got it
                </button>
            </div>
        </div>
    );
}
