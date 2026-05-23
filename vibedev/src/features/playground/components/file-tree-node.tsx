// src/features/playground/components/file-tree-node.tsx
"use client";

import { useState } from "react";
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, Plus, FolderPlus, Edit3, Trash2 } from "lucide-react";
import { SecureTreeNode } from "../utils/tree-builder";

interface FileTreeNodeProps {
  node: SecureTreeNode;
  activeFile: string;
  onFileSelect: (id: string) => void;
  onCreateRequest: (parentPath: string | null, isFolder: boolean) => void;
  onRenameRequest: (targetPath: string, name: string) => void;
  onDeleteRequest: (targetPath: string, name: string, isFolder: boolean) => void;
}

export const FileTreeNode = ({
  node,
  activeFile,
  onFileSelect,
  onCreateRequest,
  onRenameRequest,
  onDeleteRequest,
}: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const resolveCleanStorePath = () => node.relativePath;

  // 📄 FILE NODE RENDER
  if (!node.isFolder) {
    const isCurrent = node.id === activeFile;
    return (
      <div className={`group relative w-full flex items-center justify-between rounded-lg pr-2 py-1 text-xs font-mono transition-all relative ${isCurrent ? "bg-primary/10 text-primary font-semibold pl-2 border-l-2 border-primary" : "text-zinc-400 hover:text-foreground hover:bg-zinc-800/30 dark:hover:bg-zinc-800/20 pl-3"} before:absolute before:left-[-11px] before:top-1/2 before:w-2.5 before:h-px before:bg-border/60`}>
        <button
          onClick={() => onFileSelect(node.id)}
          className="flex-1 text-left pr-2 py-0.5 truncate flex items-center gap-2 cursor-pointer h-6 z-10"
        >
          <FileCode className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-primary" : "text-zinc-500"}`} />
          <span className="truncate text-[13px] tracking-wide">{node.name}</span>
        </button>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-transparent shrink-0 pl-1 z-20">
          <button onClick={(e) => { e.stopPropagation(); onRenameRequest(resolveCleanStorePath(), node.name); }} className="p-1 rounded-md hover:bg-zinc-800/80 text-zinc-500 hover:text-foreground cursor-pointer"><Edit3 className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(resolveCleanStorePath(), node.name, false); }} className="p-1 rounded-md hover:bg-zinc-800/80 text-zinc-500 hover:text-destructive cursor-pointer"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
    );
  }

  // 📁 FOLDER NODE RENDER
  return (
    <div className="space-y-0.5 w-full relative">
      <div className={`group relative w-full flex items-center justify-between rounded-lg pr-2 py-1 text-xs font-mono text-zinc-300 dark:text-zinc-200 hover:bg-zinc-800/30 dark:hover:bg-zinc-800/20 transition-colors pl-1 ${node.parentId ? "before:absolute before:left-[-11px] before:top-1/2 before:w-2.5 before:h-px before:bg-border/60" : ""}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 text-left px-1 py-0.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer h-6 font-semibold truncate text-zinc-200"
        >
          <span className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
          {isOpen ? <FolderOpen className="w-4 h-4 text-amber-500/90 fill-amber-500/10 shrink-0" /> : <Folder className="w-4 h-4 text-amber-500/80 fill-amber-500/10 shrink-0" />}
          <span className="truncate tracking-wide text-[13px] ml-0.5">{node.name}</span>
        </button>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity bg-transparent shrink-0 pl-1 z-20">
          <button onClick={(e) => { e.stopPropagation(); onCreateRequest(resolveCleanStorePath(), false); }} className="p-1 rounded-md hover:bg-zinc-800/80 text-zinc-500 hover:text-primary cursor-pointer"><Plus className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); onCreateRequest(resolveCleanStorePath(), true); }} className="p-1 rounded-md hover:bg-zinc-800/80 text-zinc-500 hover:text-primary cursor-pointer"><FolderPlus className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); onRenameRequest(resolveCleanStorePath(), node.name); }} className="p-1 rounded-md hover:bg-zinc-800/80 text-zinc-500 hover:text-foreground cursor-pointer"><Edit3 className="w-3 h-3" /></button>
          <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(resolveCleanStorePath(), node.name, true); }} className="p-1 rounded-md hover:bg-zinc-800/80 text-zinc-500 hover:text-destructive cursor-pointer"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>

      {isOpen && node.children && node.children.length > 0 && (
        <div className="relative pl-3.5 ml-2.5 border-l border-zinc-800/80 space-y-1 flex flex-col items-stretch w-auto">
          {node.children.map((childNode) => (
            <FileTreeNode
              key={childNode.id}
              node={childNode}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onCreateRequest={onCreateRequest}
              onRenameRequest={onRenameRequest}
              onDeleteRequest={onDeleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};