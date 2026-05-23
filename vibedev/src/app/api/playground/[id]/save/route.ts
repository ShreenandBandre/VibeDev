// src/app/api/playground/[id]/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { IDEFile } from "@/lib/store/use-ide-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access path." }, { status: 401 });
    }

    const { filePayloadArray } = await req.json() as { filePayloadArray: IDEFile[] };
    const resolvedParams = await params;

    // Use a transactional pipeline to wipe out the old structure and re-seed clean
    await prisma.$transaction([
      prisma.templateFile.deleteMany({ where: { playgroundId: resolvedParams.id } }),
      prisma.templateFile.createMany({
        data: filePayloadArray.map(f => ({
          playgroundId: resolvedParams.id,
          name: f.name,
          path: f.path,
          content: f.content,
          isFolder: f.isFolder,
          // Store secure text mapping references
          parentId: f.parentId
        }))
      })
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("TRANSACTION_SYNC_CRASH:", error);
    return NextResponse.json({ error: "Atomic transactional database sync failure." }, { status: 500 });
  }
}