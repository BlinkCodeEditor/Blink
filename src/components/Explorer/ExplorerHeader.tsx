import { faFileCirclePlus, faFolderPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ExplorerHeaderProps {
    onNewFile: () => void;
    onNewFolder: () => void;
}

export default function ExplorerHeader({ onNewFile, onNewFolder }: ExplorerHeaderProps) {
    const actions = [
        { icon: faFileCirclePlus, label: "New File", onClick: onNewFile },
        { icon: faFolderPlus, label: "New Folder", onClick: onNewFolder },
    ]

  return (
    <div className="explorer_header">
        <h1>Explorer</h1>
        <div className="explorer_header_actions">
            {actions.map((action) => (
                <button key={action.label} onClick={action.onClick}>
                    <FontAwesomeIcon icon={action.icon} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    </div>
  )
}
