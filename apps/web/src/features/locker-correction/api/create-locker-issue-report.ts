import type { LockerCorrectionRequest } from "#/features/locker-correction/model/locker-correction-types";
import { httpPost } from "#/shared/lib/apiClient";

type LockerIssueReportType =
  | "PRICE_ERROR"
  | "NO_LONGER_OPERATING"
  | "SIZE_ERROR"
  | "OPERATING_HOURS_ERROR"
  | "WRONG_LOCATION"
  | "IMAGE_ERROR"
  | "CATEGORY_ERROR"
  | "OTHER";

export interface LockerIssueReportCreateRequest {
  reportType: LockerIssueReportType;
  detail: string | null;
}

export interface LockerIssueReportCreateResponse {
  reportId: number;
  createdAt: string;
}

interface RestResponse<T> {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  data: T;
}

const REPORT_TYPE_BY_REASON = {
  CLOSED: "NO_LONGER_OPERATING",
  WRONG_LOCATION: "WRONG_LOCATION",
  WRONG_OPERATING_HOURS: "OPERATING_HOURS_ERROR",
  MISSING_SIZE: "SIZE_ERROR",
  WRONG_PHOTO: "IMAGE_ERROR",
  WRONG_PRICE: "PRICE_ERROR",
  OTHER: "OTHER",
} as const satisfies Record<
  LockerCorrectionRequest["reason"],
  LockerIssueReportType
>;

export const toLockerIssueReportRequest = ({
  reason,
  details,
}: LockerCorrectionRequest): LockerIssueReportCreateRequest => ({
  reportType: REPORT_TYPE_BY_REASON[reason],
  detail: details,
});

export async function postLockerIssueReport(
  lockerId: number,
  payload: LockerIssueReportCreateRequest,
): Promise<RestResponse<LockerIssueReportCreateResponse>> {
  return httpPost<
    RestResponse<LockerIssueReportCreateResponse>,
    LockerIssueReportCreateRequest
  >(`/api/v1/lockers/${lockerId}/issue-reports`, payload);
}
