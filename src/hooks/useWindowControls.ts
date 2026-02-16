import { useState, useEffect } from 'react';

export function useWindowControls() {
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        const handleMaximize = () => setIsMaximized(true);
        const handleUnmaximize = () => setIsMaximized(false);

        // Check initial state if possible or wait for sync
        // In this simple setup, we rely on events. 
        // A more robust setup might ask main process for initial state.
        
        window.electronAPI.on('window-maximized', handleMaximize);
        window.electronAPI.on('window-unmaximized', handleUnmaximize);

        return () => {
            // Cleanup listeners if your API supports it, though 'off' might need exact reference
            // For now, let's assume simple usage where component mounts once or use a robust off
            // The challenge with 'off' in preload is it might need the exact same function reference passed to ipcRenderer.
            // But our preload wraps it.
             window.electronAPI.off('window-maximized', handleMaximize);
             window.electronAPI.off('window-unmaximized', handleUnmaximize);
        };
    }, []);

    const minimize = () => window.electronAPI.send('window-minimize');
    const toggleMaximize = () => window.electronAPI.send('window-maximize');
    const close = () => window.electronAPI.send('window-close');

    return {
        isMaximized,
        minimize,
        toggleMaximize,
        close
    };
}
