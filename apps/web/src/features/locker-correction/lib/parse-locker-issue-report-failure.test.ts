import { describe, expect, it } from "vitest";

import { parseLockerIssueReportFailure } from "./parse-locker-issue-report-failure";

describe("parseLockerIssueReportFailure", () => {
  it("API 가 실제로 주는 상태 코드를 옮긴다", () => {
    expect(parseLockerIssueReportFailure({ response: { status: 404 } })).toBe(
      "not-found",
    );
    expect(parseLockerIssueReportFailure({ response: { status: 400 } })).toBe(
      "invalid",
    );
    expect(parseLockerIssueReportFailure({ response: { status: 500 } })).toBe(
      "server",
    );
  });

  it("응답 없는 네트워크 실패는 서버 실패로 본다", () => {
    expect(parseLockerIssueReportFailure(new Error("Network Error"))).toBe(
      "server",
    );
    expect(parseLockerIssueReportFailure(undefined)).toBe("server");
  });
});
