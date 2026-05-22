// src/app/(dashboard)/layout.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/features/dashboard";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const recentPlaygrounds = await prisma.playground.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
    take: 7,
  });

  return (
    <div className="flex w-full h-screen overflow-hidden bg-background transition-colors duration-500">
      
      {/* Sidebar now manages its own dynamic width internally */}
      <Sidebar user={session.user} recents={recentPlaygrounds} />

      {/* Main content viewport expands automatically */}
      <div className="flex-1 h-full overflow-y-auto relative bg-background">
        <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.2] dark:opacity-[0.1]">
          <div className="absolute inset-0 bg-grid-pattern" />
          <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary blur-[120px]" />
        </div>

        <main className="w-full h-full p-6 sm:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}