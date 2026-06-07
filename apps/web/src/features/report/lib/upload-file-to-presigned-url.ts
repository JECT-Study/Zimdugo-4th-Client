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

export async function uploadFileToPresignedUrl({
  uploadUrl,
  file,
  contentType,
}: UploadFileToPresignedUrlParams): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new PresignedUploadError(response.status);
  }
}
