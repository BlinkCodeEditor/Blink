import { useState } from 'react'
import { typeIconMap, FileType } from '../../utils/typeIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { defaultTree } from './mockTree';
export interface TreeNode {
    name: string;
    type: FileType | string;
    path: string;
    children?: TreeNode[];
    hasChildren?: boolean;
}

const TreeItem = ({ node, depth, onFileClick }: { node: TreeNode, depth: number, onFileClick: (name: string, type: FileType, path: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [children, setChildren] = useState<TreeNode[]>(node.children || []);
    
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

    const handleClick = async () => {
        if (node.type === 'folder') {
            const nextOpenState = !isOpen;
            setIsOpen(nextOpenState);
            
            if (nextOpenState && children.length === 0 && node.hasChildren) {
                setIsLoading(true);
                try {
                    const fetchedChildren = await (window as any).electronAPI.invoke('directory:getChildren', node.path);
                    if (fetchedChildren) {
                        setChildren(fetchedChildren);
                    }
                } catch (error) {
                    console.error('Failed to fetch children:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            // Ensure we handle non-standard types safely
            onFileClick(node.name, node.type as FileType, node.path);
        }
    };

    return (
        <div className="tree-node">
            <div 
                className={`tree-item ${isLoading ? 'loading' : ''}`} 
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
                    <FontAwesomeIcon icon={isLoading ? typeIconMap.folder.icon : iconData.icon} spin={isLoading} />
                </span>
                <span className="node-name">{node.name}</span>
            </div>
            
            {isOpen && children.length > 0 && (
                <div className="tree-children">
                    {children.map((child, index) => (
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
