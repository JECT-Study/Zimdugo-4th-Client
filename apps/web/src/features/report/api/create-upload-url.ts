import { z } from "zod";
import type {
  RestResponse,
  UploadCreateData,
  UploadCreateRequest,
} from "#/features/report/model/report-types";
import { apiClient } from "#/shared/lib/apiClient";

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
  const response = await apiClient.post<RestResponse<UploadCreateData>>(
    "/api/v1/uploads",
    payload,
  );

  const parsed = uploadCreateDataSchema.safeParse(response.data.data);
  if (!parsed.success) {
    throw new InvalidUploadCreateResponseError();
  }

  return parsed.data;
}
