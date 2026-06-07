export type UploadFileToPresignedUrlParams = {
  uploadUrl: string;
  file: File;
  contentType: string;
};

export class PresignedUploadError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`S3 upload failed with status ${status}`);
    this.name = "PresignedUploadError";
    this.status = status;
  }
}

export class UntrustedPresignedUploadUrlError extends Error {
  constructor() {
    super("Untrusted presigned upload URL");
    this.name = "UntrustedPresignedUploadUrlError";
  }
}

const TRUSTED_S3_HOST_PATTERN =
  /^(?:[a-z0-9-]+(?:\.[a-z0-9-]+)*\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com|s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com)$/i;

export function assertTrustedPresignedUploadUrl(uploadUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(uploadUrl);
  } catch {
    throw new UntrustedPresignedUploadUrlError();
  }

  if (parsed.protocol !== "https:") {
    throw new UntrustedPresignedUploadUrlError();
  }

  if (!TRUSTED_S3_HOST_PATTERN.test(parsed.hostname.toLowerCase())) {
    throw new UntrustedPresignedUploadUrlError();
  }
}

export async function uploadFileToPresignedUrl({
  uploadUrl,
  file,
  contentType,
}: UploadFileToPresignedUrlParams): Promise<void> {
  assertTrustedPresignedUploadUrl(uploadUrl);

  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    credentials: "omit",
    mode: "cors",
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new PresignedUploadError(response.status);
  }
}
