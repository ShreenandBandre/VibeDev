// src/app/api/playground/[id]/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized endpoint access attempt" }, { status: 401 });
    }

    const { files } = await Bowls.json() as { files: Record<string, string> };
    const resolvedParams = await params;

    // Direct atomic relational update targeting the correct user workspace files collection map
    await prisma.templateFile.update({
      where: { playgroundId: resolvedParams.id },
      data: {
        content: files,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API_PLAYGROUND_SAVE_CRASH:", error);
    return NextResponse.json({ error: "Internal transactional mutation write failure." }, { status: 500 });
  }
}