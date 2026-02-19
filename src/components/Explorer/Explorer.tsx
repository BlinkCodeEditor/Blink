import { useState, useRef, useEffect, useCallback } from 'react'
import { FileType } from '../../utils/typeIcon'
import './_Explorer.scss'
import ExplorerHeader from './ExplorerHeader'
import ExplorerTree from './ExplorerTree'

interface ExplorerProps {
    onFileClick: (name: string, type: FileType, path: string) => void;
    tree: any;
    onNewFile: () => void;
    onNewFolder: () => void;
    selectedPath: string | null;
    onSelect: (path: string) => void;
    onExpand: (path: string) => void;
    onContextMenu: (e: React.MouseEvent, node: any) => void;
    onMove: (srcPath: string, targetPath: string) => void;
}

export default function Explorer({ 
  onFileClick, 
  tree, 
  onNewFile, 
  onNewFolder,
  selectedPath,
  onSelect,
  onExpand,
  onContextMenu,
  onMove
}: ExplorerProps) {
  const [width, setWidth] = useState(250);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    
    // Calculate new width based on sidebar offset (approx 64px for sidebar)
    const newWidth = e.clientX - 64; 
    if (newWidth > 150 && newWidth < 600) {
      setWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  return (
    <div className="explorer" style={{ width: `${width}px` }}>
        <ExplorerHeader onNewFile={onNewFile} onNewFolder={onNewFolder} />
        <ExplorerTree 
            onFileClick={onFileClick} 
            externalTree={tree} 
            selectedPath={selectedPath}
            onSelect={onSelect}
            onExpand={onExpand}
            onContextMenu={onContextMenu}
            onMove={onMove}
        />
        <div className="explorer-resizer" onMouseDown={startResizing} />
    </div>
  )
}
