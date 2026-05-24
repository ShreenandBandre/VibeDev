"use server";

import { signIn } from "../../../auth"; 
import { DEFAULT_LOGIN_REDIRECT } from "../../../route";
import { AuthError } from "next-auth";

/**
 * Server Action to securely execute social authentication handshakes.
 * @param provider - The OAuth provider configuration string ('google' | 'github')
 */
export const loginAction = async (provider: "google" | "github") => {
  try {
    await signIn(provider, {
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "OAuthSignInError":
          return { error: "Failed to establish handshake connection with OAuth provider." };
        default:
          return { error: "An unexpected identity validation error occurred." };
      }
    }
    
    // ⚠️ CRITICAL: Next.js redirects work by throwing an internal runtime error. 
    // We MUST rethrow the error here, or our automatic redirect loops will break!
    throw error;
  }
};