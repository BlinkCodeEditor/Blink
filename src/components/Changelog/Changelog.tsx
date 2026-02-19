import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './_Changelog.scss';

interface ChangelogProps {
    version: string;
    onClose: () => void;
}

export default function Changelog({ version, onClose }: ChangelogProps) {
    const changes = [
        {
            type: 'New Features',
            items: [
                'Creating new files and folders',
                'New keyboard shortcuts:',
                '- CTRL + N: Create new file',
                '- CTRL + SHIFT + N: Create new folder',
                'Context menu after right click the file/folder with options like copy/paste/cut/rename/remove',
                'Drag and drop files and folders to move them'
            ]
        },
        {
            type: 'Improvements',
            items: [
                'Added new shortcuts to home page',
                'Build also available for Linux'
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
