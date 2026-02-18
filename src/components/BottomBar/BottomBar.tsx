import ErrorsCount from './ErrorsCount'
import './_BottomBar.scss'
import { TabData } from '../../views/Home'
import { typeIconMap } from '../../utils/typeIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface BottomBarProps {
    activeFile?: TabData;
    cursorPos: { line: number; column: number };
    errors: number;
    warnings: number;
    onToggleProblems: () => void;
}

export default function BottomBar({ activeFile, cursorPos, errors, warnings, onToggleProblems }: BottomBarProps) {
  const getLanguageName = (type: string) => {
    const names: Record<string, string> = {
        ts: 'TypeScript',
        tsx: 'TypeScript JSX',
        js: 'JavaScript',
        jsx: 'JavaScript JSX',
        html: 'HTML',
        css: 'CSS',
        scss: 'SCSS',
        sass: 'Sass',
        python: 'Python',
        go: 'Go',
        rust: 'Rust',
        java: 'Java',
        php: 'PHP',
        dart: 'Dart',
        swift: 'Swift',
    };
    return names[type] || type.toUpperCase();
  };

  return (
    <div className="bottom_bar">
        <ErrorsCount errors={errors} warnings={warnings} onClick={onToggleProblems} />
        
        <div className="rightside">
            <div className="item">
                Ln {cursorPos.line}, Col {cursorPos.column}
            </div>
            {activeFile && (
                <>
                    <div className="item">
                        UTF-8
                    </div>
                    <div className="item language">
                        <FontAwesomeIcon 
                            icon={typeIconMap[activeFile.type]?.icon} 
                            style={{ color: typeIconMap[activeFile.type]?.color }}
                        />
                        <span>{getLanguageName(activeFile.type)}</span>
                    </div>
                </>
            )}
        </div>
    </div>
  )
}