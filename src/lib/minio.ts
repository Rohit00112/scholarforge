import { S3Client } from "@aws-sdk/client-s3";

export const minio = new S3Client({
  region: process.env.MINIO_REGION ?? "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT,          // http://minio:9000 in docker
  forcePathStyle: true,                          // REQUIRED for MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || "scholarforge",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "scholarforge-minio",
  },
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "scholarforge";

export function publicObjectUrl(key: string): string {
  if (!key) return "";
  const base = (process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT ?? "http://localhost:9000").replace(/\/$/, "");
  if (key.startsWith("http")) return key; // already a valid url
  return `${base}/${MINIO_BUCKET}/${key}`;
}
