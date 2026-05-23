// src/app/(ide)/playground/[id]/_components/workspace-header.tsx
"use client";

import { useState } from "react";
import { Menu, CloudLightning, Upload, Import, Download } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";

interface WorkspaceHeaderProps {
  playgroundId: string;
}

export function WorkspaceHeader({ playgroundId }: { playgroundId: string }) {
  const { files, initializeWorkspace, addNewItem, updateFileContent, isSaving, syncWithCloudAtlas } = useIDEStore();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const handleLocalSystemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawBody = event.target?.result as string || "";
        addNewItem(file.name, false, null);
        const newlyCreated = Object.values(useIDEStore.getState().files).find(f => f.name === file.name && !f.isFolder);
        if (newlyCreated) updateFileContent(newlyCreated.id, rawBody);
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
    anchor.download = `vibedev-workspace-cluster-${playgroundId.slice(-6)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setIsHamburgerOpen(false);
  };

  return (
    <div className="h-12 w-full border border-border/60 bg-card/40 backdrop-blur-md rounded-xl flex items-center justify-between px-4 mb-3 select-none relative z-50">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
          className={`p-2 rounded-lg border border-border bg-background/50 hover:bg-accent text-foreground transition-all cursor-pointer ${isHamburgerOpen ? "bg-primary/10 border-primary/40 text-primary scale-105" : ""}`}
        >
          <Menu className="w-4 h-4" />
        </button>
        <span className="text-sm font-mono font-bold tracking-tight text-zinc-400">// Workspace Framework Controls</span>
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
        <div className="absolute left-4 top-14 w-64 border border-border bg-card p-2 rounded-xl shadow-2xl flex flex-col text-sm font-medium text-zinc-400">
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
  );
}