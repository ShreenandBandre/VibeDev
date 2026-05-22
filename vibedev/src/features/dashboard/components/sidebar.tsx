// src/features/dashboard/components/sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { createPlaygroundAction } from "../actions/playground";
import { useTheme } from "@/components/theme-provider";
import { 
  Home, 
  LayoutDashboard, 
  Star, 
  LogOut, 
  Sun, 
  Moon, 
  FolderCode,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  recents: Array<{ id: string; name: string }>;
}

export const Sidebar = ({ user, recents }: SidebarProps) => {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  // 📐 RESIZING & COLLAPSIBLE ENGINES
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Starred", href: "/dashboard/starred", icon: Star },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isCollapsed) return;
      let newWidth = e.clientX;
      if (newWidth < 180) newWidth = 180;
      if (newWidth > 420) newWidth = 420;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isCollapsed]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCollapsed) return; // Prevent resizing while detached/collapsed
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleCreateNewSandbox = () => {
    if (isPending) return;
    startTransition(async () => {
      const randomTag = Math.random().toString(36).substring(7).toUpperCase();
      await createPlaygroundAction({
        name: `Sandbox [${randomTag}]`,
        description: "Quick sandbox workspace.",
        template: "REACT",
      });
    });
  };

  // Determine actual rendered width based on collapse state
  const currentWidth = isCollapsed ? 64 : sidebarWidth;

  return (
    <div 
      ref={sidebarRef}
      style={{ width: `${currentWidth}px` }}
      className="relative h-screen border-r border-border/60 bg-card/30 backdrop-blur-md flex flex-col justify-between select-none shrink-0 transition-all duration-300 ease-in-out"
    >
      {/* 🚀 TOGGLE/DETACH BUTTON */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-7 -right-3 h-6 w-6 rounded-full border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center shadow-sm z-50 cursor-pointer transition-transform hover:scale-105"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* UPPER LAYOUT DECK */}
      <div className="flex flex-col gap-6 pt-6 px-3 overflow-hidden">
        
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-1.5 group shrink-0 min-h-[32px]">
          <Image
            src="/logo.png"
            alt="VibeDev Logo"
            width={32}
            height={32}
            className="object-contain transition-transform group-hover:scale-105 shrink-0"
          />
          {!isCollapsed && (
            <span className="font-sans font-black text-lg tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent truncate">
              VibeDev
            </span>
          )}
        </Link>

        {/* Global Navigation */}
        <nav className="flex flex-col gap-1 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl text-xs font-semibold uppercase tracking-wider transition-all truncate h-10 ${
                  isCollapsed ? "justify-center px-0" : "px-3 gap-3"
                } ${
                  isActive
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* RECENTS FEED */}
        <div className="flex flex-col gap-2 pt-2 overflow-hidden">
          <div className={`text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 flex items-center shrink-0 min-h-[24px] ${
            isCollapsed ? "justify-center px-0" : "justify-between px-3"
          }`}>
            {!isCollapsed && <span className="truncate mr-2">Recent Projects</span>}
            <button
              onClick={handleCreateNewSandbox}
              disabled={isPending}
              className="p-1 rounded-md border border-border/80 bg-card/50 hover:bg-foreground hover:text-background text-muted-foreground transition-all duration-200 cursor-pointer disabled:opacity-40 shrink-0"
              title="Initialize New Playground"
            >
              <Plus className={`w-3 h-3 ${isPending ? "animate-spin" : ""}`} />
            </button>
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col gap-1 overflow-y-auto pr-1">
              {recents.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/50 font-light italic px-3 py-2 whitespace-nowrap">
                  No sandboxes found.
                </p>
              ) : (
                recents.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/${project.id}`}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all font-sans font-medium truncate shrink-0"
                  >
                    <FolderCode className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* LOWER ACCOUNT UTILITIES */}
      <div className={`border-t border-border/40 bg-background/40 flex flex-col gap-3 shrink-0 overflow-hidden ${
        isCollapsed ? "p-2 items-center" : "p-4"
      }`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center border border-border rounded-xl bg-card/60 hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer h-9 ${
            isCollapsed ? "w-10 justify-center px-0" : "w-full justify-between px-3"
          }`}
          title="Toggle System Theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 shrink-0" /> : <Moon className="w-3.5 h-3.5 shrink-0" />}
          {!isCollapsed && <span className="truncate">{isDark ? "Light" : "Dark"}</span>}
        </button>

        <div className={`flex items-center justify-between gap-2 overflow-hidden ${isCollapsed ? "flex-col w-full pt-1" : "px-2 pt-1"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {user.image ? (
              <Image
                src={user.image}
                alt="Avatar"
                width={28}
                height={28}
                className="rounded-full border border-border/80 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 shrink-0">
                {user.name?.charAt(0) || "D"}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate">{user.name || "Developer"}</span>
                <span className="text-[10px] text-muted-foreground font-mono truncate">{user.email}</span>
              </div>
            )}
          </div>
          
          <Link 
            href="/api/auth/signout"
            className={`text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors shrink-0 ${
              isCollapsed ? "p-1 mt-2" : "p-2"
            }`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 🎛️ RESIZER DRAG BAR (Hidden when collapsed) */}
      {!isCollapsed && (
        <div 
          onMouseDown={startResizing}
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-all duration-150 select-none ${
            isDragging ? "bg-primary opacity-100 scale-x-150" : "bg-transparent hover:bg-primary/40 opacity-40"
          }`}
        />
      )}

    </div>
  );
};