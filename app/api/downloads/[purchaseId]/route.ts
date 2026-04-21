import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSignedUrl, verifySignedUrl, getFilePath } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> }
) {
  const { purchaseId } = await params;
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");

  // Signed URL path: verify signature and stream file
  if (fileId && expires && sig) {
    const valid = verifySignedUrl(purchaseId, fileId, expires, sig);
    if (!valid) {
      return new NextResponse("Invalid or expired download link", { status: 403 });
    }

    // Fetch purchase and file
    const purchase = await db.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    const productFile = await db.productFile.findUnique({
      where: { id: fileId },
    });

    if (!productFile || productFile.productId !== purchase.productId) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Increment download count
    await db.purchase.update({
      where: { id: purchaseId },
      data: { downloadCount: { increment: 1 } },
    });

    // Stream the file
    const absolutePath = getFilePath(productFile.filePath);

    if (!fs.existsSync(absolutePath)) {
      return new NextResponse("File not found on server", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": productFile.mimeType,
        "Content-Disposition": `attachment; filename="${productFile.fileName}"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  }

  // Auth-protected path: verify ownership, generate signed URL redirect
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!fileId) {
    return new NextResponse("fileId is required", { status: 400 });
  }

  const purchase = await db.purchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase || purchase.userId !== session.user.id) {
    return new NextResponse("Purchase not found", { status: 404 });
  }

  if (purchase.status !== "COMPLETED") {
    return new NextResponse("Purchase is not completed", { status: 403 });
  }

  if (purchase.downloadCount >= purchase.maxDownloads) {
    return new NextResponse("Download limit reached", { status: 403 });
  }

  const productFile = await db.productFile.findUnique({
    where: { id: fileId },
  });

  if (!productFile || productFile.productId !== purchase.productId) {
    return new NextResponse("File not found", { status: 404 });
  }

  const signedUrl = generateSignedUrl(purchaseId, fileId);
  return NextResponse.redirect(new URL(signedUrl, request.url));
}
