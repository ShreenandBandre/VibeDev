// src/route.ts

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