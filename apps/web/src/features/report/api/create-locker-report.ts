import { apiClient } from "#/shared/lib/apiClient";
import type {
  LockerReportCreateRequest,
  LockerReportCreateResponse,
  RestResponse,
} from "#/features/report/model/report-types";

export async function postLockerReport(
  payload: LockerReportCreateRequest,
  { userId }: { userId: number },
): Promise<RestResponse<LockerReportCreateResponse>> {
  const response = await apiClient.post<
    RestResponse<LockerReportCreateResponse>
  >("/api/v1/locker-reports", payload, {
    params: { userId },
  });

  return response.data;
}
