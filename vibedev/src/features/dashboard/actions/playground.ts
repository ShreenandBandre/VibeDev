// src/features/dashboard/actions/playground.ts
"use server";

import { prisma } from "@/lib/prisma"; // 👈 Importing from your clean prisma.ts file
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { ProjectTemplate } from "@prisma/client";

/**
 * Creates a brand-new code sandbox workspace for the authenticated user.
 */
export const createPlaygroundAction = async (data: {
  name: string;
  description?: string;
  template: ProjectTemplate;
}) => {
  try {
    // 1. Verify the user has an active session
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized access tracking context." };
    }

    // 2. Insert the playground document into MongoDB Atlas
    const newPlayground = await prisma.playground.create({
      data: {
        name: data.name,
        description: data.description,
        template: data.template,
        userId: session.user.id,
        // Initialize an empty file system structure object template
        fileSystem: {
          "index.html": { content: "<h1>Hello VibeDev Sandbox!</h1>" },
        },
      },
    });

    // 3. Purge the Next.js layout cache for the dashboard so the new project shows up instantly
    revalidatePath("/dashboard");

    return { success: true, playgroundId: newPlayground.id };
  } catch (error) {
    console.error("PLAYGROUND_CREATION_FAILURE:", error);
    return { error: "Failed to generate persistent playground sandbox environment." };
  }
};