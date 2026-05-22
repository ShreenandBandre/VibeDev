// src/features/dashboard/components/new-playground-card.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Terminal } from "lucide-react";
import { TemplateModal } from "./template-modal"; // 👈 Pulling in our fresh selection engine

export const NewPlaygroundCard = () => {
  // Local state container tracking overlay modal rendering
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)} // 👈 Open template choices instantly on click
        className="w-full text-left group relative border border-border/80 bg-card/30 dark:bg-card/10 backdrop-blur-md rounded-2xl p-8 shadow-xs hover:border-primary/40 hover:bg-card/60 dark:hover:bg-card/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden cursor-pointer"
      >
        {/* Hover Highlight Ambient Overlay Layer */}
        <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
              <Terminal className="w-3 h-3" />
              Core Engine
            </div>
            
            <h2 className="text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
              Create Fresh Playground
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90 text-muted-foreground group-hover:text-primary" />
            </h2>
            
            <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-sm">
              Spin up a stateless, multi-file execution container environment configured instantly with hot-reloading diagnostics.
            </p>
          </div>

          {/* Dynamic Premium Vector Canvas Frame */}
          <div className="relative w-32 h-32 shrink-0 select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105">
            <Image
              src="/pic03.svg"
              alt="New Playground Vector Graphic"
              fill
              className="object-contain opacity-90 dark:opacity-75"
              priority
            />
          </div>
        </div>
      </button>

      {/* 🚀 TECHNOLOGY CHIP SELECTION PORTAL ENTRYPOINT */}
      <TemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
