// src/features/playground/hooks/transformer.ts

export interface TemplateItem {
  filename: string;       // e.g., "index" or "App" or "public"
  fileExtension: string;  // e.g., "html" or "js" or ""
  content: string;        // Code contents
  folderName?: string;    // Used if it's a folder indicator
  items?: TemplateItem[]; // Not needed anymore since we parse the path strings directly!
  path: string;           // 🚀 CRITICAL: We parse this actual path property (e.g., "public/index.html")
}

interface WebContainerFile {
  file: { contents: string };
}

interface WebContainerDirectory {
  directory: { [key: string]: WebContainerFile | WebContainerDirectory };
}

export type WebContainerFileSystem = Record<string, WebContainerFile | WebContainerDirectory>;

export function transformToWebContainerFormat(template: { folderName: string; items: any[] }): WebContainerFileSystem {
  const result: WebContainerFileSystem = {};

  template.items.forEach((item) => {
    // Skip placeholder records if present
    if (!item.path || item.filename.endsWith('.keep')) return;

    // Split paths cleanly by forward slash (e.g., "public/nested/index.html" -> ["public", "nested", "index.html"])
    const pathParts = item.path.split("/").filter(Boolean);
    let currentLevel: any = result;

    pathParts.forEach((part, index) => {
      const isLastPart = index === pathParts.length - 1;

      if (isLastPart) {
        if (item.isFolder) {
          // If it's a folder, initialize its directory block if it doesn't exist yet
          if (!currentLevel[part]) {
            currentLevel[part] = { directory: {} };
          }
        } else {
          // If it's a file, cleanly attach its contents object
          currentLevel[part] = {
            file: { contents: item.content || "" }
          };
        }
      } else {
        // If it's a structural middle directory layer, keep building nested pointers down the tree
        if (!currentLevel[part]) {
          currentLevel[part] = { directory: {} };
        }
        // Advance deep traversal reference frame forward
        currentLevel = currentLevel[part].directory;
      }
    });
  });

  return result;
}