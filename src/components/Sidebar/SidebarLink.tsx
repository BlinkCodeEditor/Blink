import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SidebarLink({ label, icon, active }: { label: string, icon: any, active?: boolean }) {
  return (
    <div className={`sidebar_option ${active ? 'active' : ''}`}>
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
    </div>
  )
}
