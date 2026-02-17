import { FileType } from '../../utils/typeIcon'
import './_Explorer.scss'
import ExplorerHeader from './ExplorerHeader'
import ExplorerTree from './ExplorerTree'

interface ExplorerProps {
    onFileClick: (name: string, type: FileType, path: string) => void;
    tree: any;
}

export default function Explorer({ onFileClick, tree }: ExplorerProps) {
  return (
    <div className="explorer">
        <ExplorerHeader />
        <ExplorerTree onFileClick={onFileClick} externalTree={tree} />
    </div>
  )
}
