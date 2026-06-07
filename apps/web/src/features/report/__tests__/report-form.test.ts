import { describe, expect, it, vi } from "vitest";
import { normalizeReportPayload } from "#/features/report/lib/normalize-report-payload";
import { parseReportSubmitFailure } from "#/features/report/lib/parse-report-submit-failure";
import { collectErrorSectionIds, mergeErrorSectionIds } from "#/features/report/lib/report-field-errors";
import { applyValidationErrors } from "#/features/report/model/report-error-targets";
import { parseReportForm } from "#/features/report/model/report-schema";
import {
  type ReportFormValues,
  STEP_1_FIELDS,
  reportDefaultValues,
} from "#/features/report/model/report-types";

const validStep1Values = (): ReportFormValues => ({
  ...reportDefaultValues,
  roadAddress: "서울특별시 중구 세종대로 110",
  latitude: 37.5665,
  longitude: 126.978,
  indoorOutdoorType: "INDOOR",
  lockerType: "MUSEUM",
  hasFloor: false,
});

function hasStep1ValidationErrors(values: ReportFormValues): boolean {
  const parsed = parseReportForm(values);
  if (parsed.success) return false;

  return parsed.error.issues.some((issue) => {
    const field = issue.path[0];
    return (
      typeof field === "string" &&
      (STEP_1_FIELDS as readonly string[]).includes(field)
    );
  });
}

function hasStep1FieldErrors(
  errors: Record<string, { message?: string } | undefined>,
): boolean {
  return STEP_1_FIELDS.some((field) => Boolean(errors[field]));
}

describe("report form multi-step validation", () => {
  it("Step 1 필수값이 채워지면 Step 1 Zod 오류가 없다", () => {
    expect(hasStep1ValidationErrors(validStep1Values())).toBe(false);
  });

  it("Step 1 좌표가 없으면 Step 1 trigger가 실패한다", () => {
    const values = {
      ...validStep1Values(),
      latitude: null,
      longitude: null,
    };

    expect(hasStep1ValidationErrors(values)).toBe(true);
  });

  it("Step 2 제출 시 Step 1 오류가 있으면 Step 1 복귀 대상으로 분류된다", () => {
    const values = {
      ...validStep1Values(),
      locationConsentAgreed: true,
      additionalInfo: "3번 출구 앞",
      lockerType: null,
    };

    const parsed = parseReportForm(values);
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const step1Errors = parsed.error.issues.filter((issue) => {
      const field = issue.path[0];
      return (
        typeof field === "string" &&
        (STEP_1_FIELDS as readonly string[]).includes(field)
      );
    });

    expect(step1Errors.some((issue) => issue.path[0] === "lockerType")).toBe(
      true,
    );
    expect(values.additionalInfo).toBe("3번 출구 앞");
    expect(values.locationConsentAgreed).toBe(true);
  });

  it("Step 1 field 오류는 classification 등 섹션 id로 수집된다", () => {
    const sectionIds = collectErrorSectionIds({
      lockerType: { type: "custom", message: "required" },
    });

    expect(sectionIds).toContain("classification");
  });

  it("aggregate sectionServerErrors는 field error와 합쳐 scroll 대상을 만든다", () => {
    const sectionIds = mergeErrorSectionIds(
      {},
      { classification: "validation.invalid_enum" },
    );

    expect(sectionIds).toEqual(["classification"]);
  });

  it("Step 1 field 오류 존재 여부를 판별해 Step 2 유지/복귀를 결정한다", () => {
    expect(hasStep1FieldErrors({ lockerType: { message: "required" } })).toBe(
      true,
    );
    expect(
      hasStep1FieldErrors({ locationConsentAgreed: { message: "required" } }),
    ).toBe(false);
  });
});

describe("report form submit handling", () => {
  it("제출 payload는 imageUrl null을 유지한다", () => {
    const payload = normalizeReportPayload(validStep1Values());
    expect(payload.imageUrl).toBeNull();
  });

  it("API 400 lockerType 오류는 field setError 대상이다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    applyValidationErrors(
      [{ field: "lockerType", message: "required" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).toHaveBeenCalledWith("lockerType", {
      type: "server",
      message: "required",
    });
  });

  it("API 400 enumInputValid 오류는 classification sectionServerErrors로 저장한다", () => {
    const setError = vi.fn();
    const updates: Array<
      Partial<Record<string, string>>
    > = [];
    const setSectionServerErrors = vi.fn((updater) => {
      updates.push(updater({}));
    });

    applyValidationErrors(
      [{ field: "enumInputValid", message: "validation.invalid_enum" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(updates.at(-1)?.classification).toBe("validation.invalid_enum");
  });

  it("401 응답은 auth kind로 분류한다", () => {
    expect(
      parseReportSubmitFailure({
        response: { status: 401, data: {} },
      }),
    ).toEqual({ kind: "auth" });
  });

  it("500·네트워크 오류는 server kind로 분류한다", () => {
    expect(parseReportSubmitFailure(new Error("network"))).toEqual({
      kind: "server",
    });
  });
});
