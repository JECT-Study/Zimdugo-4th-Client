import { z } from "zod";
import { httpPost } from "#/shared/lib/apiClient";
import type {
  UploadCreateData,
  UploadCreateRequest,
} from "#/shared/model/upload-types";

interface RestResponse<T> {
  data: T;
}

const uploadCreateDataSchema = z.object({
  uploadUrl: z.string().url(),
  fileUrl: z.string().url(),
  key: z.string().min(1),
  expiresAt: z.string().min(1),
});

export class InvalidUploadCreateResponseError extends Error {
  constructor() {
    super("Invalid upload create response");
    this.name = "InvalidUploadCreateResponseError";
  }
}

export async function postUploadUrl(
  payload: UploadCreateRequest,
): Promise<UploadCreateData> {
  const response = await httpPost<
    RestResponse<UploadCreateData>,
    UploadCreateRequest
  >("/api/v1/uploads", payload);

  const parsed = uploadCreateDataSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new InvalidUploadCreateResponseError();
  }

  return parsed.data;
}
