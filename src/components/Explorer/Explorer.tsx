import './_Explorer.scss'
import ExplorerHeader from './ExplorerHeader'
import ExplorerTree from './ExplorerTree'

export default function Explorer() {
  return (
    <div className="explorer">
        <ExplorerHeader />
        <ExplorerTree />
    </div>
  )
}
