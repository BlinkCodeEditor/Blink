import { useRef, useEffect } from 'react'
import EditorTabs from './EditorTabs'
import './_Editor.scss'
import { Editor as MonacoEditor } from '@monaco-editor/react'
import { TabData } from '../../views/Home'
import { getLanguageByFilename } from '../../utils/languageMap'
import EditorEmpty from './EditorEmpty'
import { syncWorkspaceWithMonaco, setupCompilerOptions, TreeNode } from '../../utils/monacoSync'
import { FileType } from '../../utils/typeIcon'

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
}

export default function Editor({ tabs, activeTabIndex, setActiveTabIndex, onCloseTab, onContentChange, onCursorChange, onValidationChange, tree, openFolder, onOpenFile }: EditorProps) {
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
        />
        <div className="editor_main">
            {activeFile ? (
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
                            openCodeEditor: (source: any, resource: any, selection: any) => {
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
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        fontFamily: 'Geist Mono, monospace',
                        lineHeight: 24,
                        padding: { top: 20 },
                        wordBasedSuggestions: 'allDocuments',
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: 'on',
                        tabCompletion: 'on',
                        links: true,
                        renderValidationDecorations: 'on',
                    }}
                />
            ) : (
                <EditorEmpty openFolder={openFolder} />
            )}
        </div>
    </div>
  )
}
