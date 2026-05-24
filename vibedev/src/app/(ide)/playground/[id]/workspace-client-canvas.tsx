// src/app/(ide)/playground/[id]/workspace-client-canvas.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useIDEStore, IDEFile } from "@/lib/store/use-ide-store";
import { FolderCode, GitBranch, Blocks, Layers, Settings, ChevronRight, ChevronLeft } from "lucide-react";

import { useWebContainer } from "@/features/playground/hooks/use-webcontainer";
import WebContainerPreview from "@/features/playground/components/webcontainer-preview";

import { WorkspaceHeader } from "./_components/workspace-header";
import { WorkspaceSidebar } from "./_components/workspace-sidebar";
import { WorkspaceEditor } from "./_components/workspace-editor";

interface WorkspaceClientCanvasProps {
  playgroundId: string;
  serverInitialFiles: IDEFile[];
  projectTitle: string;
  projectTemplate: string;
  templateData: any; // Dynamic workspace templates
  recentProjects?: Array<{ id: string; title: string }>; // Feeds sidebar routes natively
}

export function WorkspaceClientCanvas({ 
  playgroundId, 
  serverInitialFiles, 
  projectTitle, 
  projectTemplate,
  templateData,
  recentProjects = []
}: WorkspaceClientCanvasProps) {
  const { initializeWorkspace } = useIDEStore();
  
  // 📏 PANEL CONTROLLER LAYOUT RESIZER STATES
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [previewWidth, setPreviewWidth] = useState(540); 
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingSidebar = useRef(false);
  const isResizingPreview = useRef(false);

  // 🤖 SPINNING HOOK STATES RIGHT AT ROOT LEVEL
  const { instance, isLoading, error, serverUrl, writeFileSync } = useWebContainer({ templateData });

  useEffect(() => {
    if (serverInitialFiles) initializeWorkspace(serverInitialFiles);
  }, [serverInitialFiles, initializeWorkspace]);

  // Drag resizer layout bounds configuration trackers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      if (isResizingSidebar.current) {
        const w = e.clientX - rect.left - 48;
        if (w > 160 && w < 450) setSidebarWidth(w);
      }
      if (isResizingPreview.current) {
        const w = rect.right - e.clientX;
        if (w > 300 && w < 900) setPreviewWidth(w);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingPreview.current = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen h-screen m-0 p-0 flex flex-col min-h-0 overflow-hidden bg-[#000000] text-zinc-900 dark:text-zinc-100 box-border z-0 select-none">
      
      <WorkspaceHeader 
        playgroundId={playgroundId} 
        projectTitle={projectTitle} 
        projectTemplate={projectTemplate} 
      />

      <div className="flex-1 w-full flex flex-row min-h-0 bg-white dark:bg-[#030303] box-border relative">
        
        {/* VIEW SHIFT ICON ACTIVITY DOCK */}
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

        {/* MODULAR COMPRESSION EXPLORER SIDEBAR DRAWER */}
        <div style={{ width: isSidebarCollapsed ? 0 : sidebarWidth }} className="h-full flex flex-col min-h-0 shrink-0 overflow-hidden">
          <WorkspaceSidebar playgroundId={playgroundId} isCollapsed={isSidebarCollapsed} />
        </div>

        {/* SIDEBAR CONTROL RESIZE GUTTER TRACK */}
        <div 
          onMouseDown={() => { isResizingSidebar.current = true; document.body.style.cursor = "col-resize"; }}
          className="w-1.5 h-full relative z-30 cursor-col-resize hover:bg-primary/40 dark:hover:bg-primary/50 transition-colors group/gutter flex items-center justify-center shrink-0 border-r border-zinc-200 dark:border-zinc-900"
        >
          <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="w-5 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 flex items-center justify-center shadow-md absolute opacity-0 group-hover/gutter:opacity-100 focus:opacity-100 transition-opacity duration-150 pointer-events-auto cursor-pointer">
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* MONACO CODE EDITOR STAGING SEGMENT CANVAS */}
        <div className="flex-1 min-w-0 h-full flex flex-col box-border relative">
          {/* 🚀 FIXED: Now piping the actual running sandbox instance down to the workspace editor */}
          <WorkspaceEditor webcontainerInstance={instance} />
        </div>

        {/* PREVIEW CONTAINER RESIZE GUTTER TRACK */}
        <div 
          onMouseDown={() => { isResizingPreview.current = true; document.body.style.cursor = "col-resize"; }}
          className="w-1.5 h-full relative z-30 cursor-col-resize hover:bg-primary/40 dark:hover:bg-primary/50 transition-colors group/gutter2 flex items-center justify-center shrink-0 border-l border-zinc-200 dark:border-zinc-900"
        >
          <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)} className="w-5 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 flex items-center justify-center shadow-md absolute opacity-0 group-hover/gutter2:opacity-100 focus:opacity-100 transition-opacity duration-150 pointer-events-auto cursor-pointer">
            {isPreviewCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* THE PREMIUM HOOKUP: Renders the multi-tab preview dashboard array right inside the split viewport */}
        <div 
          style={{ width: isPreviewCollapsed ? 0 : previewWidth }}
          className="bg-[#030303] overflow-hidden min-h-0 relative flex flex-col z-10 shrink-0 box-border border-l border-zinc-200 dark:border-zinc-900"
        >
          <WebContainerPreview 
            templateData={templateData}
            instance={instance} 
            isLoading={isLoading}
            error={error}
            serverUrl={serverUrl} 
            writeFileSync={writeFileSync}
          />
        </div>

      </div>
    </div>
  );
}