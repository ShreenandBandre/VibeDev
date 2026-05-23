// src/app/(ide)/playground/[id]/_components/workspace-header.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, CloudLightning, Upload, Import, Download, Cpu, HardDrive, ArrowLeft, Sun, Moon, Maximize2, Minimize2 } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";
import Link from "next/link";

interface WorkspaceHeaderProps {
  playgroundId: string;
  projectTitle: string;
  projectTemplate: string;
}

export function WorkspaceHeader({ playgroundId, projectTitle, projectTemplate }: WorkspaceHeaderProps) {
  const { files, initializeWorkspace, addNewItem, updateFileContent, isSaving, syncWithCloudAtlas, themeMode, toggleThemeMode, initializeTheme } = useIDEStore();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    initializeTheme();
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [initializeTheme]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleLocalSystemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;
    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBody = (event.target?.result as string) || "";
        addNewItem(file.name, false, null);
        const newlyCreated = Object.values(useIDEStore.getState().files).find(f => f.name === file.name && !f.isFolder);
        if (newlyCreated) updateFileContent(newlyCreated.id, rawBody);
      };
      reader.readAsText(file);
    });
    setIsHamburgerOpen(false);
  };

  const handleInternetFetchImport = async () => {
    const targetUrl = prompt("Enter public repository JSON endpoint URL:");
    if (!targetUrl?.trim()) return;
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error("Connection failed.");
      const dataJson = await response.json();
      if (Array.isArray(dataJson)) initializeWorkspace(dataJson);
    } catch (err) {
      console.error(err);
    }
    setIsHamburgerOpen(false);
  };

  const handleDownloadProjectBundle = () => {
    const serializedData = JSON.stringify(files, null, 2);
    const dataBlob = new Blob([serializedData], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(dataBlob);
    anchor.download = `vibedev-bundle-${playgroundId.slice(-6)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setIsHamburgerOpen(false);
  };

  return (
    <div className="h-11 w-full border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#050506] flex items-center justify-between px-4 select-none relative z-50 shrink-0 transition-colors duration-150 box-border">
      
      {/* LEFT PORTION CONTROL BLOCKS */}
      <div className="flex items-center gap-2 w-1/4 justify-start">
        <Link href="/dashboard" className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-foreground transition-all cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <button onClick={() => setIsHamburgerOpen(!isHamburgerOpen)} className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-background/50 hover:bg-zinc-100 dark:hover:bg-accent text-zinc-900 dark:text-foreground transition-all cursor-pointer">
          <Menu className="w-3.5 h-3.5" />
        </button>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 dark:text-zinc-600 ml-1">
          <HardDrive className="w-3 h-3" />
          <span>Workspace Frame</span>
        </div>
      </div>

      {/* ABSOLUTE VISUAL CENTER POSITIONING */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
        <h1 className="text-[13px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 font-sans truncate max-w-[200px] sm:max-w-[360px]">
          {projectTitle}
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm shrink-0">
            {projectTemplate}
          </span>
        </h1>
      </div>

      {/* RIGHT SIDE ALIGNED INTERACTION TOOLBOX */}
      <div className="flex items-center gap-2 w-1/4 justify-end">
        <button onClick={toggleThemeMode} className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-foreground bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all active:scale-95" title="Toggle System Theme">
          {themeMode === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
        </button>

        <button onClick={handleToggleFullscreen} className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-foreground bg-zinc-50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-all active:scale-95" title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

        <button 
          onClick={() => syncWithCloudAtlas(playgroundId)} 
          disabled={isSaving} 
          className="h-7 px-3 bg-primary text-primary-foreground font-mono font-black rounded-md hover:opacity-90 active:scale-97 transition-all text-[11px] flex items-center gap-1.5 disabled:opacity-50 cursor-pointer uppercase tracking-wider shrink-0"
        >
          <CloudLightning className={`w-3 h-3 ${isSaving ? "animate-bounce" : ""}`} />
          <span>{isSaving ? "Saving" : "Save"}</span>
        </button>
      </div>

      {isHamburgerOpen && (
        <div className="absolute left-4 top-12 w-64 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 rounded-xl shadow-2xl flex flex-col text-xs font-medium text-zinc-500 font-sans">
          <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-foreground cursor-pointer w-full text-left">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            <span>Import local system files</span>
            <input type="file" multiple onChange={handleLocalSystemUpload} className="hidden" />
          </label>
          <button onClick={handleInternetFetchImport} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-foreground cursor-pointer w-full text-left">
            <Import className="w-3.5 h-3.5 text-orange-400" />
            <span>Import project via link</span>
          </button>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
          <button onClick={handleDownloadProjectBundle} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-foreground cursor-pointer w-full text-left">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Project backup</span>
          </button>
        </div>
      )}
    </div>
  );
}