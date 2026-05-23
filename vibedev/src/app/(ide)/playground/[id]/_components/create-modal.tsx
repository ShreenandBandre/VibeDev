// src/app/(ide)/playground/[id]/_components/create-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { FilePlus, FolderPlus, X } from "lucide-react";

interface CreateModalProps {
  isOpen: boolean;
  isFolder: boolean;
  parentPath: string | null;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function CreateModal({ isOpen, isFolder, parentPath, onCancel, onConfirm }: CreateModalProps) {
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    if (isOpen) setItemName("");
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      onConfirm(itemName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-md border border-border/80 bg-zinc-950 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 relative animate-in scale-in duration-150"
      >
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 p-1 rounded-lg text-zinc-500 hover:text-foreground hover:bg-zinc-900 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xl shrink-0">
            {isFolder ? <FolderPlus className="w-5 h-5" /> : <FilePlus className="w-5 h-5" />}
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground font-sans">
              Create New {isFolder ? "Directory Folder" : "Code File File"}
            </h3>
            {parentPath && (
              <p className="text-[11px] font-mono text-zinc-500 truncate max-w-[280px]">
                Target Location: <span className="text-primary font-semibold">/{parentPath}</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder={isFolder ? "components" : "index.tsx"}
            className="w-full h-10 px-3 border border-border/60 bg-zinc-900 text-xs font-mono text-foreground rounded-xl focus:outline-none focus:border-primary/40 transition-colors"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3 font-mono text-xs font-bold pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-border bg-card/40 text-foreground rounded-xl hover:bg-accent transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 active:scale-98 transition-all cursor-pointer uppercase tracking-wider">
            Generate Node
          </button>
        </div>
      </form>
    </div>
  );
}