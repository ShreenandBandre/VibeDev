import { FileSystemTree } from "@webcontainer/api";

// This is the type your component was desperately looking for!
export interface TemplateFolder {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  parentId: string | null;
}

/**
 * Converts a flat array of UI IDEFiles into a deep nested structure 
 * that @webcontainer/api can natively mount to its virtual filesystem.
 */
export function convertFlatTreeToWebContainer(flatFiles: TemplateFolder[]): FileSystemTree {
  const resultTree: FileSystemTree = {};

  // 1. Isolate the absolute root items (items with no parent)
  const rootNodes = flatFiles.filter((node) => !node.parentId);

  // 2. Recursive helper function to crawl and build deep child nests
  const buildSubTree = (currentNode: TemplateFolder): any => {
    if (!currentNode.isFolder) {
      return {
        file: {
          contents: currentNode.content || "",
        },
      };
    }

    // Accumulate all items belonging to this folder instance container
    const folderDirectoryContents: Record<string, any> = {};
    const subChildren = flatFiles.filter((node) => node.parentId === currentNode.id);

    subChildren.forEach((child) => {
      folderDirectoryContents[child.name] = buildSubTree(child);
    });

    return {
      directory: folderDirectoryContents,
    };
  };

  // 3. Mount all root-level directories/files onto our top-level object
  rootNodes.forEach((rootNode) => {
    resultTree[rootNode.name] = buildSubTree(rootNode);
  });

  return resultTree;
}