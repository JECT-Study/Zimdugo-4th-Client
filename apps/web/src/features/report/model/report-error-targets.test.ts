import { describe, expect, it, vi } from "vitest";
import {
  applyClientValidationIssues,
  applyValidationErrors,
  getEarliestStep,
  resolveValidationErrorTarget,
  toClientValidationIssues,
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

describe("toClientValidationIssues", () => {
  it("Zod issue path에서 string·number 세그먼트만 유지한다", () => {
    expect(
      toClientValidationIssues([
        { path: ["lockerType", Symbol("x")], message: "required" },
      ]),
    ).toEqual([{ path: ["lockerType"], message: "required" }]);
  });
});

describe("applyClientValidationIssues", () => {
  it("Zod field 오류를 sectionServerErrors와 setError에 반영한다", () => {
    const setError = vi.fn();
    const updates: Array<Partial<Record<string, string>>> = [];
    const setSectionServerErrors = vi.fn((updater) => {
      updates.push(updater({}));
    });

    const sectionIds = applyClientValidationIssues(
      [{ path: ["endTime"], message: "invalid_range" }],
      { setError, setSectionServerErrors },
      { step: 2 },
    );

    expect(setError).toHaveBeenCalledWith("endTime", {
      type: "custom",
      message: "invalid_range",
    });
    expect(updates.at(-1)?.time).toBe("invalid_range");
    expect(sectionIds).toEqual(["time"]);
  });

  it("step 필터로 해당 단계 오류만 반영한다", () => {
    const setError = vi.fn();
    const updates: Array<Partial<Record<string, string>>> = [];
    const setSectionServerErrors = vi.fn((updater) => {
      updates.push(updater({}));
    });

    applyClientValidationIssues(
      [
        { path: ["lockerType"], message: "required" },
        { path: ["endTime"], message: "invalid_range" },
      ],
      { setError, setSectionServerErrors },
      { step: 1 },
    );

    expect(setError).toHaveBeenCalledWith("lockerType", {
      type: "custom",
      message: "required",
    });
    expect(setError).not.toHaveBeenCalledWith("endTime", expect.anything());
    expect(updates.at(-1)).toEqual({ classification: "required" });
  });
});
