// src/app/(ide)/playground/[id]/workspace-client-canvas.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { useIDEStore, IDEFile } from "@/lib/store/use-ide-store";
import { buildSecureTreeFromStore } from "@/features/playground/utils/tree-builder";
import { FileTreeNode } from "@/features/playground/components/file-tree-node";
import { 
  FolderCode, Terminal, Play, GitBranch, Blocks, 
  Settings, Layers, FilePlus, FolderPlus, Globe,
  Menu, ChevronLeft, ChevronRight, X, Search, 
  Upload, Download, CloudLightning, Import
} from "lucide-react";

type ActiveDockTab = "EXPLORER" | "VERSION_CONTROL" | "EXTENSIONS" | "DEVOPS";

interface WorkspaceClientCanvasProps {
  playgroundId: string;
  serverInitialFiles: IDEFile[];
}

export function WorkspaceClientCanvas({ playgroundId, serverInitialFiles }: WorkspaceClientCanvasProps) {
  // Centralized Zustand Store hooks
  const {
    files,
    activeFileId,
    openTabs,
    searchQuery,
    isSaving,
    initializeWorkspace,
    setActiveFileId,
    setSearchQuery,
    closeTab,
    updateFileContent,
    addNewItem,
    renameItem,
    deleteItem,
    syncWithCloudAtlas
  } = useIDEStore();

  const [activeTab, setActiveTab] = useState<ActiveDockTab>("EXPLORER");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  // Initialize workspace store once on core component layout load
  useEffect(() => {
    if (serverInitialFiles) {
      initializeWorkspace(serverInitialFiles);
    }
  }, [serverInitialFiles, initializeWorkspace]);

  // Client-side text matching filter pipeline
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const filterCache: Record<string, IDEFile> = {};
    Object.entries(files).forEach(([id, file]) => {
      if (
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        file.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        filterCache[id] = file;
      }
    });
    return filterCache;
  }, [files, searchQuery]);

  const structuredTree = useMemo(() => buildSecureTreeFromStore(filteredFiles), [filteredFiles]);
  const activeFileObject = activeFileId ? files[activeFileId] : null;

  // 📥 SYSTEM FILES DIRECTORY CARRIER UPLOAD PIPELINE
  const handleLocalSystemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBody = event.target?.result as string || "";
        addNewItem(file.name, false, null);
        const newlyCreated = Object.values(useIDEStore.getState().files).find(f => f.name === file.name && !f.isFolder);
        if (newlyCreated) {
          updateFileContent(newlyCreated.id, rawBody);
        }
      };
      reader.readAsText(file);
    });
    setIsHamburgerOpen(false);
  };

  const handleInternetFetchImport = async () => {
    const targetUrl = prompt("Enter public code repository source tracking URL endpoint (JSON array format standard):");
    if (!targetUrl?.trim()) return;
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Network destination rejected connection link handles.");
      const dataJson = await response.json() as IDEFile[];
      if (Array.isArray(dataJson)) {
        initializeWorkspace(dataJson);
      }
    } catch (err) {
      console.error(err);
    }
    setIsHamburgerOpen(false);
  };

  // 📥 EXPORT PROJECT DOWNLOAD DISK ZIP BLUEPRINT
  const handleDownloadProjectBundle = () => {
    const serializedProjectData = JSON.stringify(files, null, 2);
    const dataBlob = new Blob([serializedProjectData], { type: "application/json" });
    const downloadAnchorElement = document.createElement("a");
    downloadAnchorElement.href = URL.createObjectURL(dataBlob);
    downloadAnchorElement.download = `vibedev-workspace-cluster-${playgroundId.slice(-6)}.json`;
    document.body.appendChild(downloadAnchorElement);
    downloadAnchorElement.click();
    document.body.removeChild(downloadAnchorElement);
    setIsHamburgerOpen(false);
  };

  return (
    <div className="flex-1 w-full flex flex-col min-h-0 relative font-sans text-base">
      
      {/* GLOBAL HEADER UTILITY CONTROL ROW */}
      <div className="h-12 w-full border border-border/60 bg-card/40 backdrop-blur-md rounded-xl flex items-center justify-between px-4 mb-3 select-none relative z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
            className={`p-2 rounded-lg border border-border bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer ${isHamburgerOpen ? "bg-primary/10 border-primary/40 text-primary scale-105" : ""}`}
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-sm font-mono font-bold tracking-tight text-muted-foreground">// Workspace Framework Controls</span>
        </div>

        <button
          onClick={() => syncWithCloudAtlas(playgroundId)}
          disabled={isSaving}
          className="h-8 px-4 bg-primary text-primary-foreground font-mono font-bold rounded-lg hover:opacity-90 active:scale-98 transition-all text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs uppercase tracking-wider"
        >
          <CloudLightning className={`w-3.5 h-3.5 ${isSaving ? "animate-bounce" : ""}`} />
          {isSaving ? "Syncing..." : "Commit Save"}
        </button>

        {isHamburgerOpen && (
          <div className="absolute left-4 top-14 w-64 border border-border bg-card p-2 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col text-left text-sm font-medium text-muted-foreground">
            <label className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-accent/70 hover:text-foreground transition-colors cursor-pointer w-full text-left">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Import local system files</span>
              <input type="file" multiple onChange={handleLocalSystemUpload} className="hidden" />
            </label>
            <button onClick={handleInternetFetchImport} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-accent/70 hover:text-foreground transition-colors cursor-pointer w-full text-left">
              <Import className="w-4 h-4 text-orange-400" />
              <span>Import project via link</span>
            </button>
            <div className="h-px bg-border/40 my-1" />
            <button onClick={handleDownloadProjectBundle} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-accent/70 hover:text-foreground transition-colors cursor-pointer w-full text-left">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Project backup</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN LAYOUT CANVAS DRAWER SPLITS */}
      <div className="flex-1 w-full flex min-h-0 border border-border/60 bg-card/5 backdrop-blur-md rounded-2xl overflow-hidden relative">
        
        {/* VIEW SHIFT ICON ACTIVITY DOCK */}
        <div className="w-12 border-r border-border/60 bg-zinc-900/30 flex flex-col items-center justify-between py-4 shrink-0 select-none z-20">
          <div className="flex flex-col gap-4 w-full items-center">
            <button onClick={() => { setActiveTab("EXPLORER"); if (isSidebarCollapsed) setIsSidebarCollapsed(false); }} className={`p-2 rounded-xl cursor-pointer ${activeTab === "EXPLORER" && !isSidebarCollapsed ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}><FolderCode className="w-5 h-5" /></button>
            <button onClick={() => { setActiveTab("VERSION_CONTROL"); if (isSidebarCollapsed) setIsSidebarCollapsed(false); }} className={`p-2 rounded-xl cursor-pointer ${activeTab === "VERSION_CONTROL" && !isSidebarCollapsed ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}><GitBranch className="w-5 h-5" /></button>
            <button onClick={() => { setActiveTab("EXTENSIONS"); if (isSidebarCollapsed) setIsSidebarCollapsed(false); }} className={`p-2 rounded-xl cursor-pointer ${activeTab === "EXTENSIONS" && !isSidebarCollapsed ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}><Blocks className="w-5 h-5" /></button>
            <button onClick={() => { setActiveTab("DEVOPS"); if (isSidebarCollapsed) setIsSidebarCollapsed(false); }} className={`p-2 rounded-xl cursor-pointer ${activeTab === "DEVOPS" && !isSidebarCollapsed ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}><Layers className="w-5 h-5" /></button>
          </div>
          <button className="text-muted-foreground hover:text-foreground p-2 rounded-lg cursor-pointer"><Settings className="w-4 h-4" /></button>
        </div>

        {/* DRAWER COLLAPSE HANDLE BUTTON TRIGGER */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute left-[45px] top-4 h-6 w-6 rounded-full border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center shadow-md z-40 cursor-pointer transition-transform hover:scale-105"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* WORKSPACE DIRECTORY EXPLORER SIDEBAR */}
        <div 
          style={{ width: isSidebarCollapsed ? "0px" : "260px" }}
          className="border-r border-border/60 bg-zinc-900/5 dark:bg-zinc-900/10 flex flex-col min-h-0 shrink-0 select-none overflow-hidden transition-all duration-300 ease-in-out z-10"
        >
          {!isSidebarCollapsed && activeTab === "EXPLORER" && (
            <div className="flex flex-col h-full p-4 gap-4 min-h-0 w-[260px] animate-fade-in text-sm">
              <div className="relative w-full shrink-0">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project keys..."
                  className="w-full h-10 pl-9 pr-3 border border-border/80 bg-background/50 text-xs font-mono text-foreground rounded-lg focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/30"
                />
              </div>

              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 border-b border-border/40 pb-2 flex items-center justify-between font-bold">
                <span>Explorer Matrix</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { const name = prompt("Enter root file name:"); if(name) addNewItem(name, false, null); }} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-primary cursor-pointer"><FilePlus className="w-4 h-4" /></button>
                  <button onClick={() => { const name = prompt("Enter root folder name:"); if(name) addNewItem(name, true, null); }} className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-primary cursor-pointer"><FolderPlus className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                {structuredTree.length > 0 ? (
                  structuredTree.map((childNode) => (
                    <FileTreeNode
                      key={childNode.id} 
                      node={childNode} 
                      activeFile={activeFileId || ""} 
                      onFileSelect={setActiveFileId}
                      
                      // Folders Creator Paths Mapping
                      onAddFile={(parentPath) => { const n = prompt("Enter new file name:"); if(n) addNewItem(n, false, Object.values(files).find(f => f.path === parentPath)?.id || null); }} 
                      onAddFolder={(parentPath) => { const n = prompt("Enter new folder name:"); if(n) addNewItem(n, true, Object.values(files).find(f => f.path === parentPath)?.id || null); }}
                      
                      // Rename Pipeline Gateway
                      onRename={(targetPath, newName) => {
                        const fileMatch = Object.values(files).find(f => f.path === targetPath);
                        if (fileMatch) renameItem(fileMatch.id, newName);
                      }}

                      // 🗑️ ATOMIC SECURE CLOUD-CONNECTED DELETION ROUTINE
                      onDelete={(targetPath) => {
                        const fileMatch = Object.values(files).find(f => f.path === targetPath);
                        let wasDeleted = false;

                        // CASE A: It's a virtual folder node generated from slash paths
                        if (!fileMatch && targetPath) {
                          if (confirm(`Are you sure you want to permanently delete the folder "${targetPath.split('/').pop()}" and all its contents?`)) {
                            Object.values(files).forEach(f => {
                              if (f.path === targetPath || f.path.startsWith(targetPath + "/")) {
                                deleteItem(f.id);
                              }
                            });
                            wasDeleted = true;
                          }
                        } 
                        // CASE B: It's a verified file document item inside the flat dictionary store
                        else if (fileMatch) {
                          if (confirm(`Are you sure you want to permanently delete the file "${fileMatch.name}"?`)) {
                            deleteItem(fileMatch.id);
                            wasDeleted = true;
                          }
                        }

                        // 🚀 Immediate Sync Execution Pipeline Hook
                        if (wasDeleted) {
                          setTimeout(() => {
                            syncWithCloudAtlas(playgroundId);
                          }, 50);
                        }
                      }}
                    />
                  ))
                ) : (
                  <p className="text-xs font-mono text-muted-foreground/30 italic p-2">// No matching tokens.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CODESPACE TEXT EDITOR WINDOWS CONTAINER PANEL */}
        <div className="flex-1 border-r border-border/60 bg-zinc-950/5 dark:bg-zinc-950/20 relative overflow-hidden min-h-0 flex flex-col p-2">
          <div className="h-10 w-full flex border-b border-border/40 bg-zinc-900/20 overflow-x-auto select-none shrink-0 scrollbar-none items-center">
            {openTabs.map((tabId) => {
              const fileObj = files[tabId];
              if (!fileObj) return null;
              const isCurrent = tabId === activeFileId;
              return (
                <div
                  key={tabId}
                  onClick={() => setActiveFileId(tabId)}
                  className={`h-full px-4 text-xs font-mono flex items-center gap-2.5 border-r border-border/30 cursor-pointer transition-all shrink-0 ${isCurrent ? "bg-background/80 dark:bg-zinc-950/60 text-foreground font-bold border-t-2 border-t-primary" : "text-muted-foreground hover:bg-zinc-900/40 hover:text-foreground"}`}
                >
                  <span className="truncate max-w-[140px]">{fileObj.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                    className="p-0.5 rounded hover:bg-accent/80 text-muted-foreground/50 hover:text-destructive transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            {openTabs.length === 0 && <span className="text-xs font-mono pl-3 text-muted-foreground/30">// Staging editor canvas empty</span>}
          </div>

          <div className="flex-1 w-full bg-transparent flex flex-col min-h-0 mt-2">
            {activeFileId && activeFileObject ? (
              <textarea
                value={activeFileObject.content || ""}
                onChange={(e) => updateFileContent(activeFileId, e.target.value)}
                style={{ fontFamily: "var(--font-mono)" }}
                className="flex-1 w-full p-5 bg-transparent font-medium text-sm text-foreground placeholder:text-muted-foreground/20 resize-none focus:outline-none leading-relaxed border-0 custom-scrollbar"
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm font-mono text-muted-foreground/20">
                Select an engineering token from the workspace tree to open.
              </div>
            )}
          </div>
        </div>

        {/* LIVE REVIEW PREVIEW PANEL */}
        <div className="w-[35%] bg-white dark:bg-zinc-900/40 overflow-hidden min-h-0 relative flex flex-col shadow-2xl shrink-0 z-10">
          <div className="h-10 px-4 border-b border-border/60 bg-zinc-50 dark:bg-zinc-900/30 flex items-center text-xs font-mono text-muted-foreground/70 justify-between select-none shrink-0 font-bold">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-primary" />
              DevServer Instance Output Port: 3000
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 p-5 font-mono text-xs text-muted-foreground bg-zinc-50/20 dark:bg-transparent overflow-y-auto space-y-3 custom-scrollbar">
            <p className="text-muted-foreground/40 font-light italic">// Hot-Reloading Active Matrix Build Streams Cache Log:</p>
            <div className="space-y-1.5">
              {Object.values(files).filter(f => !f.name.endsWith(".keep")).map((f) => (
                <div key={f.id} className="px-3 py-2 bg-background/80 dark:bg-card/40 border border-border rounded-lg shadow-3xs flex items-center justify-between gap-4">
                  <span className="text-foreground/80 font-bold truncate">{f.path}</span>
                  <span className="text-[11px] text-muted-foreground font-mono bg-accent/40 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {f.content?.length || 0} chars
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}