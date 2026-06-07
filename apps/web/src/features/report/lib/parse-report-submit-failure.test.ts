import { describe, expect, it } from "vitest";
import { parseReportSubmitFailure } from "#/features/report/lib/parse-report-submit-failure";

describe("parseReportSubmitFailure", () => {
  it("400 validation 응답을 validation kind로 파싱한다", () => {
    const error = {
      response: {
        status: 400,
        data: {
          code: "VALIDATION_FAILED",
          message: "invalid",
          status: 400,
          timestamp: "2026-06-06T00:00:00Z",
          path: "/api/v1/locker-reports",
          traceId: "trace-1",
          validationErrors: [
            { field: "lockerType", message: "required", rejectedValue: null },
          ],
        },
      },
    };

    expect(parseReportSubmitFailure(error)).toEqual({
      kind: "validation",
      validationErrors: [
        { field: "lockerType", message: "required", rejectedValue: null },
      ],
    });
  });

  it("401 응답을 auth kind로 파싱한다", () => {
    expect(
      parseReportSubmitFailure({
        response: { status: 401, data: {} },
      }),
    ).toEqual({ kind: "auth" });
  });

  it("500·네트워크 오류를 server kind로 파싱한다", () => {
    expect(parseReportSubmitFailure(new Error("network"))).toEqual({
      kind: "server",
    });
  });
});
