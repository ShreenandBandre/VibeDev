import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🧱 DUMMY MODULE EXPORTS (Satisfies Turbopack compile checks across your app)
export const publicRoutes: string[] = ["/"];
export const authRoutes: string[] = ["/auth/sign-in"];
export const apiAuthPrefix: string = "/api/auth";
export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

export default function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // 1. Instantly allow internal Next.js assets, static assets, and API routes to load
  if (
    nextUrl.pathname.startsWith("/_next") || 
    nextUrl.pathname.startsWith("/api") ||
    nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. FORCE Bypassing: Bounces users off landing/auth screens straight to the dashboard
  if (nextUrl.pathname === "/" || nextUrl.pathname === "/auth/sign-in") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

// Ensure the middleware monitors every single page lifecycle route
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};