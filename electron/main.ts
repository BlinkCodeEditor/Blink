import { app, BrowserWindow, ipcMain, dialog, protocol, screen } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import * as pty from "node-pty";
import { initialize } from "@aptabase/electron/main";

initialize("A-EU-7120104303");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

let win: BrowserWindow | null;

const EXCLUDED_DIRS = ['.git', 'node_modules', 'dist', 'build', '.next', 'vendor', '.DS_Store'];

async function getFolderTree(dirPath: string, recursive: boolean = false): Promise<any> {
    const originalNoAsar = process.noAsar;
    process.noAsar = true;
    try {
        const stats = await fs.stat(dirPath);
        const name = path.basename(dirPath);

        if (stats.isDirectory()) {
            const children = await fs.readdir(dirPath);
            let childrenNodes: any[] = [];
            
            if (recursive) {
                childrenNodes = await Promise.all(
                    children
                        .filter(child => !EXCLUDED_DIRS.includes(child))
                        .map(child => getFolderTree(path.join(dirPath, child), true))
                );
                childrenNodes = childrenNodes.filter(n => n !== null);
            } else {
                // Shallow fetch: just identify which children have children
                childrenNodes = await Promise.all(
                    children.map(async (child) => {
                        try {
                            const childPath = path.join(dirPath, child);
                            const childStats = await fs.stat(childPath);
                            return {
                                name: child,
                                type: childStats.isDirectory() ? 'folder' : (path.extname(child).slice(1).toLowerCase() || 'file'),
                                path: childPath,
                                hasChildren: childStats.isDirectory()
                            };
                        } catch (e) {
                            console.error(`Failed to stat ${child}:`, e);
                            return null;
                        }
                    })
                );
                childrenNodes = childrenNodes.filter(n => n !== null);
            }

            return {
                name,
                type: 'folder',
                path: dirPath,
                children: childrenNodes.sort((a, b) => {
                    if (a.type === b.type) return a.name.localeCompare(b.name);
                    return a.type === 'folder' ? -1 : 1;
                }),
                hasChildren: children.length > 0
            };
        } else {
            const ext = path.extname(name).slice(1).toLowerCase();
            return {
                name,
                type: ext || 'file',
                path: dirPath
            };
        }
    } catch (error) {
        console.error(`Failed to get folder tree for ${dirPath}:`, error);
        return null;
    } finally {
        process.noAsar = originalNoAsar;
    }
}

/**
 * On Linux with frame:false, win.maximize() / win.unmaximize() don't work
 * reliably. We manage maximize state entirely ourselves with an explicit flag:
 *  - linuxIsMaximized      → boolean state (WM geometry checks are fragile)
 *  - linuxPreMaximizeBounds → saved bounds to restore on unmaximize
 *  - linuxSafeMaximize()   → saves bounds, fills the current display, sets flag
 *  - linuxSafeUnmaximize() → restores bounds, clears flag
 */
let linuxIsMaximized = false;
let linuxPreMaximizeBounds: Electron.Rectangle | null = null;

function linuxSafeMaximize(window: BrowserWindow) {
    if (process.platform === 'linux') {
        // Save current bounds so we can restore them later
        linuxPreMaximizeBounds = window.getBounds();
        // Maximize to the work area of whichever display the window is on now
        const { x, y, width, height } = screen.getDisplayMatching(window.getBounds()).workArea;
        window.setPosition(x, y);
        window.setSize(width, height);
        linuxIsMaximized = true;
        window.webContents.send('window-maximized');
    } else {
        window.maximize();
    }
}

function linuxSafeUnmaximize(window: BrowserWindow) {
    if (process.platform === 'linux') {
        if (linuxPreMaximizeBounds) {
            window.setBounds(linuxPreMaximizeBounds);
            linuxPreMaximizeBounds = null;
        } else {
            // Fallback: center a default-sized window on the current display
            const { x, y, width, height } = screen.getDisplayMatching(window.getBounds()).workArea;
            const w = 1280, h = 800;
            window.setPosition(Math.round(x + (width - w) / 2), Math.round(y + (height - h) / 2));
            window.setSize(w, h);
        }
        linuxIsMaximized = false;
        window.webContents.send('window-unmaximized');
    } else {
        window.unmaximize();
    }
}

function createWindow() {
    win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        icon: path.join(process.env.VITE_PUBLIC, "logo.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.mjs"),
            devTools: !!VITE_DEV_SERVER_URL,
            // devTools: true
        },
        autoHideMenuBar: true,
        frame: false,
        maximizable: true,
        resizable: true,
    });

    // On Linux, open on the display the cursor is currently on
    if (process.platform === 'linux') {
        const cursorDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
        const { x, y, width, height } = cursorDisplay.workArea;
        win.setPosition(x, y);
        win.setSize(width, height);
        // Mark as maximized — no pre-maximize bounds to save since the window
        // was just created; linuxSafeUnmaximize's fallback will center it.
        linuxIsMaximized = true;
    } else {
        win.maximize();
    }

    // Test active push message to Renderer-process.
    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString(),
        );
    });

    // Block DevTools shortcuts in production
    if (!VITE_DEV_SERVER_URL) {
        win.webContents.on('before-input-event', (event, input) => {
            if (
                (input.control && input.shift && input.key.toLowerCase() === 'i') ||
                (input.control && input.shift && input.key.toLowerCase() === 'j') ||
                (input.control && input.shift && input.key.toLowerCase() === 'c') ||
                input.key === 'F12'
            ) {
                event.preventDefault();
            }
        });
    }

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, "index.html"));
    }

    // Window controls IPC
    ipcMain.on("window-minimize", () => {
        win?.minimize();
    });

    ipcMain.on("window-maximize", () => {
        if (!win) return;
        if (process.platform === 'linux') {
            // Use our explicit boolean — geometry checks are unreliable because
            // the WM can shift the window by a pixel or two after setSize/setPosition.
            if (linuxIsMaximized) {
                linuxSafeUnmaximize(win);
            } else {
                linuxSafeMaximize(win);
            }
        } else {
            if (win.isMaximized()) {
                win.unmaximize();
            } else {
                win.maximize();
            }
        }
    });

    ipcMain.on("window-close", () => {
        win?.close();
    });

    // File System IPC
    ipcMain.handle('dialog:openDirectory', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(win!, {
            properties: ['openDirectory']
        });
        if (canceled) return null;
        
        return await getFolderTree(filePaths[0], false);
    });

    ipcMain.handle('directory:getChildren', async (_, dirPath: string) => {
        const tree = await getFolderTree(dirPath, false);
        return tree ? tree.children : [];
    });

    ipcMain.handle('directory:getTree', async (_, dirPath: string) => {
        return await getFolderTree(dirPath, false);
    });

    ipcMain.handle('path:dirname', async (_, filePath: string) => {
        return path.dirname(filePath);
    });

    ipcMain.handle('path:join', async (_, ...paths: string[]) => {
        return path.join(...paths);
    });

    ipcMain.handle('path:basename', async (_, filePath: string) => {
        return path.basename(filePath);
    });

    ipcMain.handle('path:exists', async (_, filePath: string) => {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    });

    ipcMain.handle('file:delete', async (_, filePath: string) => {
        try {
            await fs.rm(filePath, { recursive: true, force: true });
            return true;
        } catch (error) {
            console.error('Failed to delete:', error);
            return false;
        }
    });

    ipcMain.handle('file:rename', async (_, oldPath: string, newPath: string) => {
        try {
            await fs.rename(oldPath, newPath);
            return true;
        } catch (error) {
            console.error('Failed to rename:', error);
            return false;
        }
    });

    ipcMain.handle('file:copy', async (_, src: string, dest: string) => {
        try {
            // Use fs-extra or just a simple cp if available, but let's stick to Node fs
            // fs.cp is available in newer Node versions
            await (fs as any).cp(src, dest, { recursive: true });
            return true;
        } catch (error) {
            console.error('Failed to copy:', error);
            return false;
        }
    });

    ipcMain.handle('file:read', async (_, filePath: string) => {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            console.error('Failed to read file:', error);
            return null;
        }
    });

    ipcMain.handle('file:save', async (_, filePath: string, content: string) => {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
            return true;
        } catch (error) {
            console.error('Failed to save file:', error);
            return false;
        }
    });

    ipcMain.handle('file:create', async (_, filePath: string) => {
        try {
            await fs.writeFile(filePath, '', 'utf-8');
            return true;
        } catch (error) {
            console.error('Failed to create file:', error);
            return false;
        }
    });

    ipcMain.handle('directory:create', async (_, dirPath: string) => {
        try {
            await fs.mkdir(dirPath, { recursive: true });
            return true;
        } catch (error) {
            console.error('Failed to create directory:', error);
            return false;
        }
    });

    // ─── Terminal IPC ─────────────────────────────────────────────────────────
    // Map of terminalId → IPty instance
    const terminals = new Map<string, pty.IPty>();
    let _terminalCounter = 0;

    ipcMain.handle('terminal:create', async (_, cwd?: string, shell?: string) => {
        const defaultShell = process.platform === 'win32' ? 'powershell.exe' : (process.env.SHELL || '/bin/bash');
        const shellToUse = shell || defaultShell;
        const id = `term_${++_terminalCounter}`;
        const term = pty.spawn(shellToUse, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: cwd || process.env.HOME || '/',
            env: process.env as Record<string, string>,
        });
        terminals.set(id, term);
        term.onData((data) => {
            win?.webContents.send('terminal:data', id, data);
        });
        term.onExit(() => {
            terminals.delete(id);
            win?.webContents.send('terminal:exit', id);
        });
        return id;
    });

    ipcMain.on('terminal:input', (_, id: string, data: string) => {
        terminals.get(id)?.write(data);
    });

    ipcMain.on('terminal:resize', (_, id: string, cols: number, rows: number) => {
        if (cols > 0 && rows > 0) {
            terminals.get(id)?.resize(cols, rows);
        }
    });

    ipcMain.on('terminal:kill', (_, id: string) => {
        const term = terminals.get(id);
        if (term) {
            try { term.kill(); } catch { /* already dead */ }
            terminals.delete(id);
        }
    });
    // ─── End Terminal IPC ────────────────────────────────────────────────────

    // Window state events
    win.on("maximize", () => {
        win?.webContents.send("window-maximized");
    });

    win.on("unmaximize", () => {
        win?.webContents.send("window-unmaximized");
    });
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        win = null;
    }
});

// Register custom protocol for local resources and aptabase
protocol.registerSchemesAsPrivileged([
    { scheme: 'blink-resource', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } },
    { scheme: 'aptabase-ipc', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
]);

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.whenReady().then(() => {
    protocol.handle('blink-resource', async (request) => {
        try {
            const url = new URL(request.url);
            // With blink-resource://localhost/path, pathname will be /path
            let filePath = decodeURIComponent(url.pathname);
            
            // On Windows, the pathname returned by new URL() usually starts with a slash 
            // before the drive letter (e.g., "/C:/path"). We need to remove it.
            if (process.platform === 'win32' && filePath.startsWith('/') && filePath.length > 2 && filePath[2] === ':') {
                filePath = filePath.slice(1);
            }
            
            // On Linux/POSIX, if pathname still has a double slash (though less likely with localhost), simplify it
            if (filePath.startsWith('//')) {
                filePath = filePath.slice(1);
            }

            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            };

            const data = await fs.readFile(filePath);
            return new Response(data, {
                status: 200,
                headers: { 
                    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                    'Access-Control-Allow-Origin': '*' // Good practice for custom protocols
                }
            });
        } catch (error) {
            console.error('[blink-resource] Failed to serve:', request.url, error);
            return new Response(null, { status: 404 });
        }
    });
    createWindow();
});
