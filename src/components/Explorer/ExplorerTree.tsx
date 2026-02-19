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

const TreeItem = ({ node, depth, onFileClick, selectedPath, onSelect, onExpand, onContextMenu, onMove }: { 
    node: TreeNode, 
    depth: number, 
    onFileClick: (name: string, type: FileType, path: string) => void,
    selectedPath: string | null,
    onSelect: (path: string) => void,
    onExpand: (path: string) => void,
    onContextMenu: (e: React.MouseEvent, node: TreeNode) => void,
    onMove: (srcPath: string, targetPath: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    
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

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(node.path);
        
        if (node.type === 'folder') {
            const nextOpenState = !isOpen;
            setIsOpen(nextOpenState);
            
            if (nextOpenState && (!node.children || node.children.length === 0) && node.hasChildren) {
                setIsLoading(true);
                try {
                    await onExpand(node.path);
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            // Ensure we handle non-standard types safely
            onFileClick(node.name, node.type as FileType, node.path);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node);
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('srcPath', node.path);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsDragOver(true);
            e.dataTransfer.dropEffect = 'move';
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        const srcPath = e.dataTransfer.getData('srcPath');
        if (srcPath && srcPath !== node.path) {
            onMove(srcPath, node.path);
        }
    };

    return (
        <div className="tree-node">
            <div 
                className={`tree-item ${isLoading ? 'loading' : ''} ${selectedPath === node.path ? 'selected' : ''} ${isDragOver ? 'drag-over' : ''}`} 
                style={{ paddingLeft: `${depth * 10 + 5}px` }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                draggable
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
            
            {isOpen && node.children && node.children.length > 0 && (
                <div className="tree-children">
                    {node.children.map((child, index) => (
                        <TreeItem 
                            key={`${child.path}-${index}`} 
                            node={child} 
                            depth={depth + 1} 
                            onFileClick={onFileClick} 
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                            onExpand={onExpand}
                            onContextMenu={onContextMenu}
                            onMove={onMove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface ExplorerTreeProps {
    onFileClick: (name: string, type: FileType, path: string) => void;
    externalTree?: TreeNode;
    selectedPath: string | null;
    onSelect: (path: string) => void;
    onExpand: (path: string) => void;
    onContextMenu: (e: React.MouseEvent, node: TreeNode) => void;
    onMove: (srcPath: string, targetPath: string) => void;
}

export default function ExplorerTree({ onFileClick, externalTree, selectedPath, onSelect, onExpand, onContextMenu, onMove }: ExplorerTreeProps) {
    const displayTree = externalTree ? [externalTree] : [defaultTree];

    return (
        <div className="explorer_tree">
            {displayTree.map((node, index) => (
                <TreeItem 
                    key={index} 
                    node={node} 
                    depth={0} 
                    onFileClick={onFileClick} 
                    selectedPath={selectedPath}
                    onSelect={onSelect}
                    onExpand={onExpand}
                    onContextMenu={onContextMenu}
                    onMove={onMove}
                />
            ))}
        </div>
    );
}
