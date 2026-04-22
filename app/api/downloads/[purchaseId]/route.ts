import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { presignDownloadUrl } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  const { purchaseId } = await params;
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

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

  await db.purchase.update({
    where: { id: purchaseId },
    data: { downloadCount: { increment: 1 } },
  });

  const signedUrl = await presignDownloadUrl(productFile.filePath, productFile.fileName);
  return NextResponse.redirect(signedUrl, { status: 302 });
}
