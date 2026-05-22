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
    <div className="w-full min-h-screen bg-background text-foreground overflow-hidden font-sans select-none antialiased transition-colors duration-500">
      
      {/* Premium Minimal Dual-Tone Architectural Grid Lines */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.2] dark:opacity-[0.08]">
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      {/* Main Full-Screen Application Viewport Wrap */}
      <div className="w-full h-screen flex flex-col p-4 relative">
        {children}
      </div>

    </div>
  );
}