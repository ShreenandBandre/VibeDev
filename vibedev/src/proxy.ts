import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

// Local path constants for the gatekeeper logic
const publicRoutes = ["/"];
const authRoutes = ["/auth/sign-in"];
const apiAuthPrefix = "/api/auth";
const DEFAULT_LOGIN_REDIRECT = "/dashboard";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 1. Allow internal API endpoints to resolve unconditionally
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // 2. Intercept Authentication Pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
    return NextResponse.next();
  }

  // 3. Secure Internal Protected Layouts
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
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