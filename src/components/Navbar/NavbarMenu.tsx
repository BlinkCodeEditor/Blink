import { useState, useEffect, useRef } from 'react';

interface DropdownItem {
    label: string | JSX.Element;
    onClick?: (e: React.MouseEvent) => void;
}

interface MenuItem {
    label: string;
    dropdownItems: DropdownItem[];
}

interface NavbarMenuProps {
    onOpenSettings: () => void;
}

export default function NavbarMenu({ onOpenSettings }: NavbarMenuProps) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [message, setMessage] = useState('Check for updates');
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [updateProgress, setUpdateProgress] = useState<number | null>(null);
    const [items, setItems] = useState<MenuItem[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleCheckForUpdates = () => {
        setMessage('Checking for updates...');
        window.electronAPI.send('check-update');
    };

    const handleInstallAndRestart = () => {
        window.electronAPI.send('restart_app');
    };

    // Update items whenever message or updateAvailable changes
    useEffect(() => {
        const menuItems: MenuItem[] = [
            {
                label: 'Edit',
                dropdownItems: [
                    {
                        label: !updateAvailable ? (
                            <button onClick={handleCheckForUpdates}>
                                {updateProgress !== null ? `Downloading... ${Math.round(updateProgress)}%` : message}
                            </button>
                        ) : (
                            <button onClick={handleInstallAndRestart}>Install and restart app</button>
                        ),
                        onClick: (e) => e.stopPropagation()
                    },
                    {
                        label: <button>Settings</button>,
                        onClick: (e) => {
                            e.stopPropagation();
                            onOpenSettings();
                            setDropdownOpen(null);
                            setMenuVisible(false);
                        }
                    }
                ]
            },
        ];
        setItems(menuItems);
    }, [message, updateAvailable, updateProgress, onOpenSettings]);

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
        const onUpdateError = (_event: any, error: string) => {
            setMessage(`Error: ${error}`);
            setUpdateProgress(null);
        };
        const onUpdateProgress = (_event: any, percent: number) => {
            setUpdateProgress(percent);
            setMessage(`Downloading update... ${Math.round(percent)}%`);
        };

        window.electronAPI.on('update_available', onUpdateAvailable);
        window.electronAPI.on('update_not_available', onUpdateNotAvailable);
        window.electronAPI.on('update_downloaded', onUpdateDownloaded);
        window.electronAPI.on('update_error', onUpdateError);
        window.electronAPI.on('update_progress', onUpdateProgress);

        return () => {
            window.electronAPI.off('update_available', onUpdateAvailable);
            window.electronAPI.off('update_not_available', onUpdateNotAvailable);
            window.electronAPI.off('update_downloaded', onUpdateDownloaded);
            window.electronAPI.off('update_error', onUpdateError);
            window.electronAPI.off('update_progress', onUpdateProgress);
        };
    }, []);

    if (!menuVisible) return null;

    return (
        <div className="navbar_menu" ref={menuRef}>
            {items.map((item) => (
                <div 
                    key={item.label}
                    className={`menu_item ${dropdownOpen === item.label ? 'active' : ''}`} 
                    onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                >
                    {item.label}
                    {dropdownOpen === item.label && (
                        <div className="menu_dropdown">
                            {item.dropdownItems.map((dropdownItem, index) => (
                                <div 
                                    key={index}
                                    className="menu_dropdown_item" 
                                    onClick={dropdownItem.onClick}
                                >
                                    {dropdownItem.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
