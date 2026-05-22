import { TreeNode } from "../components/file-tree-node";

/**
 * Transforms flat directory string collections into deep nested tree layers
 */
export function buildFileSystemTree(flatFiles: Record<string, string>): TreeNode {
  const root: TreeNode = { name: "root", relativePath: "", isFolder: true, children: {} };

  Object.keys(flatFiles).forEach((filePath) => {
    const pathSegments = filePath.split("/");
    let currentCursor = root;

    pathSegments.forEach((segment, index) => {
      if (!segment) return;
      
      const isLastSegment = index === pathSegments.length - 1;
      const reconstructedRelativePath = pathSegments.slice(0, index + 1).join("/");

      if (!currentCursor.children) {
        currentCursor.children = {};
      }

      if (!currentCursor.children[segment]) {
        currentCursor.children[segment] = {
          name: segment,
          relativePath: reconstructedRelativePath,
          isFolder: !isLastSegment,
          children: isLastSegment ? undefined : {},
        };
      }

      currentCursor = currentCursor.children[segment];
    });
  });

  return root;
}