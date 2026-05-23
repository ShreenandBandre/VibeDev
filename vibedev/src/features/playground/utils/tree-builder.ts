// src/features/playground/utils/tree-builder.ts
import { IDEFile } from "@/lib/store/use-ide-store";

export interface SecureTreeNode {
  id: string;          // Maps to file ID or folder path hash string
  name: string;        // e.g. "Button.tsx" or "components"
  relativePath: string;// e.g. "src/components/Button.tsx"
  isFolder: boolean;
  parentId: string | null;
  children: SecureTreeNode[];
}

export function buildSecureTreeFromStore(files: Record<string, IDEFile>): SecureTreeNode[] {
  // Creating a virtual structural root node context container
  const rootNode: SecureTreeNode = {
    id: "root_virtual",
    name: "root",
    relativePath: "",
    isFolder: true,
    parentId: null,
    children: []
  };

  // We keep a registry map tracking created folder pathways to reuse node paths
  const folderRegistry: Record<string, SecureTreeNode> = {};

  Object.values(files).forEach((file) => {
    // If a document record is explicitly marked as a raw folder row configuration, skip it
    if (file.isFolder && file.name === ".keep") return;

    const pathSegments = file.path.split("/");
    let activeCursor = rootNode;

    // Traverse individual file segments to generate missing virtual directory nodes
    pathSegments.forEach((segment, index) => {
      if (!segment || segment === ".keep") return;

      const isLastSegment = index === pathSegments.length - 1;
      const runningRelativePath = pathSegments.slice(0, index + 1).join("/");

      if (!isLastSegment) {
        // 📁 STRUCTURAL DIRECTION NODE LAYER REQUIRED
        if (!folderRegistry[runningRelativePath]) {
          const newFolderNode: SecureTreeNode = {
            id: `folder_${runningRelativePath}`, // Clean reproducible synthetic ID keys
            name: segment,
            relativePath: runningRelativePath,
            isFolder: true,
            parentId: activeCursor.id === "root_virtual" ? null : activeCursor.id,
            children: []
          };
          folderRegistry[runningRelativePath] = newFolderNode;
          activeCursor.children.push(newFolderNode);
        }
        activeCursor = folderRegistry[runningRelativePath];
      } else {
        // 📄 CODE TOKEN MODULE FILE LEAF RECORD DETECTED
        const fileLeafNode: SecureTreeNode = {
          id: file.id, // Employs the authentic, secure Zustand file reference key ID
          name: file.name,
          relativePath: file.path,
          isFolder: false,
          parentId: activeCursor.id === "root_virtual" ? null : activeCursor.id,
          children: []
        };
        activeCursor.children.push(fileLeafNode);
      }
    });
  });

  // 🛠️ ALIGNMENT SORT ALGORITHM: Groups directories first, then alpha-sorts files
  const sortTreeNodesCascade = (nodes: SecureTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortTreeNodesCascade(node.children);
      }
    });
  };

  sortTreeNodesCascade(rootNode.children);
  return rootNode.children;
}