import { describe, expect, it } from "vitest";

import { parseLockerIssueReportFailure } from "./parse-locker-issue-report-failure";

describe("parseLockerIssueReportFailure", () => {
  it("maps status codes the API actually returns", () => {
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

  it("treats a network failure without a response as a server failure", () => {
    expect(parseLockerIssueReportFailure(new Error("Network Error"))).toBe(
      "server",
    );
    expect(parseLockerIssueReportFailure(undefined)).toBe("server");
  });
});
