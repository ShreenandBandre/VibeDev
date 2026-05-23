// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/theme-provider";

// 📐 PREMIUM HIGH-LEGIBILITY INTERFACE TYPOGRAPHY (UPSCALE SIZES)
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

// 💻 ELITE MONOSPACE COMPILATION TRACK TYPOGRAPHY
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "VibeDev",
  description: "A platform for Vibe Coding",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} h-full antialiased`}
      suppressHydrationWarning // 💎 FIXED: Now passed cleanly as a native Boolean attribute flag!
    >
      <body className="min-h-full flex flex-col font-sans">
        <SessionProvider session={session}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}