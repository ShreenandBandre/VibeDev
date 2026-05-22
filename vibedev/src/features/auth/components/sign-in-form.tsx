// src/features/auth/components/sign-in-form.tsx
"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginAction } from "../actions/login";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";  

export const SignInForm = () => {
  const [isPending, startTransition] = useTransition();
  const { isDark, toggleTheme } = useTheme();

  const handleSocialLogin = (provider: "google" | "github") => {
    startTransition(async () => {
      await loginAction(provider);
    });
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background transition-colors duration-500 relative">
      
      {/* 🏛️ LEFT COLUMN: LUXURY BRANDING & MATRIX DISPLAY */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between p-12 overflow-hidden border-r border-border/60">
        
        {/* Layered Matrix Background matching the Landing Page */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          {/* Structural grid lines */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] dark:opacity-[0.25]" />
          {/* Ambient Spotlight Blur */}
          <div className="absolute top-[-20%] left-[-20%] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 to-chart-2/5 blur-[120px]" />
        </div>

        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 group z-10 w-fit">
          <Image
            src="/logo.png"
            alt="VibeDev Logo"
            width={36}
            height={36}
            className="object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-sans font-black text-xl tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            VibeDev
          </span>
        </Link>

        {/* Center Descriptive Catchphrase Block */}
        <div className="space-y-6 max-w-sm my-auto z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[10px] font-mono uppercase tracking-widest text-primary">
            <span className="flex h-1 w-1 rounded-full bg-primary animate-pulse" />
            Secure Node Instance
          </div>
          <h2 className="text-3xl font-black tracking-tight leading-tight text-foreground">
            Enter the premium environment for cloud compilation.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            Access your serverless workspace files, hot-reloading compilers, and collaborative sandboxes with stateless encryption.
          </p>
        </div>

        {/* Bottom Fine Print Footer */}
        <div className="text-[10px] font-mono text-muted-foreground/60 z-10">
          // CONTEXT BINDING: ACTIVE_SECURE_PROXY
        </div>
      </div>

      {/* 🔓 RIGHT COLUMN: HIGH-FIDELITY SIGN-IN PORTAL */}
      <div className="relative lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-12 bg-background transition-colors duration-500">
        
        {/* ✨ DYNAMIC LIGHT/DARK MODE TOGGLE BUTTON */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-accent text-foreground transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
            aria-label="Toggle visual display theme context"
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Mobile/Tablet Background Grid Overlay */}
        <div className="absolute inset-0 lg:hidden -z-10 pointer-events-none bg-grid-pattern opacity-[0.1] mask-radial-fade" />

        <div className="w-full max-w-md space-y-8 px-4">
          
          {/* Portal Header */}
          <div className="space-y-3 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              Choose an authentication provider below to synchronize your profile and load your sandboxes.
            </p>
          </div>

          {/* Interactive Provider Interface Hub */}
          <div className="space-y-4 pt-4">
            
            {/* Google Authentication Trigger */}
            <Button
              disabled={isPending}
              onClick={() => handleSocialLogin("google")}
              className="w-full bg-foreground text-background font-bold hover:opacity-90 transition-all duration-200 h-12 rounded-xl shadow-md active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
            >
              Continue with Google
            </Button>

            {/* GitHub Authentication Trigger */}
            <Button
              disabled={isPending}
              onClick={() => handleSocialLogin("github")}
              className="w-full bg-card border border-border font-semibold text-foreground hover:bg-accent transition-all duration-200 h-12 rounded-xl active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
            >
              Continue with GitHub
            </Button>

          </div>

          {/* Core Security Warning Notice */}
          <p className="text-center lg:text-left text-[11px] font-mono text-muted-foreground/60 leading-relaxed max-w-sm pt-4">
            * By entering this gateway interface context loop, you deploy an end-to-end cryptographic state session verified by standard edge middleware matrices.
          </p>
          
        </div>
      </div>

    </div>
  );
};