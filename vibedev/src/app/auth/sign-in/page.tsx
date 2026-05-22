// src/app/auth/sign-in/page.tsx
import { SignInForm } from "@/features/auth";

export default function SignInPage() {
  return (
    <main className="min-h-screen w-full bg-background transition-colors duration-500">
      <SignInForm />
    </main>
  );
}