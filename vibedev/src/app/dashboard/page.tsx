// src/app/dashboard/page.tsx
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createPlaygroundAction } from "@/features/dashboard";

export default async function DashboardPage() {
  // 1. Confirm session credentials on the server tier
  const session = await auth();
  if (!session) {
    redirect("/auth/sign-in");
  }

  // 2. Fetch the user's persistent playground records from MongoDB Atlas
  const playgrounds = await prisma.playground.findMany({
    where: { userId: session.user?.id },
    orderBy: { createdAt: "desc" },
  });

  // 3. Native inline server action to handle the sandboxed creation test click
  async function handleCreateSandbox() {
    "use server";
    
    // Generate a test project name with a random string tag to easily verify uniqueness
    const randomTag = Math.random().toString(36).substring(7).toUpperCase();
    
    await createPlaygroundAction({
      name: `Sandbox Env [${randomTag}]`,
      description: "A secure, hot-reloading reactive execution workspace sandbox.",
      template: "REACT",
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl">
        
        {/* Workspace Upper Context Control Deck */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              VibeDev Hub
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Welcome back, <span className="text-zinc-200 font-medium">{session.user?.name || "Developer"}</span>
            </p>
          </div>
          
          <form action={async () => { "use server"; await signOut(); }}>
            <button 
              type="submit" 
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400 transition-all rounded-xl text-xs font-semibold uppercase tracking-wider"
            >
              Terminate Session
            </button>
          </form>
        </header>

        {/* Primary Interactive Creation Action Trigger */}
        <div className="mb-10">
          <form action={handleCreateSandbox}>
            <button 
              type="submit" 
              className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-xl hover:shadow-zinc-900/50 hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.99] text-sm tracking-tight"
            >
              🚀 Initialize New React Sandbox
            </button>
          </form>
        </div>

        {/* Workspace Persistent Content Feed Section */}
        <div className="space-y-4">
          <h2 className="text-sm uppercase font-bold tracking-widest text-zinc-400">
            Active Sandboxes ({playgrounds.length})
          </h2>
          
          {playgrounds.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center text-zinc-500 bg-zinc-900/20 backdrop-blur-sm">
              <p className="text-base font-medium text-zinc-400 mb-1">Your sandbox deck is empty</p>
              <p className="text-sm text-zinc-600 max-w-sm mx-auto">Click the button above to execute a backend write mutation loop and spin up a workspace card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playgrounds.map((project) => (
                <div 
                  key={project.id} 
                  className="group relative border border-zinc-800/80 bg-zinc-900/40 rounded-2xl p-6 shadow-md hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-2.5 py-1 rounded-md">
                        {project.template}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold mt-4 mb-1 text-zinc-100 group-hover:text-white transition-colors">
                      {project.name}
                    </h3>
                    
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      {project.description || "No sandbox profile description provided."}
                    </p>
                  </div>
                  
                  <div className="text-[10px] font-mono text-zinc-600 border-t border-zinc-800/60 pt-3 mt-auto flex items-center justify-between">
                    <span>ID: {project.id.slice(-6).toUpperCase()}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}