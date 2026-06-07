import type {
  RestResponse,
  UploadCreateData,
  UploadCreateRequest,
} from "#/features/report/model/report-types";
import { apiClient } from "#/shared/lib/apiClient";

export async function createUploadUrl(
  payload: UploadCreateRequest,
): Promise<UploadCreateData> {
  const response = await apiClient.post<RestResponse<UploadCreateData>>(
    "/api/v1/uploads",
    payload,
  );

  return response.data.data;
}
