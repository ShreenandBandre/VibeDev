// src/app/(ide)/playground/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PlaygroundProvider } from "@/features/playground"; 
import { WorkspaceClientCanvas } from "./workspace-client-canvas"; // We will split client controls here next
import { Cpu, HardDrive, ArrowLeft, Terminal } from "lucide-react";

interface PlaygroundPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaygroundWorkspacePage({ params }: PlaygroundPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/sign-in");

  const resolvedParams = await params;

  const sandbox = await prisma.playground.findUnique({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: { templateFiles: true }
  });

  if (!sandbox) notFound();

  const activeFilesManifest = (sandbox.templateFiles[0]?.content as Record<string, string>) || {};

  return (
    <PlaygroundProvider initialFiles={activeFilesManifest}> {/* 👈 Mount state container loop */}
      <div className="w-full h-full flex flex-col gap-4 animate-fade-in">
        
        {/* UPPER INDUSTRIAL HEADER */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-xl border border-border bg-card/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border border-primary/20 bg-primary/5 text-primary"><Cpu className="w-4 h-4" /></div>
              <div>
                <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-2">
                  {sandbox.title}
                  <span className="text-[9px] font-mono font-black uppercase tracking-widest text-primary bg-primary/15 border border-primary/20 px-2 py-0.5 rounded">
                    {sandbox.template} Runtime
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* 🛠️ PASSING TO THE CLIENT INTERACTIVE COMPONENT GRID TRACKS */}
        <WorkspaceClientCanvas playgroundId={sandbox.id} />

      </div>
    </PlaygroundProvider>
  );
}