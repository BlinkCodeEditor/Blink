import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SidebarLink({ label, icon }: { label: string, icon: any }) {
  return (
    <div className="sidebar_option">
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
    </div>
  )
}
