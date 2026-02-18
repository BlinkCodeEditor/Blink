import EditorTabs from './EditorTabs'
import './_Editor.scss'
import { Editor as MonacoEditor } from '@monaco-editor/react'
import { TabData } from '../../views/Home'
import { getLanguageByFilename } from '../../utils/languageMap'
import EditorEmpty from './EditorEmpty'

interface EditorProps {
    tabs: TabData[];
    activeTabIndex: number;
    setActiveTabIndex: (index: number) => void;
    onCloseTab: (index: number) => void;
    openFolder: () => void;
    onContentChange: (newContent: string) => void;
    onCursorChange: (pos: { line: number, column: number }) => void;
    onValidationChange: (markers: any[]) => void;
}

export default function Editor({ tabs, activeTabIndex, setActiveTabIndex, onCloseTab, openFolder, onContentChange, onCursorChange, onValidationChange }: EditorProps) {
  const activeFile = tabs[activeTabIndex];

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
                    value={activeFile.content || ''}
                    theme="vs-dark"
                    onChange={(value) => onContentChange(value || '')}
                    onMount={(editor, monaco) => {
                        editor.onDidChangeCursorPosition((e) => {
                            onCursorChange({
                                line: e.position.lineNumber,
                                column: e.position.column
                            });
                        });

                        monaco.editor.onDidChangeMarkers((resources: any[]) => {
                            const resource = resources[0];
                            if (resource && resource.toString() === editor.getModel()?.uri.toString()) {
                                const markers = monaco.editor.getModelMarkers({ resource });
                                onValidationChange(markers);
                            }
                        });
                        
                        // Storage for jump functionality if needed via window/global
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
                    }}
                />
            ) : (
                <EditorEmpty openFolder={openFolder} />
            )}
        </div>
    </div>
  )
}
