import { faFile } from '@fortawesome/free-regular-svg-icons'
import { faCodeBranch, faCubes, faSearch, faTerminal } from '@fortawesome/free-solid-svg-icons'
import SidebarLink from './SidebarLink'
import './_Sidebar.scss'

export default function Sidebar() {

  interface SidebarOption {
    label: string
    icon: any
  }

  const options: SidebarOption[] = [
    {
      label: 'Explorer (Ctrl + Shift + E)',
      icon: faFile
    },
    {
      label: 'Search (Ctrl + Shift + F)',
      icon: faSearch
    },
    {
      label: 'Git (Ctrl + Shift + G)',
      icon: faCodeBranch
    },
    {
      label: 'Terminal (Ctrl + Shift + T)',
      icon: faTerminal
    },
    {
      label: 'Community (Ctrl + Shift + C)',
      icon: faCubes
    }
  ]

  return (
    <div className="sidebar">
        {options.map((option, index) => (
            <SidebarLink key={index} label={option.label} icon={option.icon} />
        ))}
    </div>
  )
}
