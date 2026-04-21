import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// Use UPLOAD_DIR env var; cwd fallback is evaluated lazily inside handler to avoid Turbopack NFT tracing
const UPLOAD_DIR_ENV = process.env.UPLOAD_DIR;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = UPLOAD_DIR_ENV ?? join(process.cwd(), "uploads");

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const results: { fileName: string; filePath: string; fileSize: number; mimeType: string }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.includes(".") ? "." + file.name.split(".").pop() : "";
      const uniqueName = `${randomUUID()}${ext}`;
      const filePath = join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);

      results.push({
        fileName: file.name,
        filePath: uniqueName,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
      });
    }

    return NextResponse.json(results, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
