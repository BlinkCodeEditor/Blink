import { faFile } from '@fortawesome/free-regular-svg-icons'
import { faCodeBranch, faCubes, faSearch, faTerminal } from '@fortawesome/free-solid-svg-icons'
import SidebarLink from './SidebarLink'
import './_Sidebar.scss'
import { ActiveTab } from '../BottomBar/ProblemsPanel'

export default function Sidebar({ showProblems, setShowProblems, setActiveTab }: { showProblems: boolean, setShowProblems: (showProblems: boolean) => void, setActiveTab: (tab: ActiveTab) => void }) {

  interface SidebarOption {
    label: string
    icon: any
    active?: boolean
    action?: () => void
  }

  const options: SidebarOption[] = [
    {
      label: 'Explorer (Ctrl + Shift + E)',
      icon: faFile,
      active: true
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
      label: 'Terminal (Ctrl + `)',
      icon: faTerminal,
      action: () => {
        setShowProblems(!showProblems);
        setActiveTab('terminal');
      }
    },
    {
      label: 'Community (Ctrl + Shift + C)',
      icon: faCubes
    }
  ]

  return (
    <div className="sidebar">
        {options.map((option, index) => (
            <SidebarLink key={index} label={option.label} icon={option.icon} active={option.active} action={option.action} />
        ))}
    </div>
  )
}
