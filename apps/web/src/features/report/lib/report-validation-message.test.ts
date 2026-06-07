import { describe, expect, it } from "vitest";
import { getReportValidationMessage } from "./report-validation-message";

describe("getReportValidationMessage", () => {
  it("알려진 검증 코드는 사용자 메시지로 변환한다", () => {
    expect(getReportValidationMessage("invalid_range")).not.toBe("invalid_range");
    expect(getReportValidationMessage("pair_required")).not.toBe("pair_required");
    expect(getReportValidationMessage("required")).not.toBe("required");
  });

  it("서버 validation.* 키는 사용자 메시지로 변환한다", () => {
    expect(getReportValidationMessage("validation.invalid_enum")).not.toBe(
      "validation.invalid_enum",
    );
    expect(getReportValidationMessage("validation.invalid_enum_value")).not.toBe(
      "validation.invalid_enum_value",
    );
    expect(
      getReportValidationMessage("validation.invalid_operating_hours"),
    ).not.toBe("validation.invalid_operating_hours");
    expect(getReportValidationMessage("validation.invalid_location")).not.toBe(
      "validation.invalid_location",
    );
    expect(getReportValidationMessage("validation.prohibited_word")).not.toBe(
      "validation.prohibited_word",
    );
  });

  it("BE enum 키 alias는 동일한 사용자 메시지로 변환한다", () => {
    const fromLegacyKey = getReportValidationMessage("validation.invalid_enum");
    const fromBeKey = getReportValidationMessage(
      "validation.invalid_enum_value",
    );

    expect(fromLegacyKey).toBe(fromBeKey);
    expect(fromLegacyKey).not.toBe("validation.invalid_enum");
  });

  it("매핑되지 않은 서버 메시지는 raw fallback으로 그대로 반환한다", () => {
    expect(getReportValidationMessage("비어 있을 수 없습니다")).toBe(
      "비어 있을 수 없습니다",
    );
    expect(getReportValidationMessage("validation.unknown_key")).toBe(
      "validation.unknown_key",
    );
    expect(getReportValidationMessage(" must not be blank ")).toBe(
      "must not be blank",
    );
  });
});
