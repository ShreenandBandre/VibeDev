import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

/**
 * Public routes that anyone can visit without logging in.
 */
export const publicRoutes: string[] = [
  "/",
];

/**
 * Authentication routes. Logged-in users will be 
 * automatically redirected away from these back to the dashboard.
 */
export const authRoutes: string[] = [
  "/auth/sign-in",
];

/**
 * The core internal API callback path prefix for Auth.js.
 */
export const apiAuthPrefix: string = "/api/auth";

/**
 * The default workspace destination path after a successful sign-in.
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";

// Initialize your authentication runtime
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 1. Allow API Auth paths to resolve seamlessly
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 2. Intercept Authentication Pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(
        new URL(DEFAULT_LOGIN_REDIRECT, req.url)
      );
    }
    return NextResponse.next();
  }

  // 3. Secure Internal Protected Layouts
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/auth/sign-in", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};