import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Explorer from "../components/Explorer/Explorer";
import Editor from "../components/Editor/Editor";
import { FileType } from "../utils/typeIcon";
import { useKeybinds } from "../utils/keybinds";

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
        } else {
            const content = await (window as any).electronAPI.invoke('file:read', path);
            const newTab: TabData = { name, type, path, content: content || '', isModified: false };
            setTabs([...tabs, newTab]);
            setActiveTabIndex(tabs.length);
        }
    };

    const handleCloseTab = (index: number) => {
        const newTabs = tabs.filter((_, i) => i !== index);
        setTabs(newTabs);
        if (activeTabIndex >= newTabs.length) {
            setActiveTabIndex(Math.max(0, newTabs.length - 1));
        }
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

    return (
        <>
            <Navbar />
            <main>
                <Sidebar />
                <Explorer onFileClick={handleFileClick} tree={tree} />
                <Editor 
                    tabs={tabs} 
                    activeTabIndex={activeTabIndex} 
                    setActiveTabIndex={setActiveTabIndex}
                    onCloseTab={handleCloseTab}
                    openFolder={openFolder}
                    onContentChange={handleContentChange}
                />
            </main>
        </>
    )
}
