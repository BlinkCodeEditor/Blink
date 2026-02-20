import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { TerminalProfile } from '../../utils/terminalProfiles';

interface TerminalPanelProps {
    cwd?: string;
    profile?: TerminalProfile;
}

export interface TerminalPanelHandle {
    fit: () => void;
}

const TerminalPanel = forwardRef<TerminalPanelHandle, TerminalPanelProps>(
    ({ cwd, profile }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const termRef = useRef<Terminal | null>(null);
        const fitAddonRef = useRef<FitAddon | null>(null);
        const terminalIdRef = useRef<string | null>(null);

        const fit = useCallback(() => {
            if (!fitAddonRef.current || !terminalIdRef.current) return;
            try {
                fitAddonRef.current.fit();
                const dims = fitAddonRef.current.proposeDimensions();
                if (dims && dims.cols > 0 && dims.rows > 0) {
                    window.electronAPI.send('terminal:resize', terminalIdRef.current, dims.cols, dims.rows);
                }
            } catch {
                // container might not be visible yet
            }
        }, []);

        useImperativeHandle(ref, () => ({ fit }), [fit]);

        useEffect(() => {
            if (!containerRef.current) return;

            // ── Create xterm instance ─────────────────────────────────────────
            const term = new Terminal({
                cursorBlink: true,
                fontSize: 13,
                fontFamily: '"JetBrainsMono","Geist Mono",  monospace', // Added fallbacks for a cleaner look
                fontWeight: '500',
                drawBoldTextInBrightColors: false,
                fontWeightBold: '500',
                letterSpacing: 1,
                allowProposedApi: true,
                theme: {
                    background: '#17161a',       // Your $bg
                    foreground: '#f3f3f3',       // Your $white
                    cursor: '#217DFF',           // Your $primary
                    cursorAccent: '#17161a',     // Match background for block cursor text
                    selectionBackground: 'rgba(33, 125, 255, 0.3)', // $primary with transparency
                    
                    // ANSI Colors mapped to your scheme
                    black: '#131313',            // $black
                    red: '#ff0707',              // $error
                    green: '#5cb85c',            // $success
                    yellow: '#ffc107',           // $warning
                    blue: '#217DFF',             // $primary
                    magenta: '#1961c7',          // $secondary (closest fit)
                    cyan: '#777777',             // $pending (closest fit)
                    white: '#b4b4b4',            // $gray
                    
                    // Bright variants (slightly lightened versions of your colors)
                    brightBlack: '#777777',      // $pending
                    brightRed: '#ff4d4d',
                    brightGreen: '#85d085',
                    brightYellow: '#ffd54f',
                    brightBlue: '#60a5fa',
                    brightMagenta: '#217DFF',
                    brightCyan: '#b4b4b4',
                    brightWhite: '#f3f3f3',       // $white
                },
                allowTransparency: true,
                scrollback: 5000,
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(containerRef.current);

            termRef.current = term;
            fitAddonRef.current = fitAddon;

            // Initial fit after next render frame
            requestAnimationFrame(() => {
                try { fitAddon.fit(); } catch { /* not yet visible */ }
            });

            // ── Spawn PTY in main process ─────────────────────────────────────
            const shell = profile?.shell;
            window.electronAPI.invoke('terminal:create', cwd, shell).then((id: string) => {
                terminalIdRef.current = id;

                // Stream PTY output → xterm
                const dataHandler = (_: Electron.IpcRendererEvent, termId: string, data: string) => {
                    if (termId === id) term.write(data);
                };
                const exitHandler = (_: Electron.IpcRendererEvent, termId: string) => {
                    if (termId === id) term.write('\r\n\x1b[90m[process ended]\x1b[0m\r\n');
                };

                window.electronAPI.on('terminal:data', dataHandler);
                window.electronAPI.on('terminal:exit', exitHandler);

                // Stream key input → PTY
                term.onData((data) => {
                    window.electronAPI.send('terminal:input', id, data);
                });

                // Fit after PTY is ready
                requestAnimationFrame(() => {
                    try {
                        fitAddon.fit();
                        const dims = fitAddon.proposeDimensions();
                        if (dims && dims.cols > 0 && dims.rows > 0) {
                            window.electronAPI.send('terminal:resize', id, dims.cols, dims.rows);
                        }
                    } catch { /* not yet visible */ }
                });

                // Cleanup captured references
                return () => {
                    window.electronAPI.off('terminal:data', dataHandler);
                    window.electronAPI.off('terminal:exit', exitHandler);
                    window.electronAPI.send('terminal:kill', id);
                };
            });

            // ── ResizeObserver to reflow on panel resize ──────────────────────
            const ro = new ResizeObserver(() => fit());
            ro.observe(containerRef.current);

            return () => {
                ro.disconnect();
                // Kill PTY
                if (terminalIdRef.current) {
                    window.electronAPI.send('terminal:kill', terminalIdRef.current);
                }
                term.dispose();
                termRef.current = null;
                fitAddonRef.current = null;
                terminalIdRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        return <div className="terminal_panel" ref={containerRef} />;
    }
);

TerminalPanel.displayName = 'TerminalPanel';
export default TerminalPanel;
