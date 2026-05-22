// src/lib/starter-scanner.ts
import fs from "fs";
import path from "path";
import { Templates } from "@prisma/client";

/**
 * Recursively scans a targeted local directory path to construct a 
 * flat JSON map object representing the nested folder structure.
 */
function scanDirectoryManifest(dirPath: string, baseDir: string, fileMap: Record<string, string> = {}) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    // Generate a clean, relative path string to store inside MongoDB (e.g. "src/App.tsx")
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

    if (item.isDirectory()) {
      // Skip heavy tracking cache folders or local dependencies packages
      if (item.name === "node_modules" || item.name === ".next" || item.name === "dist") {
        continue;
      }
      scanDirectoryManifest(fullPath, baseDir, fileMap);
    } else {
      // Read raw file buffer contents, encoding them as standard text strings
      const content = fs.readFileSync(fullPath, "utf-8");
      fileMap[relativePath] = content;
    }
  }

  return fileMap;
}

/**
 * High-fidelity gateway loader that reads the disk structure from your starters-main assets
 * folder based on the user's selected framework enum parameter.
 */
export function getStarterTemplateSnapshot(template: Templates): Record<string, string> {
  try {
    // Points directly to your local project template structures directory root
    const templateDirectoryName = template.toLowerCase(); // e.g. "react", "nextjs", "hono"
    const targetDiskPath = path.join(process.cwd(), "starters-main", templateDirectoryName);

    if (!fs.existsSync(targetDiskPath)) {
      console.warn(`[STARTER_SCANNER_WARN]: Targeted folder path "${targetDiskPath}" missing on disk. Falling back to core file.`);
      return {
        "index.js": `// Workspace placeholder initialized for target: ${template}`
      };
    }

    return scanDirectoryManifest(targetDiskPath, targetDiskPath);
  } catch (error) {
    console.error("CRITICAL_TEMPLATE_DISK_SCAN_FAILURE:", error);
    return { "error.js": "// Failed to read workspace files payload manifest from starter blueprint." };
  }
}