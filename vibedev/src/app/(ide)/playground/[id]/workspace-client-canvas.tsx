// src/app/(ide)/playground/[id]/workspace-client-canvas.tsx
"use client";

import { useMemo } from "react";
import { usePlayground } from "@/features/playground";
import { buildFileSystemTree } from "@/features/playground/utils/tree-builder";
import { FileTreeNode } from "@/features/playground/components/file-tree-node";
import { Terminal, Play, FolderCode } from "lucide-react";

export function WorkspaceClientCanvas({ playgroundId }: { playgroundId: string }) {
  const { files, activeFile, setActiveFile, updateFileContent, isSaving } = usePlayground();

  // Memoize tree calculation to maintain blazing-fast rendering response metrics
  const structuredTreeRoot = useMemo(() => buildFileSystemTree(files), [files]);

  return (
    <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
      
      {/* PANEL A: UPGRADED DYNAMIC RECURSIVE FOLDER EXPLORER */}
      <div className="lg:col-span-2 border border-border/80 bg-card/20 backdrop-blur-xs rounded-xl p-3 flex flex-col gap-3 min-h-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2 flex items-center justify-between select-none">
          <span className="flex items-center gap-1.5"><FolderCode className="w-3.5 h-3.5 text-primary" /> Workspace Tree</span>
        </div>
        
        {/* Render fully structured directory nodes recursively */}
        <div className="flex-1 overflow-y-auto pr-0.5 space-y-0.5 select-none custom-scrollbar">
          {structuredTreeRoot.children && Object.values(structuredTreeRoot.children).length > 0 ? (
            Object.values(structuredTreeRoot.children)
              .sort((a, b) => (b.isFolder ? 1 : 0) - (a.isFolder ? 1 : 0) || a.name.localeCompare(b.name))
              .map((childNode) => (
                <FileTreeNode
                  key={childNode.relativePath}
                  node={childNode}
                  activeFile={activeFile}
                  onFileSelect={setActiveFile}
                />
              ))
          ) : (
            <p className="text-[11px] text-muted-foreground/40 italic p-2">Empty file context loop maps.</p>
          )}
        </div>
      </div>

      {/* PANEL B: TEXT EDITOR FRAMEWORK */}
      <div className="lg:col-span-5 border border-border/80 bg-zinc-950/40 rounded-xl relative overflow-hidden min-h-0 flex flex-col p-2">
        <div className="h-9 px-3 border-b border-border/40 flex items-center justify-between bg-zinc-900/30 text-[11px] font-mono text-muted-foreground select-none">
          <span className="truncate">// Active File: <span className="text-foreground font-semibold">{activeFile || "None"}</span></span>
          {isSaving && <span className="text-[10px] text-primary animate-pulse font-bold">Syncing Layer...</span>}
        </div>
        
        {activeFile ? (
          <textarea
            value={files[activeFile] || ""}
            onChange={(e) => updateFileContent(e.target.value)}
            className="flex-1 w-full p-4 bg-transparent font-mono text-xs text-zinc-100 placeholder:text-zinc-700 resize-none focus:outline-none leading-relaxed border-0 custom-scrollbar"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs font-mono text-muted-foreground/20 select-none">
            Choose a code node from the directory explorer matrix
          </div>
        )}
      </div>

      {/* PANEL C: LIVE OUTPUT LOG DISPLAY VIEWPORT */}
      <div className="lg:col-span-5 border border-border/80 bg-white rounded-xl overflow-hidden min-h-0 relative flex flex-col shadow-inner">
        <div className="h-9 px-4 border-b border-zinc-200 bg-zinc-50 flex items-center text-[10px] font-mono text-zinc-400 justify-between select-none shrink-0">
          <span className="flex items-center gap-1.5 font-bold text-zinc-500">
            <Play className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            DevServer Output: Port 3000
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex-1 p-5 font-mono text-[11px] text-zinc-500 bg-zinc-50/50 overflow-y-auto space-y-2 custom-scrollbar">
          <p className="text-zinc-400 font-light italic">// Rendered File Manifest (Live State):</p>
          <div className="space-y-1.5">
            {Object.keys(files).map((name) => (
              <div key={name} className="px-2.5 py-1.5 bg-zinc-100 border border-zinc-200/60 rounded-md shadow-3xs flex items-center justify-between gap-4">
                <span className="text-zinc-600 font-semibold truncate">{name}</span>
                <span className="text-[10px] font-mono text-zinc-400/80 bg-zinc-200/40 px-1.5 py-0.5 rounded shrink-0">
                  {files[name]?.length || 0} chars
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}