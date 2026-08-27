import type {
  LockerReportCreateRequest,
  LockerReportCreateResponse,
  RestResponse,
} from "#/features/report/model/report-types";
import { httpPost } from "#/shared/lib/apiClient";

export async function postLockerReport(
  payload: LockerReportCreateRequest,
): Promise<RestResponse<LockerReportCreateResponse>> {
  return httpPost<
    RestResponse<LockerReportCreateResponse>,
    LockerReportCreateRequest
  >("/api/v1/locker-reports", payload);
}
