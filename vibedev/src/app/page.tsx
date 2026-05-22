import Link from "next/link";
import Image from "next/image";
import { Header } from "@/features/landing/components/header";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden select-none transition-colors duration-300">
      
      {/* Premium Ambient Background Mesh Effect */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.35] dark:opacity-[0.15]">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-primary blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-chart-2 blur-[160px]" />
      </div>

      {/* Embedded Global Application Top Header */}
      <Header />

      {/* Main Interactive Hero Workspace Frame */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto py-12 md:py-20 z-10">
        
        {/* Animated Central Structural Feature Visual Vector */}
        <div className="relative w-full max-w-lg aspect-[4/3] mb-12 animate-fade-in group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-chart-2/10 rounded-3xl blur-2xl transition-all duration-300 group-hover:scale-105" />
          <Image
            src="/pic01.svg"
            alt="VibeDev Sandbox Interface Illustration"
            fill
            className="object-contain relative drop-shadow-2xl select-none"
            priority
          />
        </div>

        {/* High Precision Typography Block */}
        <h1 className="font-sans font-black text-4xl sm:text-6xl tracking-tight max-w-3xl leading-[1.1] mb-6">
          Develop with absolute{" "}
          <span className="bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
            Clarity and Vibe.
          </span>
        </h1>

        <p className="font-sans font-light text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Unlock a high-precision, persistent cloud environment tailored for modern engineering. Next-gen sandboxes, real-time sync, and fluid tooling layouts built directly into your active browser canvas.
        </p>

        {/* The Primary Redirect Funnel Control Hook */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-foreground text-background font-bold rounded-2xl transition shadow-xl hover:opacity-90 active:scale-[0.99] text-base group"
          >
            Get Started Free
            <span className="inline-block ml-2 transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
          
          <Link
            href="/docs"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 border border-border bg-card/50 text-foreground font-semibold rounded-2xl transition hover:bg-accent text-base"
          >
            Read Documentation
          </Link>
        </div>

      </main>

      {/* Modular Fine-Print Footer Layout Segment */}
      <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground font-mono mt-auto">
        <div>// VIBEDEV INFRASTRUCTURE LABS © {new Date().getFullYear()} — SYSTEM SECURITY ACTIVE</div>
      </footer>

    </div>
  );
}