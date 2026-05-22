// src/features/dashboard/actions/playground.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { Templates } from "@prisma/client"; // 👈 Pulls updated Enum values

export const createPlaygroundAction = async (data: {
  title: string; 
  description?: string;
  template: Templates;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized user tracking profile." };
    }

    // Create playground and child templateFiles atomically in one transaction
    const newPlayground = await prisma.playground.create({
      data: {
        title: data.title,
        description: data.description,
        template: data.template,
        userId: session.user.id,
        templateFiles: {
          create: {
            content: {
              "index.html": "<h1>Welcome to the Next-Gen VibeDev Canvas!</h1>",
              "styles.css": "body { background: #000; color: #fff; }"
            }
          }
        }
      },
    });

    revalidatePath("/dashboard");
    return { success: true, playgroundId: newPlayground.id };
  } catch (error) {
    console.error("PLAYGROUND_CREATION_FAILURE:", error);
    return { error: "Failed to generate persistent playground sandbox environment." };
  }
};


export const getUserPlaygroundsAction = async () => {
  try {
    // 1. Confirm security credentials on the server tier
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized. Session context missing or expired." };
    }

    // 2. Query MongoDB Atlas with strict ownership and descending chronological sorting
    const playgrounds = await prisma.playground.findMany({
      where: { 
        userId: session.user.id 
      },
      select: {
        id: true,
        title: true,
        description: true,
        template: true,
        createdAt: true,
        updatedAt: true,
        // Eager load the StarMark array to instantly check if this user favorited it
        Starmark: {
          where: { userId: session.user.id },
          select: { isMarked: true }
        },
        // Only fetch the ID of the file system container to verify initialization state
        templateFiles: {
          select: { id: true }
        }
      },
      orderBy: { 
        createdAt: "desc" 
      }
    });

    return { success: true, data: playgrounds };
  } catch (error) {
    console.error("GET_USER_PLAYGROUNDS_FAILURE:", error);
    return { error: "Failed to fetch your cloud sandbox cluster data records." };
  }
};

export const deletePlaygroundAction = async (playgroundId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized session tracking profile." };

    await prisma.playground.delete({
      where: { id: playgroundId, userId: session.user.id }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("PLAYGROUND_DELETION_FAILURE:", error);
    return { error: "Failed to purge database instance record tracking arrays." };
  }
};


export const duplicatePlaygroundAction = async (playgroundId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized session tracking profile." };

    // Fetch the target parent container source data alongside its active files payload
    const source = await prisma.playground.findUnique({
      where: { id: playgroundId, userId: session.user.id },
      include: { templateFiles: true }
    });

    if (!source) return { error: "Target platform project record missing or unavailable." };

    // Auto-compute unique consecutive serial tag suffixes matching your current cluster list length
    const baselineCount = await prisma.playground.count({ where: { userId: session.user.id } });
    const serialSuffix = String(baselineCount + 1).padStart(3, "0");
    
    // Clean out previous matching regex brackets to construct a gorgeous layout text string
    const cleanRawTitle = source.title.replace(/^\[#VIBE-\d+\]\s*/, "");

    await prisma.playground.create({
      data: {
        title: `[#VIBE-${serialSuffix}] ${cleanRawTitle} (Copy)`,
        description: source.description,
        template: source.template,
        userId: session.user.id,
        templateFiles: {
          create: {
            content: source.templateFiles[0]?.content || {}
          }
        }
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("PLAYGROUND_DUPLICATION_FAILURE:", error);
    return { error: "Failed to safely mirror the requested workspace context files." };
  }
};


export const updatePlaygroundMetaAction = async (playgroundId: string, data: { title: string; description: string }) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized user identity footprint metadata." };

    // Retain original serial string identifier token formatting during re-writes
    const currentRecord = await prisma.playground.findUnique({
      where: { id: playgroundId, userId: session.user.id },
      select: { title: true }
    });
    
    const serialPrefixMatch = currentRecord?.title.match(/^\[#VIBE-\d+\]\s*/);
    const prefix = serialPrefixMatch ? serialPrefixMatch[0] : "";
    const cleanNewTitle = data.title.replace(/^\[#VIBE-\d+\]\s*/, "");

    await prisma.playground.update({
      where: { id: playgroundId, userId: session.user.id },
      data: {
        title: `${prefix}${cleanNewTitle.trim()}`,
        description: data.description.trim()
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("PLAYGROUND_UPDATE_FAILURE:", error);
    return { error: "Failed to push customized metadata property mutations." };
  }
};