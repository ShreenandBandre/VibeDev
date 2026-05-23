// src/app/(ide)/playground/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { WorkspaceClientCanvas } from "./workspace-client-canvas";
import { Cpu, HardDrive, ArrowLeft, Terminal } from "lucide-react";

interface PlaygroundPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaygroundWorkspacePage({ params }: PlaygroundPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const resolvedParams = await params;

  // 1. Fetch the unique playground cluster along with its child relational file items array
  const sandbox = await prisma.playground.findUnique({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: { templateFiles: true }
  });

  if (!sandbox) {
    notFound();
  }

  // 🚀 2. STATE BRIDGE: Format the relational array items perfectly to load directly into the client store
  const formattedInitialFiles = sandbox.templateFiles.map(file => ({
    id: file.id,
    name: file.name,
    path: file.path,
    content: file.content,
    isFolder: file.isFolder,
    parentId: file.parentId
  }));

  return (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in text-foreground font-sans text-base">
      
      {/* UPPER INDUSTRIAL HEADER CONTROL PANEL */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-xl border border-border bg-card/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl border border-primary/20 bg-primary/5 text-primary">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                {sandbox.title}
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-primary bg-primary/15 border border-primary/20 px-2.5 py-0.5 rounded">
                  {sandbox.template} Runtime Cluster
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Structural Specs Footnote Tags */}
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-muted-foreground/50">
          <span className="flex items-center gap-1">
            <HardDrive className="w-4 h-4 text-muted-foreground/60" /> 
            Engine: Zustand Global
          </span>
          <span className="flex items-center gap-1">
            <Terminal className="w-4 h-4 text-muted-foreground/60" /> 
            Data: Normalized
          </span>
        </div>
      </div>

      {/* 🛠️ CLIENT CANVAS CANVAS MODULE MOUNT */}
      <WorkspaceClientCanvas 
        playgroundId={sandbox.id} 
        serverInitialFiles={formattedInitialFiles} 
      />

    </div>
  );
}