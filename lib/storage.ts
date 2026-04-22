import crypto from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_ENDPOINT =
  process.env.R2_ENDPOINT ||
  (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;
  if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ENDPOINT || !R2_BUCKET) {
    throw new Error(
      "R2 storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET.",
    );
  }
  _client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
  return _client;
}

export interface R2UploadInput {
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}

export async function putObject({ key, body, contentType }: R2UploadInput): Promise<void> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET!,
      Key: key,
    }),
  );
}

export async function presignDownloadUrl(
  key: string,
  downloadFileName: string,
  expiresInSeconds = 900,
): Promise<string> {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET!,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${sanitizeHeaderValue(downloadFileName)}"`,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export function buildProductFileKey(userId: string, originalFileName: string): string {
  const ext = originalFileName.includes(".")
    ? "." + originalFileName.split(".").pop()!.toLowerCase()
    : "";
  return `products/${userId}/${crypto.randomUUID()}${ext}`;
}

export function generateLicenseKey(): string {
  return Array.from({ length: 4 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase(),
  ).join("-");
}

function sanitizeHeaderValue(value: string): string {
  return value.replace(/["\\\r\n]/g, "_");
}
