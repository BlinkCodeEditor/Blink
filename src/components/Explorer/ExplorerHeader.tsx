import { faFileCirclePlus, faFolderPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function ExplorerHeader() {
    const actions = [
        { icon: faFileCirclePlus, label: "New File" },
        { icon: faFolderPlus, label: "New Folder" },
    ]

  return (
    <div className="explorer_header">
        <h1>Explorer</h1>
        <div className="explorer_header_actions">
            {actions.map((action) => (
                <button key={action.label}>
                    <FontAwesomeIcon icon={action.icon} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    </div>
  )
}
