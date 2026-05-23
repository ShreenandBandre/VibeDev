// src/features/playground/components/file-tree-node.tsx
"use client";

import { useState } from "react";
import { 
  Folder, FolderOpen, FileCode, ChevronRight, ChevronDown, 
  Plus, FolderPlus, Edit3, Trash2, Check, X 
} from "lucide-react";
import { SecureTreeNode } from "../utils/tree-builder";

interface FileTreeNodeProps {
  node: SecureTreeNode;
  activeFile: string;
  onFileSelect: (id: string) => void;
  onAddFile: (parentPath: string) => void;
  onAddFolder: (parentPath: string) => void;
  onRename: (targetPath: string, newName: string) => void;
  onDelete: (targetPath: string) => void;
}

export const FileTreeNode = ({
  node,
  activeFile,
  onFileSelect,
  onAddFile,
  onAddFolder,
  onRename,
  onDelete,
}: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);

  // Helper utility to safely resolve clean database paths from synthetic nodes
  const resolveCleanStorePath = () => {
    return node.id.startsWith("folder_") ? node.relativePath : node.relativePath;
  };

  const handleCommitRename = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (renameValue.trim() && renameValue.trim() !== node.name) {
      // 🚀 Passes the actual relative path string layout to Zustand's key manager
      onRename(resolveCleanStorePath(), renameValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setRenameValue(node.name);
    setIsEditing(false);
  };

  // 📄 RENDER INDIVIDUAL SPECIFIC CODE FILE NODE LAYER
  if (!node.isFolder) {
    const isCurrent = node.id === activeFile;
    return (
      <div 
        className={`group relative w-full flex items-center justify-between rounded-xl pr-2 py-1.5 text-xs font-mono transition-all ${
          isCurrent 
            ? "bg-primary/10 text-primary border-l-2 border-primary font-bold pl-2" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40 pl-2.5"
        }`}
      >
        {isEditing ? (
          <div className="flex items-center gap-1 w-full pl-4">
            <input 
              type="text" 
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="bg-background border border-primary/40 text-xs rounded-md px-1.5 py-0.5 w-full focus:outline-none font-mono h-6 text-foreground"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={handleCommitRename} className="text-emerald-500 p-0.5 hover:bg-background rounded-md cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={handleCancelRename} className="text-destructive p-0.5 hover:bg-background rounded-md cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button
            onClick={() => onFileSelect(node.id)}
            className="flex-1 text-left pr-2 py-0.5 truncate flex items-center gap-2 cursor-pointer h-5"
          >
            <FileCode className={`w-4 h-4 shrink-0 ${isCurrent ? "text-primary" : "text-muted-foreground/60"}`} />
            <span className="truncate text-sm font-medium">{node.name}</span>
          </button>
        )}

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-transparent shrink-0 pl-1 z-20">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
              className="p-0.5 rounded hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
              title="Rename File"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(resolveCleanStorePath()); }}
              className="p-0.5 rounded hover:bg-background text-muted-foreground hover:text-destructive cursor-pointer"
              title="Delete File"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // 📁 RENDER RECURSIVE DIRECTORY/FOLDER TREE NODE LAYER
  return (
    <div className="space-y-0.5 w-full">
      <div className="group relative w-full flex items-center justify-between rounded-xl pr-2 py-1.5 text-xs font-mono text-foreground/90 hover:bg-accent/40 transition-colors">
        {isEditing ? (
          <div className="flex items-center gap-1 w-full pl-4">
            <input 
              type="text" 
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="bg-background border border-primary/40 text-xs rounded-md px-1.5 py-0.5 w-full focus:outline-none font-mono h-6 text-foreground"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={handleCommitRename} className="text-emerald-500 p-0.5 hover:bg-background rounded-md cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
            <button onClick={handleCancelRename} className="text-destructive p-0.5 hover:bg-background rounded-md cursor-pointer"><X className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 text-left px-2 py-0.5 rounded-md transition-all flex items-center gap-2 cursor-pointer h-5 text-foreground/90 font-bold truncate"
          >
            <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-amber-500/80 fill-amber-500/10 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500/80 fill-amber-500/10 shrink-0" />
            )}
            <span className="truncate tracking-wide text-sm">{node.name}</span>
          </button>
        )}

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-transparent shrink-0 pl-1 z-20">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddFile(resolveCleanStorePath()); }}
              className="p-0.5 rounded hover:bg-background text-muted-foreground hover:text-primary cursor-pointer"
              title="New File inside folder"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddFolder(resolveCleanStorePath()); }}
              className="p-0.5 rounded hover:bg-background text-muted-foreground hover:text-primary cursor-pointer"
              title="New Folder inside folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
              className="p-0.5 rounded hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
              title="Rename Folder"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(resolveCleanStorePath()); }}
              className="p-0.5 rounded hover:bg-background text-muted-foreground hover:text-destructive cursor-pointer"
              title="Delete Folder"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* CASCADE RECURSIVE SUB-FOLDERS GENERATOR */}
      {isOpen && node.children && node.children.length > 0 && (
        <div className="pl-4 ml-2.5 border-l border-border/50 space-y-0.5 flex flex-col items-stretch w-auto">
          {node.children.map((childNode) => (
            <FileTreeNode
              key={childNode.id}
              node={childNode}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};