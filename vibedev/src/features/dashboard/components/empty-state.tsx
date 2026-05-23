// src/features/dashboard/components/empty-state.tsx
"use client";

import { useTransition } from "react";
import Image from "next/image";
import { createPlaygroundAction } from "../actions/playground";
import { Plus, Loader2 } from "lucide-react";
import { Templates } from "@prisma/client";
import { useRouter } from "next/navigation";

export const EmptyState = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateSandbox = () => {
    if (isPending) return;

    startTransition(async () => {
      const response = await createPlaygroundAction({
        title: "First React Sandbox",
        description: "A secure, hot-reloading reactive execution workspace sandbox.",
        template: Templates.REACT,
      });

      if (response?.success && response.playgroundId) {
        // 🚀 LIVE BOUNCE: Instantly send the user straight into their running editor instance
        router.push(`/playground/${response.playgroundId}`);
      } else {
        console.error(response?.error || "Failed to initialize standard files manifest.");
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 relative rounded-2xl border border-border/60 bg-card/20 backdrop-blur-md p-10 text-center overflow-hidden shadow-2xl flex flex-col items-center">
      
      {/* Internal ambient glowing element */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[250px] w-[400px] rounded-full bg-primary/10 blur-[60px] pointer-events-none -z-10" />
      
      {/* 🖼️ CENTRAL STRUCTURAL ILLUSTRATION VECTOR */}
      <div className="relative w-48 h-48 mb-6 animate-fade-in select-none pointer-events-none">
        <Image
          src="/pic02.svg"
          alt="Empty Workspace Illustration"
          fill
          className="object-contain opacity-85 dark:opacity-75"
          priority
        />
      </div>

      {/* Typography Copy */}
      <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
        No active sandboxes detected
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 font-light leading-relaxed">
        Your cloud engine workspace environment is initialized and ready. Provision your first serverless playground instance below to begin compiling code.
      </p>

      {/* Action Trigger Button */}
      <button
        onClick={handleCreateSandbox}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background font-bold rounded-xl transition-all duration-200 shadow-xl hover:opacity-90 active:scale-[0.99] disabled:opacity-40 text-sm cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        {isPending ? "Provisioning Sandbox..." : "Initialize First React Sandbox"}
      </button>

      {/* Tiny Status Sub-text */}
      <div className="mt-6 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
        System Status: Operational // Cluster Bound: Stateless
      </div>
    </div>
  );
};