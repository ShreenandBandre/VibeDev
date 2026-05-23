// src/app/(ide)/playground/[id]/_components/rename-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Edit3, X } from "lucide-react";

interface RenameModalProps {
  isOpen: boolean;
  currentName: string;
  onCancel: () => void;
  onConfirm: (newName: string) => void;
}

export function RenameModal({ isOpen, currentName, onCancel, onConfirm }: RenameModalProps) {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (isOpen) setNewName(currentName);
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName.trim() !== currentName) {
      onConfirm(newName.trim());
    } else {
      onCancel();
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
          <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground font-sans">
              Rename Workspace Identifier
            </h3>
            <p className="text-xs font-mono text-zinc-500">
              Modifying path pointer keys for <span className="text-zinc-300 font-bold">"{currentName}"</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full h-10 px-3 border border-border/60 bg-zinc-900 text-xs font-mono text-foreground rounded-xl focus:outline-none focus:border-primary/40 transition-colors"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3 font-mono text-xs font-bold pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-border bg-card/40 text-foreground rounded-xl hover:bg-accent transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-amber-500 text-zinc-950 rounded-xl hover:opacity-90 active:scale-98 transition-all cursor-pointer uppercase tracking-wider">
            Commit Changes
          </button>
        </div>
      </form>
    </div>
  );
}