// src/app/(ide)/playground/[id]/workspace-client-canvas.tsx
"use client";

import { useState, useEffect } from "react";
import { useIDEStore, IDEFile } from "@/lib/store/use-ide-store";
import { FolderCode, GitBranch, Blocks, Layers, Settings, Globe, ChevronRight, ChevronLeft } from "lucide-react";

// Pulling clean dynamic sub-chunk slots
import { WorkspaceHeader } from "./_components/workspace-header";
import { WorkspaceSidebar } from "./_components/workspace-sidebar";
import { WorkspaceEditor } from "./_components/workspace-editor";

export function WorkspaceClientCanvas({ playgroundId, serverInitialFiles }: { playgroundId: string; serverInitialFiles: IDEFile[] }) {
  const { files, initializeWorkspace } = useIDEStore();
  const [activeTab, setActiveTab] = useState<"EXPLORER" | "VERSION_CONTROL">("EXPLORER");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (serverInitialFiles) initializeWorkspace(serverInitialFiles);
  }, [serverInitialFiles, initializeWorkspace]);

  return (
    <div className="flex-1 w-full flex flex-col min-h-0 relative font-sans text-base">
      
      {/* CHUNK 1: MASTER UTILITY TOOLBAR HEADER */}
      <WorkspaceHeader playgroundId={playgroundId} />

      {/* CORE CANVAS WORKSPACE PANEL AREA */}
      <div className="flex-1 w-full flex min-h-0 border border-border/60 bg-card/5 backdrop-blur-md rounded-2xl overflow-hidden relative">
        
        {/* VIBEDEV INTERACTION STATUS DOCK */}
        <div className="w-12 border-r border-border/60 bg-zinc-900/30 flex flex-col items-center justify-between py-4 shrink-0 select-none z-20">
          <div className="flex flex-col gap-4 w-full items-center">
            <button onClick={() => { setActiveTab("EXPLORER"); if (isSidebarCollapsed) setIsSidebarCollapsed(false); }} className={`p-2 rounded-xl cursor-pointer ${activeTab === "EXPLORER" && !isSidebarCollapsed ? "bg-primary/10 text-primary border border-primary/20" : "text-zinc-500 hover:text-foreground"}`}><FolderCode className="w-5 h-5" /></button>
            <button className="text-zinc-500 hover:text-foreground p-2 rounded-lg"><GitBranch className="w-5 h-5" /></button>
            <button className="text-zinc-500 hover:text-foreground p-2 rounded-lg"><Blocks className="w-5 h-5" /></button>
            <button className="text-zinc-500 hover:text-foreground p-2 rounded-lg"><Layers className="w-5 h-5" /></button>
          </div>
          <button className="text-zinc-500 hover:text-foreground p-2 rounded-lg"><Settings className="w-4 h-4" /></button>
        </div>

        {/* SIDEBAR EXPAND/COLLAPSE CONTROLLER BUTTON */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute left-[45px] top-4 h-6 w-6 rounded-full border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center shadow-md z-40 cursor-pointer transition-transform hover:scale-105"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* CHUNK 2: FILTERED TREE FILES SIDEBAR */}
        <WorkspaceSidebar playgroundId={playgroundId} isCollapsed={isSidebarCollapsed} />

        {/* CHUNK 3: TRANSACTIONAL MULTI-TAB WORKSPACE CONTENT FIELD */}
        <WorkspaceEditor />

        {/* RE-LOADING LIVE BIND PREVIEW STREAM TERMINAL */}
        <div className="w-[35%] bg-white dark:bg-zinc-900/40 overflow-hidden min-h-0 relative flex flex-col shadow-2xl shrink-0 z-10">
          <div className="h-10 px-4 border-b border-border/60 bg-zinc-50 dark:bg-zinc-900/30 flex items-center text-xs font-mono text-zinc-500 justify-between font-bold">
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> DevServer Streaming Output Port: 3000</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 p-5 font-mono text-xs text-zinc-400 bg-zinc-50/20 dark:bg-transparent overflow-y-auto space-y-3 custom-scrollbar">
            <p className="text-zinc-500/40 font-light italic">// Hot-Reload Build Streams Cache Log:</p>
            <div className="space-y-1.5">
              {Object.values(files).filter(f => !f.name.endsWith(".keep")).map((f) => (
                <div key={f.id} className="px-3 py-2 bg-background/80 dark:bg-card/40 border border-border rounded-lg shadow-3xs flex items-center justify-between gap-4">
                  <span className="text-foreground/80 font-bold truncate">{f.path}</span>
                  <span className="text-[11px] text-zinc-500 font-mono bg-accent/40 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{f.content?.length || 0} chars</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}