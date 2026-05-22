// src/features/auth/index.ts

/**
 * Public API Barrel Gateway for the Auth Feature Module.
 * Strictly controls module exports to ensure clean separation of concerns.
 */

// Export the interactive component view wrapper
export { SignInForm } from "./components/sign-in-form";

// 💡 Note: We intentionally DO NOT export 'loginAction' from here.
// The sign-in form consumes it internally, keeping our backend logic encapsulated.