// src/features/dashboard/components/new-repo-card.tsx
"use client";

import Image from "next/image";
import { GitBranch, ArrowRight } from "lucide-react";

export const NewRepoCard = () => {
  const handleImportRepo = () => {
    // This gateway pipeline hooks cleanly into our future GitHub integration module layer
    console.log("TRIGGER_EXTERNAL_REPOSITORY_IMPORT_MODAL");
  };

  return (
    <button
      onClick={handleImportRepo}
      className="w-full text-left group relative border border-border/80 bg-card/30 dark:bg-card/10 backdrop-blur-md rounded-2xl p-8 shadow-xs hover:border-chart-2/40 hover:bg-card/60 dark:hover:bg-card/30 hover:shadow-lg hover:shadow-chart-2/5 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="absolute -inset-px bg-gradient-to-br from-chart-2/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-chart-2/20 bg-chart-2/5 text-[10px] font-mono uppercase tracking-widest text-chart-2">
            <GitBranch className="w-3 h-3" />
            VCS Gateway
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground group-hover:text-chart-2 transition-colors flex items-center gap-2">
            Clone Git Repository
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </h2>
          <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
            Connect and import your structural workspace codebases straight from GitHub or GitLab endpoints directly into your cloud editor.
          </p>
        </div>

        {/* Dynamic Vector Canvas Frame */}
        <div className="relative w-32 h-32 shrink-0 select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src="/pic04.svg" // Make sure to drop an asset here, or copy pic02/pic03 for testing
            alt="Import Repository Vector Graphic"
            fill
            className="object-contain opacity-90 dark:opacity-75"
            priority
          />
        </div>
      </div>
    </button>
  );
};