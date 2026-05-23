// src/app/(ide)/playground/[id]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { WorkspaceClientCanvas } from "./workspace-client-canvas";

interface PlaygroundPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaygroundWorkspacePage({ params }: PlaygroundPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  const resolvedParams = await params;

  // 1. Fetch current sandbox data while eagerly loading all related database template files
  const sandbox = await prisma.playground.findUnique({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: { templateFiles: true }
  });

  if (!sandbox) {
    notFound();
  }

  // 🚀 2. EAGER LOAD RECENTS: Fetches the top 5 most recent sandboxes to fuel your sidebar shortcuts
  const recentPlaygrounds = await prisma.playground.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 5
  });

  // 3. Format file index array flatly for Monaco's state tree management tab stores
  const formattedInitialFiles = sandbox.templateFiles.map(file => ({
    id: file.id,
    name: file.name,
    path: file.path,
    content: file.content || "",
    isFolder: file.isFolder,
    parentId: file.parentId
  }));

  // 4. Map flat array schema directly to stream paths into the flat path-splitting transformer
  const rawTemplateItems = sandbox.templateFiles.map(file => ({
    filename: file.name,
    fileExtension: file.name.split('.').pop() || "",
    content: file.content || "",
    folderName: file.isFolder ? file.name : undefined,
    path: file.path,        // 🚀 CRITICAL OVERRIDE: Preserves pathing keys (e.g. "public/index.html")
    isFolder: file.isFolder // 🚀 CRITICAL OVERRIDE: Notifies directory creation layers
  }));

  const templateData = {
    folderName: sandbox.title || "root",
    items: rawTemplateItems
  };

  return (
    <div className="w-screen h-screen m-0 p-0 bg-white dark:bg-black overflow-hidden select-none block box-border">
      <WorkspaceClientCanvas 
        playgroundId={sandbox.id} 
        serverInitialFiles={formattedInitialFiles} 
        projectTitle={sandbox.title}
        projectTemplate={sandbox.template}
        templateData={templateData} // 🚀 Passed down to drive step automation cleanly
        recentProjects={recentPlaygrounds} // 🚀 Feeds multi-tab layout shortcuts
      />
    </div>
  );
}