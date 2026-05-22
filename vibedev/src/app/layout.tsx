import type { Metadata } from "next";
import { Poppins, Lora, Inconsolata } from "next/font/google";
import "./globals.css";
import {SessionProvider} from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["100","200","300" , "400" , "500" , "600" , "700" , "800" , "900"],
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Inconsolata({
  subsets: ["latin"],
  variable: "--font-mono",
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
  const session = await auth()
  return (
    <SessionProvider session={ session }>
      <ThemeProvider>
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
    </ThemeProvider>
    </SessionProvider>
  );
}
