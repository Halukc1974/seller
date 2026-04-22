import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildProductFileKey, putObject } from "@/lib/storage";

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

    const results: { fileName: string; filePath: string; fileSize: number; mimeType: string }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const key = buildProductFileKey(session.user.id, file.name);
      const contentType = file.type || "application/octet-stream";

      await putObject({ key, body: buffer, contentType });

      results.push({
        fileName: file.name,
        filePath: key,
        fileSize: file.size,
        mimeType: contentType,
      });
    }

    return NextResponse.json(results, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
