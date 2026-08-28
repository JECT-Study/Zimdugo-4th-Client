import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  postLockerIssueReport,
  toLockerIssueReportRequest,
} from "#/features/locker-correction/api/create-locker-issue-report";
import { LOCKER_CORRECTION_REASON } from "#/features/locker-correction/model/locker-correction-types";
import { httpPost } from "#/shared/lib/apiClient";

vi.mock("#/shared/lib/apiClient", () => ({
  httpPost: vi.fn(),
}));

const postMock = httpPost as unknown as ReturnType<typeof vi.fn>;

describe("toLockerIssueReportRequest", () => {
  it("클라이언트 신고 사유를 서버 요청 형식으로 변환한다", () => {
    expect(
      toLockerIssueReportRequest({
        reason: LOCKER_CORRECTION_REASON.WrongOperatingHours,
        details: "오전 9시에 열지 않아요.",
      }),
    ).toEqual({
      reportType: "OPERATING_HOURS_ERROR",
      detail: "오전 9시에 열지 않아요.",
    });
  });
});

describe("postLockerIssueReport", () => {
  beforeEach(() => {
    postMock.mockReset();
  });

  it("보관함 ID를 포함한 신고 생성 요청을 보낸다", async () => {
    postMock.mockResolvedValue({
      code: "S200",
      message: "common.ok",
      status: 200,
      timestamp: "2026-08-28T00:00:00",
      data: { reportId: 1, createdAt: "2026-08-28T00:00:00" },
    });

    await postLockerIssueReport(123, {
      reportType: "WRONG_LOCATION",
      detail: null,
    });

    expect(httpPost).toHaveBeenCalledWith("/api/v1/lockers/123/issue-reports", {
      reportType: "WRONG_LOCATION",
      detail: null,
    });
  });
});
