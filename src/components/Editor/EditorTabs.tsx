import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FileType, typeIconMap } from '../../utils/typeIcon';
import { faTimes, faGear } from '@fortawesome/free-solid-svg-icons';
import { TabData } from '../../views/Home';

interface EditorTabsProps {
    tabs: TabData[];
    activeTabIndex: number;
    setActiveTabIndex: (index: number) => void;
    onCloseTab: (index: number) => void;
    isSettingsActive: boolean;
    showSettingsTab: boolean;
    onOpenSettings: () => void;
    onCloseSettings: () => void;
}

export default function EditorTabs({ tabs, activeTabIndex, setActiveTabIndex, onCloseTab, isSettingsActive, showSettingsTab, onOpenSettings, onCloseSettings }: EditorTabsProps) {

    function Tab({ name, type, index, isModified }: { name: string; type: FileType; index: number; isModified?: boolean }) {
        const iconData = typeIconMap[type] || typeIconMap.file;
        return (
            <div className={`tab ${activeTabIndex === index && !isSettingsActive ? 'active' : ''} ${isModified ? 'modified' : ''}`} onClick={() => setActiveTabIndex(index)}>
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
        {/* Settings virtual tab — visible only when opened via menu */}
        {showSettingsTab && (
            <div
                className={`tab tab--settings ${isSettingsActive ? 'active' : ''}`}
                onClick={onOpenSettings}
                title="Editor Settings"
            >
                <span className="tab_type" style={{ color: '#b4b4b4' }}>
                    <FontAwesomeIcon icon={faGear} />
                </span>
                <span className="tab_name">Settings</span>
                <div className="tab_close_wrapper">
                    <span className="tab_close" onClick={(e) => {
                        e.stopPropagation();
                        onCloseSettings();
                    }}><FontAwesomeIcon icon={faTimes} /></span>
                </div>
            </div>
        )}
    </div>
  )
}
