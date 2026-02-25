import logo from '../../assets/images/logo.png'

export default function EditorEmpty({ openFolder }: { openFolder: () => void }) {
  return (
    <div className="editor_empty">
        <img src={logo} alt="Blink Logo" />
        <p>No folder or file selected yet. Open a folder or create a new file to get started.</p>
        <div className="shortcuts">
            <p onClick={openFolder}><span>CTRL + O</span> Open folder</p>
            <p><span>CTRL + S</span> Save file</p>
            <p><span>CTRL + N</span> Create new file</p>
            <p><span>CTRL + SHIFT + N</span> Create new folder</p>
        </div>
    </div>
  )
}
