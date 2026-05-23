// src/app/(ide)/playground/[id]/_components/workspace-editor.tsx
"use client";

import { X } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";

export function WorkspaceEditor() {
  const { files, activeFileId, openTabs, setActiveFileId, closeTab, updateFileContent } = useIDEStore();
  const activeFileObject = activeFileId ? files[activeFileId] : null;

  return (
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
              className={`h-full px-4 text-xs font-mono flex items-center gap-2.5 border-r border-border/30 cursor-pointer transition-all shrink-0 ${isCurrent ? "bg-background/80 dark:bg-zinc-950/60 text-foreground font-bold border-t-2 border-t-primary" : "text-zinc-400 hover:bg-zinc-900/40 hover:text-foreground"}`}
            >
              <span className="truncate max-w-[140px]">{fileObj.name}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                className="p-0.5 rounded hover:bg-accent/80 text-zinc-400 hover:text-destructive transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {openTabs.length === 0 && <span className="text-xs font-mono pl-3 text-zinc-600">// Staging editor canvas empty</span>}
      </div>

      <div className="flex-1 w-full bg-transparent flex flex-col min-h-0 mt-2">
        {activeFileId && activeFileObject ? (
          <textarea
            value={activeFileObject.content || ""}
            onChange={(e) => updateFileContent(activeFileId, e.target.value)}
            style={{ fontFamily: "var(--font-mono)" }}
            className="flex-1 w-full p-5 bg-transparent font-medium text-sm text-foreground placeholder:text-zinc-700 resize-none focus:outline-none leading-relaxed border-0 custom-scrollbar"
            spellCheck={false}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm font-mono text-zinc-600">
            Select an engineering token from the workspace tree to open.
          </div>
        )}
      </div>
    </div>
  );
}