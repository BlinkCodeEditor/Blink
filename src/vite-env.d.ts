/// <reference types="vite/client" />

interface Window {
    electronAPI: {
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        close: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
        onMaximizedChange: (callback: (isMaximized: boolean) => void) => void;
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        off: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        send: (channel: string, ...args: any[]) => void;
        invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
}
