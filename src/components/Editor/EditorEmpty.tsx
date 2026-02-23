import { useState } from 'react';
import logo from '../../assets/images/logo.png'

export default function EditorEmpty({ openFolder }: { openFolder: () => void }) {
    const [message, setMessage] = useState('Check for updates');
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const handleCheckForUpdates = () => {
        setMessage('Checking for updates...');
        window.electronAPI.send('check-update');
    }

    const handleInstallAndRestart = () => {
        window.electronAPI.send('restart_app');
    }

    window.electronAPI.on('update_available', () => {
        setMessage('Update available! Downloading...');
    });

    window.electronAPI.on('update_not_available', () => {
        setMessage('No updates found');
    });

    window.electronAPI.on('update_downloaded', () => {
        setMessage('Update downloaded! You can install it now.');
        setUpdateAvailable(true);
  });

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
        <div className="check_for_updates">
            {!updateAvailable ? <button onClick={handleCheckForUpdates}>{message}</button> : <button onClick={handleInstallAndRestart}>Install and restart app</button>}
        </div>
    </div>
  )
}
