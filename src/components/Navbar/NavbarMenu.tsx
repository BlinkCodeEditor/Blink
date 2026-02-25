import { useState, useEffect, useRef } from 'react';

export default function NavbarMenu() {
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [message, setMessage] = useState('Check for updates');
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt') {
                e.preventDefault();
                setMenuVisible(prev => {
                    if (prev) setDropdownOpen(null);
                    return !prev;
                });
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setDropdownOpen(null);
                setMenuVisible(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const onUpdateAvailable = () => setMessage('Update available! Downloading...');
        const onUpdateNotAvailable = () => setMessage('No updates found');
        const onUpdateDownloaded = () => {
            setMessage('Update downloaded! You can install it now.');
            setUpdateAvailable(true);
        };

        window.electronAPI.on('update_available', onUpdateAvailable);
        window.electronAPI.on('update_not_available', onUpdateNotAvailable);
        window.electronAPI.on('update_downloaded', onUpdateDownloaded);

        return () => {
            window.electronAPI.off('update_available', onUpdateAvailable);
            window.electronAPI.off('update_not_available', onUpdateNotAvailable);
            window.electronAPI.off('update_downloaded', onUpdateDownloaded);
        };
    }, []);

    const handleCheckForUpdates = () => {
        setMessage('Checking for updates...');
        window.electronAPI.send('check-update');
    };

    const handleInstallAndRestart = () => {
        window.electronAPI.send('restart_app');
    };

    if (!menuVisible) return null;

    return (
        <div className="navbar_menu" ref={menuRef}>
            <div 
                className={`menu_item ${dropdownOpen === 'Edit' ? 'active' : ''}`} 
                onClick={() => setDropdownOpen(dropdownOpen === 'Edit' ? null : 'Edit')}
            >
                Edit
                {dropdownOpen === 'Edit' && (
                    <div className="menu_dropdown">
                        <div className="menu_dropdown_item" onClick={(e) => e.stopPropagation()}>
                            {!updateAvailable ? (
                                <button onClick={handleCheckForUpdates}>{message}</button>
                            ) : (
                                <button onClick={handleInstallAndRestart}>Install and restart app</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
