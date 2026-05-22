// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EmptyState, NewPlaygroundCard, NewRepoCard } from "@/features/dashboard";
import { FolderCode, Terminal, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const playgrounds = await prisma.playground.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in relative pb-12">
      
      {/* Upper Title Context Bar */}
      <div className="border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-widest mb-1.5">
          <Terminal className="w-3.5 h-3.5" />
          Active Node Instance Loop
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Workspace Hub
        </h1>
        <p className="text-sm text-muted-foreground font-light mt-0.5">
          Manage your persistent code sandboxes and cloud clusters.
        </p>
      </div>

      {/* 🚀 STEP 4: THE TWIN PREMIUM CONTROL DECK ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NewPlaygroundCard />
        <NewRepoCard />
      </div>

      {/* Bottom Grid Canvas Stream */}
      <div className="space-y-4 pt-4">
        <h2 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Your Active Projects Deck ({playgrounds.length})
        </h2>

        {playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playgrounds.map((project) => (
              <div
                key={project.id}
                className="group relative border border-border/80 bg-card/40 dark:bg-card/20 backdrop-blur-md rounded-2xl p-6 shadow-xs hover:border-primary/40 hover:bg-card/80 dark:hover:bg-card/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  <span className="text-[9px] font-mono font-black tracking-widest text-primary bg-primary/10 dark:bg-primary/5 border border-primary/20 px-2.5 py-0.5 rounded-md shadow-2xs">
                    {project.template}
                  </span>
                  <h3 className="text-base font-bold mt-5 mb-1.5 text-foreground transition-colors group-hover:text-primary">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed mb-6 line-clamp-2">
                    {project.description || "No customized execution environment profile description metadata was provided."}
                  </p>
                </div>
                
                <div className="relative z-10 text-[10px] font-mono text-muted-foreground/60 border-t border-border/40 pt-3.5 mt-auto flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FolderCode className="w-3.5 h-3.5 text-muted-foreground/70" />
                    ID: <span className="text-foreground/80">{project.id.slice(-6).toUpperCase()}</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground/50">
                    <Clock className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}