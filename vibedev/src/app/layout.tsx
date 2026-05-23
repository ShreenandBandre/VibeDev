// src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

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
      className={`${fontSans.variable} ${fontMono.variable} ${fontSerif.variable} h-full antialiased m-0 p-0 overflow-hidden`}
      suppressHydrationWarning
    >
      {/* 🚀 FIXED: Added m-0 p-0 h-full w-full and dark background configurations directly to the base body block */}
      <body className="w-full h-full m-0 p-0 flex flex-col font-sans bg-white dark:bg-black overflow-hidden box-border antialiased">
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