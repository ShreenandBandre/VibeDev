import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 💡 ADD THIS LINE RIGHT HERE TO FIX THE TURBOPACK BUILD ERRORS:
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default workspace destination path.
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // 1. Allow internal Next.js assets and API routes to load normally
  if (
    nextUrl.pathname.startsWith("/_next") || 
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. If they land on the landing page or login screen, send them straight to dashboard
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