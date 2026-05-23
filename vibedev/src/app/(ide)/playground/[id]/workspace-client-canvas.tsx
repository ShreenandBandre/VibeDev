// src/app/(ide)/playground/[id]/workspace-client-canvas.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useIDEStore, IDEFile } from "@/lib/store/use-ide-store";
import { FolderCode, GitBranch, Blocks, Layers, Settings, Globe, ChevronRight, ChevronLeft } from "lucide-react";

import { WorkspaceHeader } from "./_components/workspace-header";
import { WorkspaceSidebar } from "./_components/workspace-sidebar";
import { WorkspaceEditor } from "./_components/workspace-editor";

interface WorkspaceClientCanvasProps {
  playgroundId: string;
  serverInitialFiles: IDEFile[];
  projectTitle: string;
  projectTemplate: string;
}

export function WorkspaceClientCanvas({ 
  playgroundId, 
  serverInitialFiles, 
  projectTitle, 
  projectTemplate 
}: WorkspaceClientCanvasProps) {
  const { files, dirtyFileIds, initializeWorkspace } = useIDEStore();
  
  // 📏 DRAGGABLE DIMENSIONS STATES
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [previewWidth, setPreviewWidth] = useState(360);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  // Drag listeners references
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingPreview = useRef(false);

  useEffect(() => {
    if (serverInitialFiles) initializeWorkspace(serverInitialFiles);
  }, [serverInitialFiles, initializeWorkspace]);

  // 🎛️ DRAG EVENT HANDLERS CORE ENGINE
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      if (isResizingSidebar.current) {
        // Calculate offset position starting past the 48px activity dock panel
        const calculatedWidth = e.clientX - containerRect.left - 48;
        if (calculatedWidth > 160 && calculatedWidth < 450) {
          setSidebarWidth(calculatedWidth);
          if (isSidebarCollapsed) setIsSidebarCollapsed(false);
        }
      }

      if (isResizingPreview.current) {
        const calculatedWidth = containerRect.right - e.clientX;
        if (calculatedWidth > 200 && calculatedWidth < 600) {
          setPreviewWidth(calculatedWidth);
          if (isPreviewCollapsed) setIsPreviewCollapsed(false);
        }
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingPreview.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSidebarCollapsed, isPreviewCollapsed]);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen m-0 p-0 flex flex-col min-h-0 overflow-hidden bg-[#000000] text-zinc-900 dark:text-zinc-100 box-border z-0 select-none">
      
      <WorkspaceHeader 
        playgroundId={playgroundId} 
        projectTitle={projectTitle} 
        projectTemplate={projectTemplate} 
      />

      <div className="flex-1 w-full flex flex-row min-h-0 bg-white dark:bg-[#030303] box-border relative">
        
        {/* ACTIVITY DOCK PANEL */}
        <div className="w-12 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#050506] flex flex-col items-center justify-between py-4 shrink-0 z-20 box-border">
          <div className="flex flex-col gap-4 w-full items-center">
            <button onClick={() => { if (isSidebarCollapsed) setIsSidebarCollapsed(false); }} className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 cursor-pointer">
              <FolderCode className="w-5 h-5" />
            </button>
            <button className="text-zinc-300 dark:text-zinc-800 p-2 rounded-lg cursor-not-allowed"><GitBranch className="w-5 h-5" /></button>
            <button className="text-zinc-300 dark:text-zinc-800 p-2 rounded-lg cursor-not-allowed"><Blocks className="w-5 h-5" /></button>
            <button className="text-zinc-300 dark:text-zinc-800 p-2 rounded-lg cursor-not-allowed"><Layers className="w-5 h-5" /></button>
          </div>
          <button className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-foreground p-2 rounded-lg cursor-pointer"><Settings className="w-4 h-4" /></button>
        </div>

        {/* 🗂️ SIDEBAR CORE CONTAINER */}
        <div 
          style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }} 
          className="h-full flex flex-col min-h-0 shrink-0 overflow-hidden"
        >
          <WorkspaceSidebar playgroundId={playgroundId} isCollapsed={isSidebarCollapsed} />
        </div>

        {/* 🚀 SPLIT 1 DIVIDER RESIZER: Dynamic Hover Window Track with Centered Arrow Controls */}
        <div 
          onMouseDown={() => { isResizingSidebar.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }}
          className="w-1.5 h-full relative z-30 cursor-col-resize hover:bg-primary/40 dark:hover:bg-primary/50 transition-colors group/gutter flex items-center justify-center shrink-0 border-r border-zinc-200 dark:border-zinc-900"
        >
          <button
            onMouseDown={(e) => e.stopPropagation()} // Prevents dragging when just clicking toggle button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-5 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 hover:text-foreground flex items-center justify-center shadow-md absolute opacity-0 group-hover/gutter:opacity-100 focus:opacity-100 transition-opacity duration-150 pointer-events-auto cursor-pointer"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </div>

        {/* CODE EDITOR ENGINE CANVAS */}
        <div className="flex-1 min-w-0 h-full flex flex-col box-border relative">
          <WorkspaceEditor />
        </div>

        {/* 🖥️ SPLIT 2 DIVIDER RESIZER: Dynamic Hover Window Track with Centered Arrow Controls */}
        <div 
          onMouseDown={() => { isResizingPreview.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }}
          className="w-1.5 h-full relative z-30 cursor-col-resize hover:bg-primary/40 dark:hover:bg-primary/50 transition-colors group/gutter2 flex items-center justify-center shrink-0 border-l border-zinc-200 dark:border-zinc-900"
        >
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
            className="w-5 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 hover:text-foreground flex items-center justify-center shadow-md absolute opacity-0 group-hover/gutter2:opacity-100 focus:opacity-100 transition-opacity duration-150 pointer-events-auto cursor-pointer"
          >
            {isPreviewCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>

        {/* 💻 PREVIEW TERMINAL PANEL */}
        <div 
          style={{ width: isPreviewCollapsed ? 0 : previewWidth }}
          className="bg-white dark:bg-[#030303] overflow-hidden min-h-0 relative flex flex-col z-10 shrink-0 box-border"
        >
          <div className="h-10 px-4 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#070708] flex items-center text-xs font-mono text-zinc-500 justify-between font-bold shrink-0">
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> Preview: Port 3000</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 p-4 font-mono text-xs text-zinc-500 overflow-y-auto space-y-3 custom-scrollbar bg-white dark:bg-[#030303]">
            <p className="text-zinc-400/50 dark:text-zinc-700/50 font-light italic">// Hot-Reload Engine Stream Active:</p>
            <div className="space-y-1.5">
              {Object.values(files).filter(f => !f.name.endsWith(".keep")).map((f) => {
                const hasUnsavedChanges = dirtyFileIds.includes(f.id);

                return (
                  <div key={f.id} className="px-3 py-1.5 bg-zinc-50 dark:bg-[#070708] border border-zinc-200 dark:border-zinc-900/60 rounded-lg flex items-center justify-between gap-4">
                    <span className="text-zinc-600 dark:text-zinc-500 font-medium truncate text-[11px] flex items-center gap-2">
                      {f.path}
                      {hasUnsavedChanges && (
                        <span className="text-[9px] font-mono font-black uppercase text-amber-500 bg-amber-500/5 px-1 py-0.5 rounded-sm tracking-wide shrink-0 border border-amber-500/20 active-pulse">
                          Mod
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-mono bg-white dark:bg-black px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-0">{f.content?.length || 0} B</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}