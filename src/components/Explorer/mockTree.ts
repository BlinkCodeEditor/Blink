import { FileType } from "../../utils/typeIcon";

export interface TreeNode {
    name: string;
    type: FileType;
    path: string;
    children?: TreeNode[];
}

export const defaultTree: TreeNode = {
    name: 'No Folder Selected',
    type: 'folder',
    path: '/',
    children: []
};
