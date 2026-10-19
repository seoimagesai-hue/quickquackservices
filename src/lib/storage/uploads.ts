/**
 * Object-storage gate for booking form file fields.
 * Configure S3-compatible credentials to enable uploads.
 * Binaries are never stored in MongoDB — only metadata keys.
 */
export function isObjectStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      (process.env.S3_ENDPOINT || process.env.AWS_REGION)
  );
}

export function uploadConfigStatus() {
  return {
    configured: isObjectStorageConfigured(),
    maxBytes: Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024),
    allowedTypes: (
      process.env.UPLOAD_ALLOWED_TYPES ||
      "image/jpeg,image/png,application/pdf"
    ).split(","),
    message: isObjectStorageConfigured()
      ? "Object storage ready"
      : "File uploads require S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_ENDPOINT or AWS_REGION.",
  };
}

/** Placeholder for signed URL generation once storage is wired. */
export async function createUploadIntent(params: {
  businessId: string;
  fieldId: string;
  fileName: string;
  contentType: string;
  size: number;
}): Promise<
  { ok: false; error: string } | { ok: true; uploadUrl: string; key: string }
> {
  if (!params.businessId || !params.fieldId || !params.fileName) {
    return { ok: false, error: "Missing upload metadata." };
  }
  if (!isObjectStorageConfigured()) {
    return {
      ok: false,
      error: uploadConfigStatus().message,
    };
  }
  return {
    ok: false,
    error:
      "Object storage credentials detected but signed-upload helper is not yet enabled in this environment. Contact the operator.",
  };
}
