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
import { useRouter } from "next/navigation";

interface ProjectActionsDropdownProps {
  playgroundId: string;
  currentTitle: string;
  currentDesc: string;
}

export const ProjectActionsDropdown = ({ playgroundId, currentTitle, currentDesc }: ProjectActionsDropdownProps) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(currentTitle.replace(/^\[#VIBE-\d+\]\s*/, ""));
  const [editDesc, setEditDesc] = useState(currentDesc || "");

  const menuRef = useRef<HTMLDivElement>(null);

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
      if (res.success) {
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this sandbox container context loop?")) return;
    
    startTransition(async () => {
      const res = await deletePlaygroundAction(playgroundId);
      if (res.success) {
        // 🚀 CRITICAL MECHANIC FIX: Clear states synchronously AFTER execution finishes
        setIsOpen(false);
        router.refresh(); 
      } else {
        alert(res.error || "Failed to successfully execute deletion.");
      }
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
      if (res.success) {
        setIsEditModalOpen(false);
        router.refresh();
      }
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
        <div 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          /* 🎨 PREMIUM ULTRA DARK CONTRAST RENDERING SKIN */
          className="absolute right-0 mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-950 p-1 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-100 flex flex-col text-left z-50"
        >
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors w-full cursor-pointer text-left font-sans"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {isCopied ? "URL Copied!" : "Copy Share Link"}
          </button>

          <button
            onClick={handleDuplicate}
            disabled={isPending}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors w-full cursor-pointer disabled:opacity-40 text-left font-sans"
          >
            <Files className="w-3.5 h-3.5" />
            Duplicate Instance
          </button>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(true); setIsOpen(false); }}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 transition-colors w-full cursor-pointer text-left font-sans"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Workspace Specs
          </button>

          <div className="h-px bg-neutral-800/60 my-1" />

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full cursor-pointer disabled:opacity-40 text-left font-sans"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Sandbox
          </button>
        </div>
      )}

      {/* INLINE SPECIFICATIONS EDITOR FLOATING WINDOW OVERLAY MODAL */}
      {isEditModalOpen && (
        <div 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(false); }} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="absolute inset-0" />
          
          <div 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="relative w-full max-w-md border border-neutral-800 bg-neutral-950 p-5 rounded-2xl shadow-2xl space-y-4 font-sans text-neutral-200"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <h3 className="text-sm font-bold text-neutral-100">Update Container Details</h3>
              <button 
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(false); }} 
                className="p-1 text-neutral-400 hover:text-neutral-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMeta} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-450">Workspace Name</label>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full h-10 px-3 border border-neutral-800 rounded-xl bg-neutral-900 text-xs text-neutral-100 focus:outline-hidden focus:border-neutral-700"
                  maxLength={36} required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-450">Description Metadata</label>
                <textarea 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full h-20 p-3 border border-neutral-800 rounded-xl bg-neutral-900 text-xs text-neutral-100 focus:outline-hidden focus:border-neutral-700 resize-none"
                  maxLength={140}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditModalOpen(false); }} 
                  className="px-4 h-9 border border-neutral-800 text-xs rounded-lg hover:bg-neutral-900 font-medium text-neutral-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!editTitle.trim() || isPending} 
                  className="px-4 h-9 bg-neutral-100 text-neutral-950 text-xs font-bold rounded-lg hover:bg-neutral-200 cursor-pointer disabled:opacity-40"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};