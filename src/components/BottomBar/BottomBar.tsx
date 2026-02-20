import ErrorsCount from './ErrorsCount'
import './_BottomBar.scss'
import { TabData } from '../../views/Home'
import { typeIconMap } from '../../utils/typeIcon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getLanguageByFilename } from '../../utils/languageMap'

interface BottomBarProps {
    activeFile?: TabData;
    cursorPos: { line: number; column: number };
    errors: number;
    warnings: number;
    onToggleProblems: () => void;
}

export default function BottomBar({ activeFile, cursorPos, errors, warnings, onToggleProblems }: BottomBarProps) {

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
                        <span>{getLanguageByFilename(activeFile.name)}</span>
                    </div>
                </>
            )}
        </div>
    </div>
  )
}