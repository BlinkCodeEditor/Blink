import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SidebarLink({ label, icon, active, action }: { label: string, icon: any, active?: boolean, action?: () => void }) {
  return (
    <div className={`sidebar_option ${active ? 'active' : ''}`} onClick={action}>
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
    </div>
  )
}
