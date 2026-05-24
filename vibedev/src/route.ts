import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🧱 DUMMY EXPORTS: Added to satisfy Turbopack imports across the app
export const publicRoutes: string[] = ["/"];
export const authRoutes: string[] = ["/auth/sign-in"];
export const apiAuthPrefix: string = "/api/auth";
export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // 1. Allow internal Next.js assets, static assets, and API routes to load normally
  if (
    nextUrl.pathname.startsWith("/_next") || 
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Direct Redirect: Send home or login pages straight to the dashboard
  if (nextUrl.pathname === "/" || nextUrl.pathname === "/auth/sign-in") {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};