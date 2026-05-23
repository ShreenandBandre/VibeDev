// src/app/(ide)/playground/[id]/_components/delete-modal.tsx
"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteModalProps {
  isOpen: boolean;
  targetName: string;
  isFolder: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteModal({ isOpen, targetName, isFolder, onCancel, onConfirm }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-md border border-border/80 bg-zinc-950 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 relative animate-in scale-in duration-150">
        
        {/* Close Button Cross Icon */}
        <button onClick={onCancel} className="absolute right-4 top-4 p-1 rounded-lg text-zinc-500 hover:text-foreground hover:bg-zinc-900 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-bold tracking-tight text-foreground font-sans">
              Delete {isFolder ? "Folder Scope" : "File Token"}?
            </h3>
            <p className="text-xs font-mono text-zinc-500 leading-relaxed">
              Are you sure you want to permanently purge <span className="text-zinc-300 font-bold">"{targetName}"</span>? This action mutation cannot be rolled back from Cloud Atlas logs.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 font-mono text-xs font-bold pt-2">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 border border-border bg-card/40 text-foreground rounded-xl hover:bg-accent transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl hover:opacity-90 active:scale-98 transition-all cursor-pointer uppercase tracking-wider"
          >
            Purge Permanent
          </button>
        </div>

      </div>
    </div>
  );
}