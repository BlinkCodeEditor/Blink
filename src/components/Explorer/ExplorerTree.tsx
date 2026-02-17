import { useState } from 'react'
import { typeIconMap, FileType } from '../../utils/typeIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { defaultTree, TreeNode } from './mockTree';

const TreeItem = ({ node, depth, onFileClick }: { node: TreeNode, depth: number, onFileClick: (name: string, type: FileType, path: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Determine icon and color
    let iconData = typeIconMap.file;
    if (node.type === 'folder') {
        iconData = typeIconMap.folder;
    } else {
        const extension = node.name.split('.').pop();
        if (extension && extension in typeIconMap) {
            iconData = typeIconMap[extension as keyof typeof typeIconMap];
        }
    }

    const handleClick = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        } else {
            onFileClick(node.name, node.type, node.path);
        }
    };

    return (
        <div className="tree-node">
            <div 
                className="tree-item" 
                style={{ paddingLeft: `${depth * 10 + 5}px` }}
                onClick={handleClick}
            >
                {node.type === 'folder' && (
                    <span className="arrow-icon">
                        <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} size="xs" />
                    </span>
                )}
                {node.type !== 'folder' && <span className="spacer" />}
                
                <span 
                    className={`file-icon ${node.type}`}
                    style={{ color: iconData.color }}
                >
                    <FontAwesomeIcon icon={iconData.icon} />
                </span>
                <span className="node-name">{node.name}</span>
            </div>
            
            {isOpen && node.children && (
                <div className="tree-children">
                    {node.children.map((child, index) => (
                        <TreeItem key={index} node={child} depth={depth + 1} onFileClick={onFileClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ExplorerTreeProps {
    onFileClick: (name: string, type: FileType, path: string) => void;
    externalTree?: TreeNode;
}

export default function ExplorerTree({ onFileClick, externalTree }: ExplorerTreeProps) {
    const displayTree = externalTree ? [externalTree] : [defaultTree];

    return (
        <div className="explorer_tree">
            {displayTree.map((node, index) => (
                <TreeItem key={index} node={node} depth={0} onFileClick={onFileClick} />
            ))}
        </div>
    );
}
