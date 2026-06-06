import { describe, expect, it, vi } from "vitest";
import {
  applyValidationErrors,
  getEarliestStep,
  resolveValidationErrorTarget,
} from "#/features/report/model/report-error-targets";

describe("resolveValidationErrorTarget", () => {
  it("lockerType은 classification 섹션 step 1 field 오류로 매핑한다", () => {
    expect(resolveValidationErrorTarget("lockerType")).toEqual({
      kind: "field",
      field: "lockerType",
      sectionId: "classification",
      step: 1,
      anchorField: "lockerType",
    });
  });

  it("enumInputValid는 classification 섹션 step 1 aggregate 오류로 매핑한다", () => {
    expect(resolveValidationErrorTarget("enumInputValid")).toEqual({
      kind: "aggregate",
      field: "enumInputValid",
      sectionId: "classification",
      step: 1,
      anchorField: null,
    });
  });

  it("floorInputValid는 floor 섹션 aggregate 오류로 매핑한다", () => {
    expect(resolveValidationErrorTarget("floorInputValid").kind).toBe(
      "aggregate",
    );
    expect(resolveValidationErrorTarget("floorInputValid").sectionId).toBe(
      "floor",
    );
  });

  it("priceInputValid는 price 섹션 aggregate 오류로 매핑한다", () => {
    expect(resolveValidationErrorTarget("priceInputValid").sectionId).toBe(
      "price",
    );
  });

  it("operatingHoursValid는 time 섹션 aggregate 오류로 매핑한다", () => {
    expect(resolveValidationErrorTarget("operatingHoursValid").sectionId).toBe(
      "time",
    );
  });

  it("sizeTypesValid는 size 섹션 aggregate 오류로 매핑한다", () => {
    expect(resolveValidationErrorTarget("sizeTypesValid").sectionId).toBe(
      "size",
    );
  });

  it("알 수 없는 field는 unknown으로 매핑한다", () => {
    expect(resolveValidationErrorTarget("request")).toEqual({
      kind: "unknown",
      field: "request",
      sectionId: null,
      step: null,
      anchorField: null,
    });
  });
});

describe("getEarliestStep", () => {
  it("step 1과 step 2 오류가 섞이면 1을 반환한다", () => {
    const step = getEarliestStep([
      resolveValidationErrorTarget("lockerType"),
      resolveValidationErrorTarget("minPrice"),
    ]);
    expect(step).toBe(1);
  });

  it("step 2 오류만 있으면 2를 반환한다", () => {
    const step = getEarliestStep([
      resolveValidationErrorTarget("minPrice"),
      resolveValidationErrorTarget("operatingHoursValid"),
    ]);
    expect(step).toBe(2);
  });
});

describe("applyValidationErrors", () => {
  it("일반 field는 setError를 호출한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    applyValidationErrors(
      [{ field: "lockerType", message: "비어 있을 수 없습니다" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).toHaveBeenCalledWith("lockerType", {
      type: "server",
      message: "비어 있을 수 없습니다",
    });
    expect(setSectionServerErrors).not.toHaveBeenCalled();
  });

  it("aggregate field는 sectionServerErrors를 갱신한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn((updater) =>
      updater({ classification: "old" }),
    );

    applyValidationErrors(
      [{ field: "enumInputValid", message: "validation.invalid_enum" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setSectionServerErrors).toHaveBeenCalled();
  });

  it("unknown field는 setError·section 갱신 없이 hasUnknown을 true로 반환한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    const result = applyValidationErrors(
      [{ field: "request", message: "invalid" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setSectionServerErrors).not.toHaveBeenCalled();
    expect(result.hasUnknown).toBe(true);
  });
});
