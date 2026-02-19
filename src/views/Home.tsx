import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Explorer from "../components/Explorer/Explorer";
import Editor from "../components/Editor/Editor";
import { FileType } from "../utils/typeIcon";
import { useKeybinds } from "../utils/keybinds";
import BottomBar from "../components/BottomBar/BottomBar";
import ProblemsPanel from "../components/BottomBar/ProblemsPanel";
import Changelog from "../components/Changelog/Changelog";
import pkg from "../../package.json";

export interface TabData {
    name: string;
    type: FileType;
    path: string;
    content?: string;
    isModified?: boolean;
}

export default function Home() {
    const [tabs, setTabs] = useState<TabData[]>([]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [tree, setTree] = useState<any>(null);
    const [cursorPos, setCursorPos] = useState({ line: 1, column: 1 });
    const [markers, setMarkers] = useState<any[]>([]);
    const [showProblems, setShowProblems] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);

    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('lastSeenVersion');
        if (lastSeenVersion !== pkg.version) {
            setShowChangelog(true);
        }
    }, []);

    const handleCloseChangelog = () => {
        localStorage.setItem('lastSeenVersion', pkg.version);
        setShowChangelog(false);
    };

    const openFolder = async () => {
        const folderTree = await (window as any).electronAPI.invoke('dialog:openDirectory');
        if (folderTree) {
            setTree(folderTree);
        }
    };

    const handleSave = async () => {
        const activeFile = tabs[activeTabIndex];
        if (activeFile && activeFile.isModified) {
            const success = await (window as any).electronAPI.invoke('file:save', activeFile.path, activeFile.content);
            if (success) {
                const newTabs = [...tabs];
                newTabs[activeTabIndex] = { ...activeFile, isModified: false };
                setTabs(newTabs);
            }
        }
    };

    useKeybinds({
        'Control+o': openFolder,
        'Control+s': handleSave
    });

    const handleFileClick = async (name: string, type: FileType, path: string) => {
        const existingIndex = tabs.findIndex(tab => tab.path === path);
        if (existingIndex !== -1) {
            setActiveTabIndex(existingIndex);
            setCursorPos({ line: 1, column: 1 });
            setMarkers([]);
        } else {
            const content = await (window as any).electronAPI.invoke('file:read', path);
            const newTab: TabData = { name, type, path, content: content || '', isModified: false };
            setTabs([...tabs, newTab]);
            setActiveTabIndex(tabs.length);
            setCursorPos({ line: 1, column: 1 });
            setMarkers([]);
        }
    };

    const handleCloseTab = (index: number) => {
        const newTabs = tabs.filter((_, i) => i !== index);
        setTabs(newTabs);
        if (activeTabIndex >= newTabs.length) {
            setActiveTabIndex(Math.max(0, newTabs.length - 1));
        }
        setCursorPos({ line: 1, column: 1 });
        setMarkers([]);
    };

    const handleContentChange = (newContent: string) => {
        setTabs(prevTabs => {
            const newTabs = [...prevTabs];
            const activeFile = newTabs[activeTabIndex];
            if (activeFile && activeFile.content !== newContent) {
                newTabs[activeTabIndex] = { ...activeFile, content: newContent, isModified: true };
            }
            return newTabs;
        });
    };

    const handleJumpToProblem = (line: number, column: number) => {
        const editor = (window as any).editorInstance;
        if (editor) {
            editor.setPosition({ lineNumber: line, column: column });
            editor.revealPositionInCenter({ lineNumber: line, column: column });
            editor.focus();
        }
    };

    return (
        <>
            <Navbar />
            <main>
                <Sidebar />
                <Explorer onFileClick={handleFileClick} tree={tree} />
                <Editor 
                    tabs={tabs} 
                    activeTabIndex={activeTabIndex} 
                    setActiveTabIndex={(index) => {
                        setActiveTabIndex(index);
                        setCursorPos({ line: 1, column: 1 });
                    }}
                    onCloseTab={handleCloseTab}
                    openFolder={openFolder}
                    onContentChange={handleContentChange}
                    onCursorChange={setCursorPos}
                    onValidationChange={setMarkers}
                />
            </main>
            <BottomBar 
                activeFile={tabs[activeTabIndex]} 
                cursorPos={cursorPos}
                errors={markers.filter(m => m.severity === 8).length}
                warnings={markers.filter(m => m.severity === 4).length}
                onToggleProblems={() => setShowProblems(!showProblems)}
            />
            {showProblems && (
                <ProblemsPanel 
                    markers={markers} 
                    onClose={() => setShowProblems(false)}
                    onJump={handleJumpToProblem}
                />
            )}
            {showChangelog && (
                <Changelog 
                    version={pkg.version} 
                    onClose={handleCloseChangelog} 
                />
            )}
        </>
    )
}
