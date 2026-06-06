import { describe, expect, it } from "vitest";
import { getReportValidationMessage } from "./report-validation-message";

describe("getReportValidationMessage", () => {
  it("알려진 검증 코드는 사용자 메시지로 변환한다", () => {
    expect(getReportValidationMessage("invalid_range")).not.toBe("invalid_range");
    expect(getReportValidationMessage("pair_required")).not.toBe("pair_required");
    expect(getReportValidationMessage("required")).not.toBe("required");
  });

  it("서버 메시지는 그대로 반환한다", () => {
    expect(getReportValidationMessage("validation.invalid_enum")).toBe(
      "validation.invalid_enum",
    );
  });
});
