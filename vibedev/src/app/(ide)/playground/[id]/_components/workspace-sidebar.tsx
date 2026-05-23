// src/app/(ide)/playground/[id]/_components/workspace-sidebar.tsx
"use client";

import { useMemo } from "react";
import { Search, FilePlus, FolderPlus } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";
import { buildSecureTreeFromStore } from "@/features/playground/utils/tree-builder";
import { FileTreeNode } from "@/features/playground/components/file-tree-node";

export function WorkspaceSidebar({ playgroundId, isCollapsed }: { playgroundId: string; isCollapsed: boolean }) {
  const { files, activeFileId, searchQuery, setSearchQuery, setActiveFileId, addNewItem, renameItem, deleteItem, syncWithCloudAtlas } = useIDEStore();

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const cache: Record<string, any> = {};
    Object.entries(files).forEach(([id, file]) => {
      if (file.name.toLowerCase().includes(searchQuery.toLowerCase()) || file.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        cache[id] = file;
      }
    });
    return cache;
  }, [files, searchQuery]);

  const structuredTree = useMemo(() => buildSecureTreeFromStore(filteredFiles), [filteredFiles]);

  return (
    <div 
      style={{ width: isCollapsed ? "0px" : "270px" }}
      className="border-r border-border/40 bg-zinc-950/20 dark:bg-zinc-900/10 flex flex-col min-h-0 shrink-0 select-none overflow-hidden transition-all duration-300 ease-in-out z-10"
    >
      {!isCollapsed && (
        <div className="flex flex-col h-full p-4 gap-4 min-h-0 w-[270px] animate-fade-in text-sm">
          <div className="relative w-full shrink-0">
            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full h-9 pl-9 pr-3 border border-border/50 bg-zinc-950/40 text-xs font-mono text-foreground rounded-lg focus:outline-none focus:border-primary/30 transition-colors placeholder:text-zinc-600"
            />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 border-b border-border/40 pb-2.5 flex items-center justify-between font-bold">
            <span>Workspace Files</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { const n = prompt("Enter file name:"); if(n) addNewItem(n, false, null); }} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-primary cursor-pointer"><FilePlus className="w-3.5 h-3.5" /></button>
              <button onClick={() => { const n = prompt("Enter folder name:"); if(n) addNewItem(n, true, null); }} className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-primary cursor-pointer"><FolderPlus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-1 space-y-0.5">
            {structuredTree.length > 0 ? (
              structuredTree.map((childNode) => (
                <FileTreeNode
                  key={childNode.id} 
                  node={childNode} 
                  activeFile={activeFileId || ""} 
                  onFileSelect={setActiveFileId}
                  onAddFile={(parentPath) => { const n = prompt("Enter file name:"); if(n) addNewItem(n, false, Object.values(files).find(f => f.path === parentPath)?.id || null); }} 
                  onAddFolder={(parentPath) => { const n = prompt("Enter folder name:"); if(n) addNewItem(n, true, Object.values(files).find(f => f.path === parentPath)?.id || null); }}
                  onRename={(targetPath, newName) => { const m = Object.values(files).find(f => f.path === targetPath); if (m) renameItem(m.id, newName); }}
                  onDelete={(targetPath) => {
                    const m = Object.values(files).find(f => f.path === targetPath);
                    if (!m && targetPath) {
                      if (confirm(`Delete folder and all its contents?`)) {
                        Object.values(files).forEach(f => { if (f.path === targetPath || f.path.startsWith(targetPath + "/")) deleteItem(f.id); });
                        setTimeout(() => syncWithCloudAtlas(playgroundId), 50);
                      }
                    } else if (m) {
                      if (confirm(`Delete file "${m.name}"?`)) { deleteItem(m.id); setTimeout(() => syncWithCloudAtlas(playgroundId), 50); }
                    }
                  }}
                />
              ))
            ) : (
              <p className="text-xs font-mono text-zinc-600 italic p-2">// Empty workspace.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}