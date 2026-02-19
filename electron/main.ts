import { app, BrowserWindow, ipcMain, dialog, protocol } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

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
        },
        autoHideMenuBar: true,
        frame: false,
        maximizable: true,
        resizable: true,
    });

    win.maximize();

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
        if (win?.isMaximized()) {
            win.unmaximize();
        } else {
            win?.maximize();
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

// Register custom protocol for local resources
protocol.registerSchemesAsPrivileged([
    { scheme: 'blink-resource', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true } }
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
