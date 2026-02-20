export interface TerminalProfile {
    id: string;
    name: string;
    shell: string;
    icon?: string;
    args?: string[];
}

export const TERMINAL_PROFILES: TerminalProfile[] = [
    {
        id: 'powershell',
        name: 'PowerShell',
        shell: 'powershell.exe',
    },
    {
        id: 'cmd',
        name: 'Command Prompt',
        shell: 'cmd.exe',
    },
    {
        id: 'bash',
        name: 'Bash',
        shell: '/bin/bash',
    },
    {
        id: 'zsh',
        name: 'Zsh',
        shell: '/bin/zsh',
    },
];

const isWindows = (): boolean => {
    return typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('win');
};

export const getDefaultProfile = (): TerminalProfile => {
    if (isWindows()) {
        return TERMINAL_PROFILES[0]; // PowerShell on Windows
    }
    
    // On macOS/Linux, default to bash
    return TERMINAL_PROFILES[2]; // Bash
};
