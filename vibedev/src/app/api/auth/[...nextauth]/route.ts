import { handlers } from "@/auth"; // Adjust this import path based on where your main handlers are
import { NextRequest } from "next/server";

const { GET: originalGET, POST: originalPOST } = handlers;

// A custom request transformer that locks down the host header to your exact domain
function forceCanonicalHost(req: NextRequest) {
  const url = new URL(req.url);
  
  // Directly overwrite the host to match your explicit Google Console settings
  req.headers.set("host", "vibe-dev-shreenandbandres-projects.vercel.app");
  req.headers.set("x-forwarded-host", "vibe-dev-shreenandbandres-projects.vercel.app");
  
  return req;
}

export const GET = (req: NextRequest) => {
  return originalGET(forceCanonicalHost(req));
};

export const POST = (req: NextRequest) => {
  return originalPOST(forceCanonicalHost(req));
};