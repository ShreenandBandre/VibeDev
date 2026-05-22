"use client";

import { useState } from "react";
import { Folder, FolderOpen, FileCode, ChevronRight, ChevronDown } from "lucide-react";

// Structural typing definitions for our recursive tree state
export interface TreeNode {
  name: string;
  relativePath: string;
  isFolder: boolean;
  children?: Record<string, TreeNode>;
}

interface FileTreeNodeProps {
  node: TreeNode;
  activeFile: string;
  onFileSelect: (path: string) => void;
}

export const FileTreeNode = ({ node, activeFile, onFileSelect }: FileTreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!node.isFolder) {
    const isCurrent = node.relativePath === activeFile;
    return (
      <button
        onClick={() => onFileSelect(node.relativePath)}
        className={`w-full text-left pl-6 pr-2 py-1.5 text-xs font-mono rounded-md transition-all truncate flex items-center gap-2 cursor-pointer ${
          isCurrent
            ? "bg-primary/10 text-primary border-l-2 border-primary pl-[22px] font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
        }`}
      >
        <FileCode className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? "text-primary" : "text-muted-foreground/60"}`} />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }

  // Render a folder category loop block
  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-2 py-1.5 text-xs font-mono rounded-md text-foreground/90 hover:bg-accent/40 transition-colors flex items-center gap-1.5 cursor-pointer group"
      >
        <span className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
        </span>
        {isOpen ? (
          <FolderOpen className="w-4 h-4 text-amber-500/80 fill-amber-500/10 shrink-0" />
        ) : (
          <Folder className="w-4 h-4 text-amber-500/80 fill-amber-500/10 shrink-0" />
        )}
        <span className="truncate font-medium">{node.name}</span>
      </button>

      {/* Render children sub-nodes recursively if the folder drawer is open */}
      {isOpen && node.children && (
        <div className="pl-3 ml-2 border-l border-border/40 space-y-0.5">
          {Object.values(node.children)
            // Sort to display folders first, then individual code files
            .sort((a, b) => (b.isFolder ? 1 : 0) - (a.isFolder ? 1 : 0) || a.name.localeCompare(b.name))
            .map((childNode) => (
              <FileTreeNode
                key={childNode.relativePath}
                node={childNode}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
              />
            ))}
        </div>
      )}
    </div>
  );
};