import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FileType, typeIconMap } from '../../utils/typeIcon';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { TabData } from '../../views/Home';

interface EditorTabsProps {
    tabs: TabData[];
    activeTabIndex: number;
    setActiveTabIndex: (index: number) => void;
    onCloseTab: (index: number) => void;
}

export default function EditorTabs({ tabs, activeTabIndex, setActiveTabIndex, onCloseTab }: EditorTabsProps) {

    function Tab({ name, type, index, isModified }: { name: string; type: FileType; index: number; isModified?: boolean }) {
        const iconData = typeIconMap[type] || typeIconMap.file;
        return (
            <div className={`tab ${activeTabIndex === index ? 'active' : ''} ${isModified ? 'modified' : ''}`} onClick={() => setActiveTabIndex(index)}>
                <span className='tab_type' style={{ color: iconData.color }}><FontAwesomeIcon icon={iconData.icon} /></span>
                <span className="tab_name">{name}</span>
                <div className="tab_close_wrapper">
                    <span className="tab_dot"></span>
                    <span className="tab_close" onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(index);
                    }}><FontAwesomeIcon icon={faTimes} /></span>
                </div>
            </div>
        )
    }

  return (
    <div className="editor_tabs">
        {tabs.map((tab, index) => (
            <Tab key={index} name={tab.name} type={tab.type} index={index} isModified={tab.isModified} />
        ))}
    </div>
  )
}
