import { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import Explorer from "../components/Explorer/Explorer";
import Editor from "../components/Editor/Editor";
import { FileType } from "../utils/typeIcon";
import { useKeybinds } from "../utils/keybinds";
import BottomBar from "../components/BottomBar/BottomBar";
import ProblemsPanel, { ActiveTab } from "../components/BottomBar/ProblemsPanel";
import Changelog from "../components/Changelog/Changelog";
import pkg from "../../package.json";

import CreationModal from "../components/Explorer/CreationModal";
import ContextMenu from "../components/Explorer/ContextMenu";

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
    
    // Modal state
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [creationType, setCreationType] = useState<'file' | 'folder'>('file');
    const [renamePath, setRenamePath] = useState<string | null>(null);

    // Selection state
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    // Context Menu state
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: any } | null>(null);
    const [clipboard, setClipboard] = useState<{ path: string, type: 'copy' | 'cut' } | null>(null);

    

    // Problems Panel state
    const [activeTab, setActiveTab] = useState<ActiveTab>('problems');

    const handleContextMenu = (e: React.MouseEvent, node: any) => {
        setContextMenu({ x: e.clientX, y: e.clientY, node });
    };

    const handleCopy = () => {
        if (contextMenu) setClipboard({ path: contextMenu.node.path, type: 'copy' });
    };

    const handleCut = () => {
        if (contextMenu) setClipboard({ path: contextMenu.node.path, type: 'cut' });
    };

    const handlePaste = async () => {
        if (!clipboard || !contextMenu) return;
        
        let targetDir = contextMenu.node.type === 'folder' 
            ? contextMenu.node.path 
            : await (window as any).electronAPI.invoke('path:dirname', contextMenu.node.path);

        const basename = await (window as any).electronAPI.invoke('path:basename', clipboard.path);
        const dest = await (window as any).electronAPI.invoke('path:join', targetDir, basename);

        if (clipboard.type === 'copy') {
            await (window as any).electronAPI.invoke('file:copy', clipboard.path, dest);
        } else {
            await (window as any).electronAPI.invoke('file:rename', clipboard.path, dest);
            setClipboard(null); // Clear after cut
        }
        
        // Refresh parent
        const updatedParent = await (window as any).electronAPI.invoke('directory:getTree', targetDir);
        if (updatedParent && tree) {
            const updateTree = (node: any): any => {
                if (node.path === targetDir) return { ...node, children: updatedParent.children };
                if (node.children) return { ...node, children: node.children.map(updateTree) };
                return node;
            };
            setTree(updateTree(tree));
        }
    };

    const handleDelete = async () => {
        if (!contextMenu) return;
        const success = await (window as any).electronAPI.invoke('file:delete', contextMenu.node.path);
        if (success) {
            const parentDir = await (window as any).electronAPI.invoke('path:dirname', contextMenu.node.path);
            const updatedParent = await (window as any).electronAPI.invoke('directory:getTree', parentDir);
            if (updatedParent && tree) {
                const updateTree = (node: any): any => {
                    if (node.path === parentDir) return { ...node, children: updatedParent.children };
                    if (node.children) return { ...node, children: node.children.map(updateTree) };
                    return node;
                };
                setTree(updateTree(tree));
            }
        }
    };

    const handleRenameClick = () => {
        if (contextMenu) {
            setRenamePath(contextMenu.node.path);
            setCreationType(contextMenu.node.type === 'folder' ? 'folder' : 'file');
            setIsCreationModalOpen(true);
        }
    };

    const handleFinishRename = async (newName: string) => {
        if (!renamePath) return;
        const parentDir = await (window as any).electronAPI.invoke('path:dirname', renamePath);
        const newPath = await (window as any).electronAPI.invoke('path:join', parentDir, newName);
        
        const success = await (window as any).electronAPI.invoke('file:rename', renamePath, newPath);
        if (success) {
            const updatedParent = await (window as any).electronAPI.invoke('directory:getTree', parentDir);
            if (updatedParent && tree) {
                const updateTree = (node: any): any => {
                    if (node.path === parentDir) return { ...node, children: updatedParent.children };
                    if (node.children) return { ...node, children: node.children.map(updateTree) };
                    return node;
                };
                setTree(updateTree(tree));
            }
        }
        setRenamePath(null);
    };

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

    const refreshTree = async () => {
        if (tree && tree.path) {
            const folderTree = await (window as any).electronAPI.invoke('directory:getTree', tree.path);
            if (folderTree) {
                setTree(folderTree);
            }
        }
    };

    const handleMove = async (srcPath: string, targetPath: string) => {
        // basename of src
        const basename = await (window as any).electronAPI.invoke('path:basename', srcPath);
        const destPath = await (window as any).electronAPI.invoke('path:join', targetPath, basename);
        
        // Don't move if target is same as current parent
        const currentParent = await (window as any).electronAPI.invoke('path:dirname', srcPath);
        if (currentParent === targetPath) return;

        const success = await (window as any).electronAPI.invoke('file:rename', srcPath, destPath);
        if (success) {
            // Refresh target and source parent
            const updatedTarget = await (window as any).electronAPI.invoke('directory:getTree', targetPath);
            const updatedSourceParent = await (window as any).electronAPI.invoke('directory:getTree', currentParent);
            
            if (tree) {
                const updateTree = (node: any): any => {
                    if (node.path === targetPath && updatedTarget) {
                        return { ...node, children: updatedTarget.children };
                    }
                    if (node.path === currentParent && updatedSourceParent) {
                        return { ...node, children: updatedSourceParent.children };
                    }
                    if (node.children) {
                        return { ...node, children: node.children.map(updateTree) };
                    }
                    return node;
                };
                setTree(updateTree(tree));
            }
        }
    };

    const handleExpand = async (path: string) => {
        const children = await (window as any).electronAPI.invoke('directory:getChildren', path);
        if (children && tree) {
            const updateTree = (node: any): any => {
                if (node.path === path) {
                    return { ...node, children };
                }
                if (node.children) {
                    return { ...node, children: node.children.map(updateTree) };
                }
                return node;
            };
            setTree(updateTree(tree));
        }
    };

    const handleCreateItem = async (name: string) => {
        if (!tree) return;
        
        let targetParentPath = tree.path;
        
        if (selectedPath) {
            const findNode = (node: any): any => {
                if (node.path === selectedPath) return node;
                if (node.children) {
                    for (const child of node.children) {
                        const found = findNode(child);
                        if (found) return found;
                    }
                }
                return null;
            };
            
            const selectedNode = findNode(tree);
            if (selectedNode) {
                if (selectedNode.type === 'folder') {
                    targetParentPath = selectedNode.path;
                } else {
                    targetParentPath = await (window as any).electronAPI.invoke('path:dirname', selectedNode.path);
                }
            }
        }
        
        const fullPath = await (window as any).electronAPI.invoke('path:join', targetParentPath, name);
        const channel = creationType === 'file' ? 'file:create' : 'directory:create';
        const success = await (window as any).electronAPI.invoke(channel, fullPath);
        
        if (success) {
            // Refresh ONLY the parent folder to make the new item visible instantly
            const updatedParent = await (window as any).electronAPI.invoke('directory:getTree', targetParentPath);
            if (updatedParent && updatedParent.children) {
                const updateTree = (node: any): any => {
                    if (node.path === targetParentPath) {
                        return { ...node, children: updatedParent.children, hasChildren: true };
                    }
                    if (node.children) {
                        return { ...node, children: node.children.map(updateTree) };
                    }
                    return node;
                };
                setTree(updateTree(tree));
            } else if (targetParentPath === tree.path) {
                // It's the root
                refreshTree();
            }
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
        'Control+s': handleSave,
        'Control+n': () => {
            setCreationType('file');
            setRenamePath(null);
            setIsCreationModalOpen(true);
        },
        'Control+Shift+n': () => {
            setCreationType('folder');
            setRenamePath(null);
            setIsCreationModalOpen(true);
        },
        'Control+`': () => {
            setShowProblems(!showProblems);
            setActiveTab('terminal');
        }
    });

    const handleFileClick = async (name: string, type: FileType, path: string) => {
        setSelectedPath(path);
        const existingIndex = tabs.findIndex(tab => tab.path === path);
        if (existingIndex !== -1) {
            setActiveTabIndex(existingIndex);
            setCursorPos({ line: 1, column: 1 });
        } else {
            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'].includes(name.split('.').pop()?.toLowerCase() || '');
            const content = isImage ? '' : await (window as any).electronAPI.invoke('file:read', path);
            const newTab: TabData = { name, type, path, content: content || '', isModified: false };
            setTabs([...tabs, newTab]);
            setActiveTabIndex(tabs.length);
            setCursorPos({ line: 1, column: 1 });
        }
    };

    const handleCloseTab = (index: number) => {
        const newTabs = tabs.filter((_, i) => i !== index);
        setTabs(newTabs);
        if (activeTabIndex >= newTabs.length) {
            setActiveTabIndex(Math.max(0, newTabs.length - 1));
        }
        setCursorPos({ line: 1, column: 1 });
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

    const handleJumpToProblem = async (path: string, line: number, column: number) => {
        // Find if file is already open
        const existingIndex = tabs.findIndex(tab => tab.path === path);
        if (existingIndex !== -1) {
            setActiveTabIndex(existingIndex);
            // We need to wait for the tab to be active before jumping
            setTimeout(() => {
                const editor = (window as any).editorInstance;
                if (editor) {
                    editor.setPosition({ lineNumber: line, column: column });
                    editor.revealPositionInCenter({ lineNumber: line, column: column });
                    editor.focus();
                }
            }, 50);
        } else {
            // Open the file first
            const name = path.split('/').pop() || '';
            const type = (name.split('.').pop() || 'file') as any;
            const content = await (window as any).electronAPI.invoke('file:read', path);
            const newTab: TabData = { name, type, path, content: content || '', isModified: false };
            
            const newTabs = [...tabs, newTab];
            setTabs(newTabs);
            setActiveTabIndex(newTabs.length - 1);
            
            setTimeout(() => {
                const editor = (window as any).editorInstance;
                if (editor) {
                    editor.setPosition({ lineNumber: line, column: column });
                    editor.revealPositionInCenter({ lineNumber: line, column: column });
                    editor.focus();
                }
            }, 100);
        }
    };

    return (
        <>
            <Navbar />
            <main>
                <Sidebar 
                    showProblems={showProblems}
                    setShowProblems={setShowProblems}
                    setActiveTab={setActiveTab}
                    />
                <Explorer 
                    onFileClick={handleFileClick} 
                    tree={tree} 
                    onNewFile={() => {
                        setCreationType('file');
                        setIsCreationModalOpen(true);
                        setRenamePath(null);
                    }}
                    onNewFolder={() => {
                        setCreationType('folder');
                        setIsCreationModalOpen(true);
                        setRenamePath(null);
                    }}
                    selectedPath={selectedPath}
                    onSelect={setSelectedPath}
                    onExpand={handleExpand}
                    onContextMenu={handleContextMenu}
                    onMove={handleMove}
                />
                <Editor 
                    tabs={tabs} 
                    activeTabIndex={activeTabIndex} 
                    setActiveTabIndex={(index) => {
                        setActiveTabIndex(index);
                        setCursorPos({ line: 1, column: 1 });
                    }}
                    onCloseTab={handleCloseTab}
                    onContentChange={handleContentChange}
                    onCursorChange={setCursorPos}
                    onValidationChange={setMarkers}
                    openFolder={openFolder}
                    tree={tree}
                    onOpenFile={handleFileClick}
                />
            </main>
            <BottomBar 
                activeFile={tabs[activeTabIndex]} 
                cursorPos={cursorPos}
                errors={markers.filter(m => m.severity === 8).length}
                warnings={markers.filter(m => m.severity === 4 || m.severity === 2 || m.severity === 1).length}
                onToggleProblems={() => {setShowProblems(!showProblems); setActiveTab('problems')}}
            />
            {showProblems && (
                <ProblemsPanel 
                    markers={markers} 
                    onClose={() => setShowProblems(false)}
                    onJump={handleJumpToProblem}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            )}
            {showChangelog && (
                <Changelog 
                    version={pkg.version} 
                    onClose={handleCloseChangelog} 
                />
            )}
            <CreationModal
                isOpen={isCreationModalOpen}
                type={creationType}
                onClose={() => {
                    setIsCreationModalOpen(false);
                    setRenamePath(null);
                }}
                onCreate={renamePath ? handleFinishRename : handleCreateItem}
                initialValue={renamePath ? contextMenu?.node.name : ''}
            />
            {contextMenu && (
                <ContextMenu 
                    x={contextMenu.x} 
                    y={contextMenu.y} 
                    onClose={() => setContextMenu(null)}
                    options={[
                        { label: 'Copy', onClick: handleCopy },
                        { label: 'Cut', onClick: handleCut },
                        { label: 'Paste', onClick: handlePaste, danger: false },
                        { label: 'Rename', onClick: handleRenameClick },
                        { label: 'Delete', onClick: handleDelete, danger: true },
                    ]}
                />
            )}
        </>
    )
}
