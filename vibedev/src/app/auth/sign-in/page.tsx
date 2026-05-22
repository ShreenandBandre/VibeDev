// src/app/auth/sign-in/page.tsx
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-zinc-950 p-6">
      {/* Renders our clean decoupled feature component */}
      <SignInForm />
    </main>
  );
}