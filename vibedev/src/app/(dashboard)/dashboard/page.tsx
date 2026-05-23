// src/app/(dashboard)/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { EmptyState, NewPlaygroundCard, NewRepoCard, getUserPlaygroundsAction, ProjectActionsDropdown } from "@/features/dashboard";
import { FolderCode, Terminal, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const result = await getUserPlaygroundsAction();
  const playgrounds = result.data || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in relative pb-12 font-sans text-base">
      
      {/* Upper Title Context Bar */}
      <div className="border-b border-border/60 pb-6">
        <div className="flex items-center gap-2 text-sm font-mono text-primary uppercase tracking-widest mb-2 font-bold">
          <Terminal className="w-4 h-4" />
          Active Node Instance Loop
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Workspace Hub
        </h1>
        <p className="text-base text-muted-foreground font-light mt-1.5">
          Manage your persistent code sandboxes and cloud clusters.
        </p>
      </div>

      {/* THE TWIN PREMIUM CONTROL DECK ENGINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NewPlaygroundCard />
        <NewRepoCard />
      </div>

      {/* Bottom Grid Canvas Stream */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xs uppercase font-bold tracking-widest text-muted-foreground/80 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Your Active Projects Deck ({playgrounds.length})
        </h2>

        {playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playgrounds.map((project) => (
              <Link
                key={project.id}
                href={`/playground/${project.id}`}
                className="group relative border border-border/80 bg-card/50 dark:bg-card/20 backdrop-blur-md rounded-2xl p-6 shadow-xs hover:border-primary/40 hover:bg-card/80 dark:hover:bg-card/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Background Hover Gradient */}
                <div className="absolute -inset-px bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10 w-full">
                  {/* Upper Header Control Row */}
                  <div className="flex items-center justify-between w-full mb-4">
                    <span className="text-[10px] font-mono font-black tracking-widest text-primary bg-primary/10 dark:bg-primary/5 border border-primary/20 px-2.5 py-1 rounded-md shadow-3xs">
                      {project.template}
                    </span>
                    
                    <div className="relative z-20">
                      <ProjectActionsDropdown 
                        playgroundId={project.id}
                        currentTitle={project.title}
                        currentDesc={project.description || ""}
                      />
                    </div>
                  </div>

                  {/* Title Header */}
                  <div className="flex items-start justify-between gap-2 mt-3">
                    <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary line-clamp-1">
                      {project.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 shrink-0 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <p className="text-sm text-muted-foreground font-light leading-relaxed mb-6 mt-1.5 line-clamp-2">
                    {project.description || "No customized execution environment profile description metadata was provided."}
                  </p>
                </div>
                
                {/* Lower Meta Footnotes */}
                <div className="relative z-10 text-xs font-mono text-muted-foreground/60 border-t border-border/40 pt-4 mt-auto flex items-center justify-between w-full">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FolderCode className="w-4 h-4 text-muted-foreground/70" />
                    ID: <span className="text-foreground/80">{project.id.slice(-6).toUpperCase()}</span>
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground/50 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}