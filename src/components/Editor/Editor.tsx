import { useRef, useEffect } from 'react'
import EditorTabs from './EditorTabs'
import './_Editor.scss'
import { Editor as MonacoEditor } from '@monaco-editor/react'
import { TabData } from '../../views/Home'
import { getLanguageByFilename } from '../../utils/languageMap'
import EditorEmpty from './EditorEmpty'
import { syncWorkspaceWithMonaco, setupCompilerOptions, TreeNode } from '../../utils/monacoSync'
import { FileType } from '../../utils/typeIcon'
import ImagePreview from './ImagePreview'
import './_ImagePreview.scss'
import Settings, { EditorSettings } from '../Settings/Settings'

interface EditorProps {
    tabs: TabData[];
    activeTabIndex: number;
    setActiveTabIndex: (index: number) => void;
    onCloseTab: (index: number) => void;
    onContentChange: (newContent: string) => void;
    onCursorChange: (pos: { line: number, column: number }) => void;
    onValidationChange: (markers: any[]) => void;
    tree: TreeNode | null;
    openFolder: () => void;
    onOpenFile: (name: string, type: FileType, path: string) => void;
    // Settings
    settings: EditorSettings;
    onSettingChange: (key: keyof EditorSettings, value: any) => void;
    isSettingsActive: boolean;
    showSettingsTab: boolean;
    onOpenSettings: () => void;
    onCloseSettings: () => void;
    onOpenSettingsFolder: () => void;
}

export default function Editor({ tabs, activeTabIndex, setActiveTabIndex, onCloseTab, onContentChange, onCursorChange, onValidationChange, tree, openFolder, onOpenFile, settings, onSettingChange, isSettingsActive, showSettingsTab, onOpenSettings, onCloseSettings, onOpenSettingsFolder }: EditorProps) {
  const activeFile = tabs[activeTabIndex];
  const monacoRef = useRef<any>(null);
  const disposablesRef = useRef<any[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        disposablesRef.current.forEach(d => d.dispose());
        disposablesRef.current = [];
    };
  }, []);

  // Sync open tabs
  useEffect(() => {
    if (monacoRef.current && tabs.length > 0) {
        const monaco = monacoRef.current;
        tabs.forEach(tab => {
            const uri = monaco.Uri.file(tab.path);
            let model = monaco.editor.getModel(uri);
            if (!model) {
                monaco.editor.createModel(tab.content || '', getLanguageByFilename(tab.name), uri);
            } else {
                if (tab.content !== undefined && model.getValue() !== tab.content) {
                    model.setValue(tab.content);
                }
            }
        });
    }
  }, [tabs]);

  // Sync entire workspace tree for module resolution
  // Only sync when the root tree object changes (usually on folder open)
  const lastSyncedTreeRef = useRef<string | null>(null);
  useEffect(() => {
    if (monacoRef.current && tree && tree.path !== lastSyncedTreeRef.current) {
        syncWorkspaceWithMonaco(monacoRef.current, tree);
        
        // Re-setup compiler options with new root path for module resolution
        const syncDisposables = setupCompilerOptions(monacoRef.current, tree.path);
        disposablesRef.current.push(syncDisposables);
        
        lastSyncedTreeRef.current = tree.path;
    }
  }, [tree, monacoRef.current]);

  return (
    <div className="editor">
        <EditorTabs 
            tabs={tabs} 
            activeTabIndex={activeTabIndex} 
            setActiveTabIndex={setActiveTabIndex}
            onCloseTab={onCloseTab}
            isSettingsActive={isSettingsActive}
            showSettingsTab={showSettingsTab}
            onOpenSettings={onOpenSettings}
            onCloseSettings={onCloseSettings}
        />
        <div className="editor_main">
            {isSettingsActive ? (
                <Settings 
                    settings={settings} 
                    onSettingChange={onSettingChange} 
                    onOpenSettingsFolder={onOpenSettingsFolder}
                />
            ) : activeFile ? (
                ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'].includes(activeFile.name.split('.').pop()?.toLowerCase() || '') ? (
                    <ImagePreview path={activeFile.path} name={activeFile.name} />
                ) : (
                    <MonacoEditor
                        height="100%"
                        language={getLanguageByFilename(activeFile.name)}
                        path={activeFile.path}
                        value={activeFile.content || ''}
                        theme="vs-dark"
                        beforeMount={(monaco: any) => {
                            const syncDisposables = setupCompilerOptions(monaco, tree?.path);
                            disposablesRef.current.push(syncDisposables);
                        }}
                        onChange={(value) => onContentChange(value || '')}
                        onMount={(editor: any, monaco: any) => {
                            monacoRef.current = monaco;

                            // Register global editor opener for Ctrl+Click navigation
                            const openerDisposable = monaco.editor.registerEditorOpener({
                                openCodeEditor: (_source: any, resource: any, _selection: any) => {
                                    const path = resource.path;
                                    // Deriving name and type from path
                                    const name = path.split('/').pop() || '';
                                    const ext = name.split('.').pop() || '';
                                    const type = (ext || 'file') as any;
                                    
                                    onOpenFile(name, type, path);
                                    return true;
                                }
                            });
                            disposablesRef.current.push(openerDisposable);

                            // Link existing models to the editor
                            tabs.forEach(tab => {
                                const uri = monaco.Uri.file(tab.path);
                                if (!monaco.editor.getModel(uri)) {
                                    monaco.editor.createModel(tab.content || '', getLanguageByFilename(tab.name), uri);
                                }
                            });

                            // Initial sync of tree if available
                            if (tree) {
                                syncWorkspaceWithMonaco(monaco, tree);
                            }

                            // Immediate marker reporting
                            const markers = monaco.editor.getModelMarkers({});
                            onValidationChange(markers);

                            const cursorListener = editor.onDidChangeCursorPosition((e: any) => {
                                onCursorChange({
                                    line: e.position.lineNumber,
                                    column: e.position.column
                                });
                            });
                            disposablesRef.current.push(cursorListener);

                            const markersListener = monaco.editor.onDidChangeMarkers(() => {
                                const markers = monaco.editor.getModelMarkers({});
                                onValidationChange(markers);
                            });
                            disposablesRef.current.push(markersListener);
                            
                            (window as any).editorInstance = editor;
                        }}
                        options={{
                            fontSize: settings.fontSize,
                            minimap: { enabled: settings.minimap },
                            scrollBeyondLastLine: settings.scrollBeyondLastLine,
                            automaticLayout: true,
                            fontFamily: settings.fontFamily,
                            lineHeight: settings.lineHeight,
                            padding: { top: 20 },
                            wordBasedSuggestions: 'allDocuments',
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: 'on',
                            tabCompletion: 'on',
                            links: true,
                            renderValidationDecorations: 'on',
                            tabSize: settings.tabSize,
                            wordWrap: settings.wordWrap as any,
                            lineNumbers: settings.lineNumbers as any,
                            cursorStyle: settings.cursorStyle as any,
                            cursorBlinking: settings.cursorBlinking as any,
                            fontLigatures: settings.fontLigatures,
                            renderWhitespace: settings.renderWhitespace as any,
                            bracketPairColorization: { enabled: settings.bracketPairColorization },
                        }}
                    />
                )
            ) : (
                <EditorEmpty openFolder={openFolder} />
            )}
        </div>
    </div>
  )
}
