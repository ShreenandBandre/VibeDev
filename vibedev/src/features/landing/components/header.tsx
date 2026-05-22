"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";

export const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8">
        
        {/* Brand Logo Identity Block */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.png"
            alt="VibeDev Logo"
            width={32}
            height={32}
            className="object-contain transition-transform group-hover:scale-105"
            priority
          />
          <span className="font-sans font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            VibeDev
          </span>
        </Link>

        {/* Global Documentation Navigation Deck */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/docs" className="transition-colors hover:text-foreground">Docs</Link>
          <Link href="/api" className="transition-colors hover:text-foreground">API Reference</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">GitHub</a>
        </nav>

        {/* Interactivity Control Hub */}
        <div className="flex items-center gap-4">
          {/* Dark / Light Toggle Trigger */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent transition active:scale-95"
            aria-label="Toggle visual display theme context"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {/* Core App Direct Action Gateway */}
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-98"
          >
            Dashboard 🚀
          </Link>
        </div>

      </div>
    </header>
  );
};