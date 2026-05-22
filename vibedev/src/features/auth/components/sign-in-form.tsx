// src/features/auth/components/sign-in-form.tsx
"use client";

import { useTransition } from "react";
import { loginAction } from "../actions/login";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const SignInForm = () => {
  const [isPending, startTransition] = useTransition();

  const handleSocialLogin = (provider: "google" | "github") => {
    startTransition(async () => {
      await loginAction(provider);
    });
  };

  return (
    <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          VibeDev AI IDE
        </CardTitle>
        <CardDescription className="text-zinc-400 text-sm">
          Sign in to unlock your persistent, serverless development sandbox
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col gap-4 pt-4">
        {/* Google Authentication Button */}
        <Button
          disabled={isPending}
          onClick={() => handleSocialLogin("google")}
          className="w-full bg-white font-semibold text-black hover:bg-zinc-200 transition h-11 rounded-xl active:scale-[0.99]"
        >
          Continue with Google
        </Button>

        {/* GitHub Authentication Button */}
        <Button
          disabled={isPending}
          onClick={() => handleSocialLogin("github")}
          className="w-full bg-zinc-800 border border-zinc-700 font-semibold text-zinc-100 hover:bg-zinc-700 transition h-11 rounded-xl active:scale-[0.99]"
        >
          Continue with GitHub
        </Button>

        <p className="mt-4 text-center text-xs text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
          Secure execution context provided natively by dynamic proxy controls.
        </p>
      </CardContent>
    </Card>
  );
};