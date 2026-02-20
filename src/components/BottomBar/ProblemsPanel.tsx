import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faExclamationCircle, faTimes, faChevronDown, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import TerminalPanel, { TerminalPanelHandle } from './TerminalPanel';
import { TerminalProfile, TERMINAL_PROFILES, getDefaultProfile } from '../../utils/terminalProfiles';
import './_ProblemsPanel.scss';

interface TerminalTab {
    id: string;
    profileId: string;
    name: string;
}

export type ActiveTab = 'problems' | 'terminal';

interface ProblemsPanelProps {
    markers: any[];
    onClose: () => void;
    onJump: (path: string, line: number, column: number) => void;
    activeTab: ActiveTab;
    setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
    cwd?: string;
}

// Local storage keys
const getTerminalTabsKey = (cwd?: string) => `blink_terminal_tabs_${cwd || 'default'}`;
const getTerminalActiveKey = (cwd?: string) => `blink_terminal_active_${cwd || 'default'}`;

// Load saved tabs from localStorage
const loadSavedTabs = (cwd?: string): { tabs: TerminalTab[], activeId: string } | null => {
    try {
        const savedTabs = localStorage.getItem(getTerminalTabsKey(cwd));
        const savedActiveId = localStorage.getItem(getTerminalActiveKey(cwd));
        
        if (savedTabs && savedActiveId) {
            const tabs = JSON.parse(savedTabs) as TerminalTab[];
            const activeId = savedActiveId as string;
            
            // Validate that the active tab exists
            if (tabs.some(t => t.id === activeId)) {
                return { tabs, activeId };
            }
        }
    } catch (e) {
        console.error('Failed to load saved terminal tabs:', e);
    }
    return null;
};

// Save tabs to localStorage
const saveTabs = (tabs: TerminalTab[], activeId: string, cwd?: string) => {
    try {
        localStorage.setItem(getTerminalTabsKey(cwd), JSON.stringify(tabs));
        localStorage.setItem(getTerminalActiveKey(cwd), activeId);
    } catch (e) {
        console.error('Failed to save terminal tabs:', e);
    }
};

let terminalCounter = 0;

export default function ProblemsPanel({ markers, onClose, onJump, activeTab, setActiveTab, cwd }: ProblemsPanelProps) {
    const [height, setHeight] = useState(300);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [dropdownTargetTabId, setDropdownTargetTabId] = useState<string | null>(null);
    const isResizing = useRef(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);
    
    // Terminal tabs state - load from localStorage or use default
    const [tabs, setTabs] = useState<TerminalTab[]>(() => {
        const saved = loadSavedTabs(cwd);
        if (saved && saved.tabs.length > 0) {
            terminalCounter = Math.max(...saved.tabs.map(t => {
                const num = parseInt(t.id.split('_').pop() || '0');
                return isNaN(num) ? 0 : num;
            }), 0);
            return saved.tabs;
        }
        const defaultProfile = getDefaultProfile();
        return [{
            id: `terminal_${++terminalCounter}`,
            profileId: defaultProfile.id,
            name: `${defaultProfile.name} 1`
        }];
    });
    const [activeTerminalId, setActiveTerminalId] = useState<string>(() => {
        const saved = loadSavedTabs(cwd);
        return saved?.activeId || tabs[0]?.id || '';
    });
    
    // Process cwd changes to reload specific terminal tab configurations
    useEffect(() => {
        const saved = loadSavedTabs(cwd);
        if (saved && saved.tabs.length > 0) {
            terminalCounter = Math.max(...saved.tabs.map(t => {
                const num = parseInt(t.id.split('_').pop() || '0');
                return isNaN(num) ? 0 : num;
            }), 0);
            setTabs(saved.tabs);
            setActiveTerminalId(saved.activeId);
        } else {
            const defaultProfile = getDefaultProfile();
            const newTab: TerminalTab = {
                id: `terminal_${++terminalCounter}`,
                profileId: defaultProfile.id,
                name: `${defaultProfile.name} 1`
            };
            setTabs([newTab]);
            setActiveTerminalId(newTab.id);
        }
    }, [cwd]);
    
    // Keep terminal instances alive for each tab
    const terminalRefs = useRef<Map<string, React.RefObject<TerminalPanelHandle>>>(new Map());
    
    // Helper to get profile from profileId
    const getProfileById = (profileId: string): TerminalProfile => {
        return TERMINAL_PROFILES.find(p => p.id === profileId) || getDefaultProfile();
    };
    
    // Initialize ref for the first terminal if needed
    useEffect(() => {
        if (tabs.length > 0 && !terminalRefs.current.has(tabs[0].id)) {
            terminalRefs.current.set(tabs[0].id, { current: null });
        }
        // Save initial tabs to localStorage
        if (tabs.length > 0 && activeTerminalId) {
            saveTabs(tabs, activeTerminalId, cwd);
        }
    }, []);
    
    // Add new terminal tab
    const addNewTerminal = useCallback(() => {
        const defaultProfile = getDefaultProfile();
        const newTab: TerminalTab = {
            id: `terminal_${++terminalCounter}`,
            profileId: defaultProfile.id,
            name: `${defaultProfile.name} ${terminalCounter}`
        };
        
        setTabs(prev => {
            const newTabs = [...prev, newTab];
            saveTabs(newTabs, newTab.id, cwd);
            return newTabs;
        });
        setActiveTerminalId(newTab.id);
        
        // Initialize ref
        if (!terminalRefs.current.has(newTab.id)) {
            terminalRefs.current.set(newTab.id, { current: null });
        }
    }, []);
    
    // Close terminal tab
    const closeTerminal = useCallback((tabId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) return;
        
        let newTabs = tabs.filter(t => t.id !== tabId);
        let newActiveId = activeTerminalId;
        
        if (newTabs.length === 0) {
            // If no tabs left, create a new one
            const defaultProfile = getDefaultProfile();
            const newTab: TerminalTab = {
                id: `terminal_${++terminalCounter}`,
                profileId: defaultProfile.id,
                name: `${defaultProfile.name} ${terminalCounter}`
            };
            newTabs = [newTab];
            newActiveId = newTab.id;
            terminalRefs.current.set(newTab.id, { current: null });
        } else if (activeTerminalId === tabId) {
            // If closing active tab, switch to adjacent tab
            const newIndex = Math.min(tabIndex, newTabs.length - 1);
            newActiveId = newTabs[newIndex].id;
        } else {
            newActiveId = newTabs[0].id;
        }
        
        setTabs(newTabs);
        setActiveTerminalId(newActiveId);
        saveTabs(newTabs, newActiveId, cwd);
        terminalRefs.current.delete(tabId);
    }, [tabs, activeTerminalId]);
    
    // Update tab profile
    const updateTabProfile = useCallback((tabId: string, profile: TerminalProfile) => {
        setTabs(prev => {
            const newTabs = prev.map(tab => 
                tab.id === tabId 
                    ? { ...tab, profileId: profile.id, name: `${profile.name} ${tab.id.split('_').pop()}` } 
                    : tab
            );
            saveTabs(newTabs, activeTerminalId, cwd);
            return newTabs;
        });
        setDropdownTargetTabId(null);
        setShowProfileDropdown(false);
    }, [activeTerminalId]);

    const startResizing = useCallback(() => {
        isResizing.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'ns-resize';
    }, []);

    const stopResizing = useCallback(() => {
        isResizing.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
        document.body.style.cursor = 'default';
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current) return;
        const newHeight = window.innerHeight - e.clientY - 40;
        if (newHeight > 100 && newHeight < window.innerHeight * 0.8) {
            setHeight(newHeight);
        }
    }, []);

    // Re-fit terminal when panel height changes
    useEffect(() => {
        if (activeTab === 'terminal' && activeTerminalId) {
            const ref = terminalRefs.current.get(activeTerminalId);
            ref?.current?.fit();
        }
    }, [height, activeTab, activeTerminalId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
                setDropdownTargetTabId(null);
            }
        };
        
        if (showProfileDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileDropdown]);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', stopResizing);
        };
    }, [handleMouseMove, stopResizing]);

    const getNameFromUri = (uri: any) => {
        if (!uri) return 'Unknown';
        const str = uri.toString();
        return str.split('/').pop() || str;
    };

    const getPathFromUri = (uri: any) => {
        if (!uri) return '';
        const str = uri.toString();
        return str.replace(/^file:\/\//, '');
    };

    return (
        <div className="problems_panel" style={{ height: `${height}px` }}>
            <div className="resize_handle" onMouseDown={startResizing} />
            <div className="actions_header">
                <div className="actions">
                    <button
                        className={`title ${activeTab === 'problems' ? 'active' : ''}`}
                        onClick={() => setActiveTab('problems')}
                    >
                        Problems ({markers.length})
                    </button>
                    <button
                        className={`title ${activeTab === 'terminal' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('terminal');
                            // Initialize first terminal if needed
                            if (tabs.length === 0) {
                                addNewTerminal();
                            }
                        }}
                    >
                        Terminal
                    </button>
                </div>
                <button className="close_btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>

            {/* Problems list – always mounted, hidden when terminal is active */}
            <div className={`problems_list ${activeTab !== 'problems' ? 'hidden' : ''}`}>
                {markers.length > 0 ? (
                    markers.map((marker, index) => (
                        <div
                            key={index}
                            className={`problem_item ${marker.severity === 8 ? 'error' : 'warning'}`}
                            onClick={() => onJump(getPathFromUri(marker.resource), marker.startLineNumber, marker.startColumn)}
                        >
                            <FontAwesomeIcon
                                icon={marker.severity === 8 ? faTimesCircle : faExclamationCircle}
                                className="icon"
                            />
                            <div className="problem_details">
                                <span className="message">{marker.message}</span>
                                <span className="location">
                                    {getNameFromUri(marker.resource)} [Ln {marker.startLineNumber}, Col {marker.startColumn}]
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no_problems">No problems have been detected in the workspace.</div>
                )}
            </div>

            {/* Terminal – show the selected tab's terminal, keep others alive */}
            <div className={`terminal_wrapper ${activeTab !== 'terminal' ? 'hidden' : ''}`}>
                {/* Terminal tabs bar */}
                <div className="terminal_tabs">
                    <div className="terminal_tabs_list">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`terminal_tab ${activeTerminalId === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTerminalId(tab.id)}
                            >
                                <div 
                                    className="terminal_tab_profile"
                                    ref={activeTerminalId === tab.id ? profileDropdownRef : null}
                                >
                                    <button 
                                        className="tab_profile_button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownTargetTabId(tab.id);
                                            setShowProfileDropdown(!showProfileDropdown || dropdownTargetTabId !== tab.id);
                                        }}
                                    >
                                        <span className="tab_profile_name">{getProfileById(tab.profileId).name}</span>
                                        <FontAwesomeIcon icon={faChevronDown} className="tab_chevron" />
                                    </button>
                                    {showProfileDropdown && dropdownTargetTabId === tab.id && (
                                        <div className="profile_dropdown">
                                            {TERMINAL_PROFILES.map((profile) => (
                                                <button
                                                    key={profile.id}
                                                    className={`profile_option ${tab.profileId === profile.id ? 'active' : ''}`}
                                                    onClick={() => updateTabProfile(tab.id, profile)}
                                                >
                                                    <span className="profile_option_name">{profile.name}</span>
                                                    {tab.profileId === profile.id && (
                                                        <span className="check_mark">✓</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    className="terminal_tab_close"
                                    onClick={(e) => closeTerminal(tab.id, e)}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="terminal_tab_add" onClick={addNewTerminal}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                </div>
                
                <div className="terminals_container">
                    {tabs.map(tab => {
                        const profile = getProfileById(tab.profileId);
                        return (
                            <div 
                                key={tab.id} 
                                className={`terminal_instance ${activeTerminalId === tab.id ? 'active' : 'hidden'}`}
                            >
                                <TerminalPanel 
                                    key={`${tab.id}-${tab.profileId}-${cwd}`}
                                    ref={(el) => {
                                        if (el) terminalRefs.current.set(tab.id, { current: el });
                                        else terminalRefs.current.delete(tab.id);
                                    }}
                                    cwd={cwd} 
                                    profile={profile} 
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
