// src/app/(ide)/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function IDERootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce strict server-side authentication protection for the workspace
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    // 🌌 SWAPPED: bg-background shifted to high-contrast bg-black
    <div className="w-full min-h-screen bg-black text-foreground overflow-hidden font-sans select-none antialiased transition-colors duration-500 box-border block">
      
      {/* Premium Minimal Dual-Tone Architectural Grid Lines */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.2] dark:opacity-[0.08]">
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      {/* 🚀 FIXED EDGE-TO-EDGE VIEWPORT FRAME: Dropped p-4 down to p-0 completely */}
      <div className="w-full h-screen flex flex-col p-0 relative box-border">
        {children}
      </div>

    </div>
  );
}