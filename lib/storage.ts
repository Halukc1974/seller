import crypto from "crypto";
import path from "path";
import fs from "fs";

const SECRET = process.env.SIGNED_URL_SECRET || "dev-secret";
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

export function generateSignedUrl(purchaseId: string, fileId: string, expiresInSeconds = 3600): string {
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${purchaseId}:${fileId}:${expires}`;
  const signature = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `/api/downloads/${purchaseId}?fileId=${fileId}&expires=${expires}&sig=${signature}`;
}

export function verifySignedUrl(purchaseId: string, fileId: string, expires: string, signature: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (parseInt(expires) < now) return false;
  const payload = `${purchaseId}:${fileId}:${expires}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function generateLicenseKey(): string {
  return Array.from({ length: 4 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  ).join("-");
}

export function getFilePath(relativePath: string): string {
  return path.resolve(UPLOAD_DIR, relativePath);
}
