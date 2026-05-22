// src/features/dashboard/components/project-actions-dropdown.tsx
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { 
  MoreVertical, Copy, Files, Edit2, Trash2, 
  Check, X, Loader2 
} from "lucide-react";
import { 
  deletePlaygroundAction, 
  duplicatePlaygroundAction, 
  updatePlaygroundMetaAction 
} from "../actions/playground";

interface ProjectActionsDropdownProps {
  playgroundId: string;
  currentTitle: string;
  currentDesc: string;
}

export const ProjectActionsDropdown = ({ playgroundId, currentTitle, currentDesc }: ProjectActionsDropdownProps) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Inline metadata updater modal toggles
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(currentTitle.replace(/^\[#VIBE-\d+\]\s*/, ""));
  const [editDesc, setEditDesc] = useState(currentDesc || "");

  const menuRef = useRef<HTMLDivElement>(null);

  // Hook to handle auto-closing the context menu if a developer clicks anywhere outside it
  useEffect(() => {
    const clickTracker = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickTracker);
    return () => document.removeEventListener("mousedown", clickTracker);
  }, []);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const sandboxAbsoluteUrl = `${window.location.origin}/playground/${playgroundId}`;
    navigator.clipboard.writeText(sandboxAbsoluteUrl);
    setIsCopied(true);
    setTimeout(() => { setIsCopied(false); setIsOpen(false); }, 1400);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    startTransition(async () => {
      const res = await duplicatePlaygroundAction(playgroundId);
      if (res.success) setIsOpen(false);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this sandbox container context loop?")) return;
    startTransition(async () => {
      const res = await deletePlaygroundAction(playgroundId);
      if (res.success) setIsOpen(false);
    });
  };

  const handleUpdateMeta = (e: React.FormEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!editTitle.trim() || isPending) return;
    startTransition(async () => {
      const res = await updatePlaygroundMetaAction(playgroundId, {
        title: editTitle.trim(),
        description: editDesc.trim()
      });
      if (res.success) setIsEditModalOpen(false);
    });
  };

  return (
    <div ref={menuRef} className="relative z-30">
      
      {/* TRIGGER ICON SWITCH BUTTON */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 rounded-lg border border-border bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-3xs"
        aria-label="Toggle structural workspace action lists"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreVertical className="w-3.5 h-3.5" />}
      </button>

      {/* DROPDOWN MENU FLOATING CONTEXT BLOCK CARD */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/80 bg-card/95 backdrop-blur-md p-1 shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col text-left">
          
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full cursor-pointer text-left"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "URL Copied!" : "Copy Share Link"}
          </button>

          <button
            onClick={handleDuplicate}
            disabled={isPending}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full cursor-pointer disabled:opacity-40 text-left"
          >
            <Files className="w-3.5 h-3.5" />
            Duplicate Instance
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(true); setIsOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors w-full cursor-pointer text-left"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Workspace Specs
          </button>

          <div className="h-px bg-border/40 my-1" />

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors w-full cursor-pointer disabled:opacity-40 text-left"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Sandbox
          </button>

        </div>
      )}

      {/* INLINE SPECIFICATIONS EDITOR FLOATING WINDOW OVERLAY MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/20 backdrop-blur-xs">
          <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(false); }} className="absolute inset-0 bg-black/20" />
          
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md border border-border/80 bg-card p-5 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <h3 className="text-sm font-bold text-foreground">Update Container Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>

            <form onSubmit={handleUpdateMeta} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Workspace Name</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-xl bg-background/50 text-xs text-foreground focus:outline-hidden"
                  maxLength={36} required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Description Metadata</label>
                <textarea 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full h-20 p-3 border border-border rounded-xl bg-background/50 text-xs text-foreground focus:outline-hidden resize-none"
                  maxLength={140}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 h-9 border border-border text-xs rounded-lg hover:bg-accent font-medium cursor-pointer">Cancel</button>
                <button type="submit" disabled={!editTitle.trim() || isPending} className="px-4 h-9 bg-foreground text-background text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-40">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};