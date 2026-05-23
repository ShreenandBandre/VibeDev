// src/app/(ide)/playground/[id]/_components/workspace-sidebar.tsx
"use client";

import { useMemo, useState } from "react";
import { Search, FilePlus, FolderPlus } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";
import { buildSecureTreeFromStore } from "@/features/playground/utils/tree-builder";
import { FileTreeNode } from "@/features/playground/components/file-tree-node";

// Import all custom premium modals
import { DeleteModal } from "./delete-modal";
import { CreateModal } from "./create-modal";
import { RenameModal } from "./rename-modal";

export function WorkspaceSidebar({ playgroundId, isCollapsed }: { playgroundId: string; isCollapsed: boolean }) {
  const { files, activeFileId, searchQuery, setSearchQuery, setActiveFileId, addNewItem, renameItem, deleteItem, syncWithCloudAtlas } = useIDEStore();

  // 🛠️ MODAL STATE MANAGER BINDINGS
  const [createConfig, setCreateConfig] = useState<{ isOpen: boolean; isFolder: boolean; parentPath: string | null }>({ isOpen: false, isFolder: false, parentPath: null });
  const [renameConfig, setRenameConfig] = useState<{ isOpen: boolean; targetPath: string; name: string }>({ isOpen: false, targetPath: "", name: "" });
  const [deleteTarget, setDeleteTarget] = useState<{ isOpen: boolean; path: string; name: string; isFolder: boolean }>({ isOpen: false, path: "", name: "", isFolder: false });

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const cache: Record<string, any> = {};
    Object.entries(files).forEach(([id, file]) => {
      if (file.name.toLowerCase().includes(searchQuery.toLowerCase())) cache[id] = file;
    });
    return cache;
  }, [files, searchQuery]);

  const structuredTree = useMemo(() => buildSecureTreeFromStore(filteredFiles), [filteredFiles]);

  // 🚀 CREATION SUBMISSION HOOK
  const handleExecuteCreate = (name: string) => {
    const parentId = createConfig.parentPath ? Object.values(files).find(f => f.path === createConfig.parentPath)?.id || null : null;
    addNewItem(name, createConfig.isFolder, parentId);
    setCreateConfig({ isOpen: false, isFolder: false, parentPath: null });
    setTimeout(() => syncWithCloudAtlas(playgroundId), 50);
  };

  // 🚀 RENAME SUBMISSION HOOK
  const handleExecuteRename = (newName: string) => {
    const match = Object.values(files).find(f => f.path === renameConfig.targetPath);
    if (match) renameItem(match.id, newName);
    setRenameConfig({ isOpen: false, targetPath: "", name: "" });
    setTimeout(() => syncWithCloudAtlas(playgroundId), 50);
  };

  // 🚀 DELETION SUBMISSION HOOK
  const handleExecuteDelete = () => {
    const { path, isFolder } = deleteTarget;
    if (isFolder) {
      Object.values(files).forEach(f => {
        if (f.path === path || f.path.startsWith(path + "/")) deleteItem(f.id);
      });
    } else {
      const match = Object.values(files).find(f => f.path === path);
      if (match) deleteItem(match.id);
    }
    setDeleteTarget({ isOpen: false, path: "", name: "", isFolder: false });
    setTimeout(() => syncWithCloudAtlas(playgroundId), 50);
  };

  return (
    <>
      {/* 🚀 FIXED: Dynamic width handling is now offloaded entirely to the parent resize handle track gutter */}
      <div className="w-full h-full bg-zinc-50 dark:bg-zinc-950/10 flex flex-col min-h-0 select-none overflow-hidden box-border">
        {!isCollapsed && (
          <div className="flex flex-col h-full p-4 gap-4 min-h-0 w-full font-sans text-sm animate-fade-in box-border">
            
            {/* SEARCH TEXT CONTROLLER */}
            <div className="relative w-full shrink-0">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search files..." 
                className="w-full h-9 pl-9 pr-3 border border-zinc-200 dark:border-border/50 bg-white dark:bg-zinc-950/40 text-xs font-mono text-zinc-900 dark:text-foreground rounded-lg focus:outline-none" 
              />
            </div>

            {/* BAR TRACK IDENTIFICATION HOUSINGS */}
            <div className="text-xs font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-500 border-b border-zinc-200 dark:border-border/40 pb-2.5 flex items-center justify-between font-bold">
              <span>Workspace Files</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCreateConfig({ isOpen: true, isFolder: false, parentPath: null })} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary cursor-pointer"><FilePlus className="w-3.5 h-3.5" /></button>
                <button onClick={() => setCreateConfig({ isOpen: true, isFolder: true, parentPath: null })} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary cursor-pointer"><FolderPlus className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* RENDER DYNAMIC ARCHITECTURAL FILE TREE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 py-1 space-y-0.5">
              {structuredTree.length > 0 ? (
                structuredTree.map((childNode) => (
                  <FileTreeNode
                    key={childNode.id} 
                    node={childNode} 
                    activeFile={activeFileId || ""} 
                    onFileSelect={setActiveFileId}
                    onCreateRequest={(parentPath, isFolder) => setCreateConfig({ isOpen: true, isFolder, parentPath })}
                    onRenameRequest={(targetPath, name) => setRenameConfig({ isOpen: true, targetPath, name })}
                    onDeleteRequest={(targetPath, name, isFolder) => setDeleteTarget({ isOpen: true, path: targetPath, name, isFolder })}
                  />
                ))
              ) : (
                <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600 italic p-2">// Empty workspace.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RENDER ALL MODAL OVERLAYS */}
      <CreateModal isOpen={createConfig.isOpen} isFolder={createConfig.isFolder} parentPath={createConfig.parentPath} onCancel={() => setCreateConfig({ isOpen: false, isFolder: false, parentPath: null })} onConfirm={handleExecuteCreate} />
      <RenameModal isOpen={renameConfig.isOpen} currentName={renameConfig.name} onCancel={() => setRenameConfig({ isOpen: false, targetPath: "", name: "" })} onConfirm={handleExecuteRename} />
      <DeleteModal isOpen={deleteTarget.isOpen} targetName={deleteTarget.name} isFolder={deleteTarget.isFolder} onCancel={() => setDeleteTarget({ isOpen: false, path: "", name: "", isFolder: false })} onConfirm={handleExecuteDelete} />
    </>
  );
}