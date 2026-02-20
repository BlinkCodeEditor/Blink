import { FileType } from "./typeIcon";
import { getLanguageByFilename } from "./languageMap";

export interface TreeNode {
    name: string;
    type: FileType | string;
    path: string;
    children?: TreeNode[];
}

export const BLINK_SHIMS = `
    declare module 'react' {
        export const useState: any;
        export const useRef: any;
        export const useEffect: any;
        export const useCallback: any;
        export const useMemo: any;
        export const useLayoutEffect: any;
        export const useContext: any;
        export const useReducer: any;
        export const useImperativeHandle: any;
        export const useDebugValue: any;
        export const createElement: any;
        export const Fragment: any;
        export const Component: any;
        export const PureComponent: any;
        export const createRef: any;
        export const forwardRef: any;
        export const memo: any;
        export const lazy: any;
        export const Suspense: any;
        const React: any;
        export default React;
    }
    declare module '@monaco-editor/react' {
        export const Editor: any;
        const Toggle: any;
        export default Toggle;
    }
    declare module '@fortawesome/react-fontawesome' {
        export const FontAwesomeIcon: any;
    }
    declare module '@fortawesome/free-solid-svg-icons' {
        export const faTimes: any;
        export const faTimesCircle: any;
        export const faExclamationCircle: any;
        export const faCheckCircle: any;
        export const faInfoCircle: any;
        export const faQuestionCircle: any;
        export const faChevronRight: any;
        export const faChevronDown: any;
        export const faFolder: any;
        export const faFolderOpen: any;
        export const faFile: any;
        export const faSearch: any;
        export const faCog: any;
        export const faEllipsisV: any;
    }
`;

/**
 * Syncs the entire tree structure with Monaco models.
 * Note: Only creates models for files that don't exist yet.
 * Since we don't have all file contents in the tree, we initialize them with empty strings
 * if they are not already open. Monaco will resolve them but they might show empty content
 * until opened.
 */
export async function syncWorkspaceWithMonaco(monaco: any, node: TreeNode) {
    if (node.type === 'folder' && node.children) {
        for (const child of node.children) {
            await syncWorkspaceWithMonaco(monaco, child);
        }
    } else {
        const uri = monaco.Uri.file(node.path);
        const existingModel = monaco.editor.getModel(uri);
        
        // Only sync TS/JS files for module resolution
        const lang = getLanguageByFilename(node.name);
        if (['typescript', 'javascript'].includes(lang)) {
            if (!existingModel) {
                // Initialize as empty for now, content will be loaded when opened
                monaco.editor.createModel('', lang, uri);
            }
        }
    }
}

export function setupCompilerOptions(monaco: any, rootPath?: string) {
    const baseUrl = rootPath ? monaco.Uri.file(rootPath).toString() : 'file:///';
    
    const compilerOptions = {
        jsx: 1, // JsxEmit.React
        allowJs: true,
        allowNonTsExtensions: true,
        target: 99, // ScriptTarget.ESNext
        module: 99, // ModuleKind.ESNext
        moduleResolution: 2, // ModuleResolutionKind.NodeJs
        esModuleInterop: true,
        noImplicitAny: false,
        noImplicitReturns: false,
        strict: false,
        allowSyntheticDefaultImports: true,
        baseUrl: baseUrl,
        paths: {
            "*": ["*", "node_modules/*"]
        },
        typeRoots: ["node_modules/@types"]
    };

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);
    
    // Enable full diagnostics and semantic validation
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        onlyVisible: true, 
    });

    // Enable eager sync for better cross-file resolution
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
    
    // Add shims and return disposables
    const disposables = [
        monaco.languages.typescript.typescriptDefaults.addExtraLib(BLINK_SHIMS, 'file:///node_modules/@types/blink-shims.d.ts'),
        monaco.languages.typescript.javascriptDefaults.addExtraLib(BLINK_SHIMS, 'file:///node_modules/@types/blink-shims-js.d.ts')
    ];

    return {
        dispose: () => {
            disposables.forEach(d => d.dispose());
        }
    };
}
