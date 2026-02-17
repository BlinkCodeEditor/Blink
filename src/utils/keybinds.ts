import { useEffect } from 'react';

export function useKeybinds(keybinds: Record<string, () => void>) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const keys = [];
            if (event.ctrlKey) keys.push('Control');
            if (event.shiftKey) keys.push('Shift');
            if (event.altKey) keys.push('Alt');
            if (event.metaKey) keys.push('Meta');
            
            if (!['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) {
                keys.push(event.key.toLowerCase());
            }

            const keyCombo = keys.join('+');
            
            if (keybinds[keyCombo]) {
                event.preventDefault();
                keybinds[keyCombo]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keybinds]);
}
