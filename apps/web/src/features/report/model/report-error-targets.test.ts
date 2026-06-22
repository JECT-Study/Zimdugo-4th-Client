import { describe, expect, it, vi } from "vitest";
import {
  applyClientValidationIssues,
  applyValidationErrors,
  getEarliestSectionId,
  getEarliestStep,
  normalizeServerValidationMessage,
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

describe("getEarliestSectionId", () => {
  it("mixed step 오류에서 earliestStep 기준 REPORT_SECTION_ORDER를 따른다", () => {
    const targets = [
      resolveValidationErrorTarget("minPrice"),
      resolveValidationErrorTarget("lockerType"),
    ];

    expect(getEarliestSectionId(targets, getEarliestStep(targets))).toBe(
      "classification",
    );
  });
});

describe("normalizeServerValidationMessage", () => {
  it("위치 field의 required는 invalid_location으로 바꾼다", () => {
    expect(normalizeServerValidationMessage("roadAddress", "required")).toBe(
      "validation.invalid_location",
    );
  });

  it("additionalInfo의 required는 prohibited_word로 바꾼다", () => {
    expect(normalizeServerValidationMessage("additionalInfo", "required")).toBe(
      "validation.prohibited_word",
    );
  });

  it("locationConsentAgreed 오류는 UI에 반영하지 않는다", () => {
    expect(
      normalizeServerValidationMessage("locationConsentAgreed", "required"),
    ).toBeNull();
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
    expect(setSectionServerErrors).toHaveBeenCalledWith({});
    expect(setSectionServerErrors).toHaveBeenCalledTimes(1);
  });

  it("aggregate field는 sectionServerErrors를 교체한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    applyValidationErrors(
      [{ field: "enumInputValid", message: "validation.invalid_enum" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setSectionServerErrors).toHaveBeenCalledWith({});
    expect(setSectionServerErrors).toHaveBeenCalledWith({
      classification: "validation.invalid_enum",
    });
  });

  it("roadAddress required는 invalid_location으로 setError한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    applyValidationErrors([{ field: "roadAddress", message: "required" }], {
      setError,
      setSectionServerErrors,
    });

    expect(setError).toHaveBeenCalledWith("roadAddress", {
      type: "server",
      message: "validation.invalid_location",
    });
  });

  it("locationConsentAgreed만 오면 agreementConsentRequired와 agreement scroll 대상을 반환한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    const result = applyValidationErrors(
      [{ field: "locationConsentAgreed", message: "required" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setSectionServerErrors).toHaveBeenCalledWith({});
    expect(result.agreementConsentRequired).toBe(true);
    expect(result.firstSectionId).toBe("agreement");
    expect(result.firstMessage).toBeNull();
    expect(result.earliestStep).toBeNull();
  });

  it("step 1·2 혼합 서버 오류에서 firstSectionId는 step 1 섹션 순서를 따른다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    const result = applyValidationErrors(
      [
        { field: "minPrice", message: "required" },
        { field: "lockerType", message: "required" },
      ],
      { setError, setSectionServerErrors },
    );

    expect(result.earliestStep).toBe(1);
    expect(result.firstSectionId).toBe("classification");
    expect(result.firstMessage).toBe("required");
  });

  it("aggregate validation의 첫 메시지를 popup에서 재사용할 수 있도록 반환한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    const result = applyValidationErrors(
      [
        { field: "floorInputValid", message: "validation.invalid_floor" },
        { field: "priceInputValid", message: "validation.invalid_price" },
      ],
      { setError, setSectionServerErrors },
    );

    expect(result.firstSectionId).toBe("floor");
    expect(result.firstMessage).toBe("validation.invalid_floor");
  });

  it("unknown field는 setError·section 갱신 없이 hasUnknown을 true로 반환한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

    const result = applyValidationErrors(
      [{ field: "request", message: "invalid" }],
      { setError, setSectionServerErrors },
    );

    expect(setError).not.toHaveBeenCalled();
    expect(setSectionServerErrors).toHaveBeenCalledWith({});
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
    const setSectionServerErrors = vi.fn();

    const sectionIds = applyClientValidationIssues(
      [{ path: ["endTime"], message: "invalid_range" }],
      { setError, setSectionServerErrors },
      { step: 2 },
    );

    expect(setError).toHaveBeenCalledWith("endTime", {
      type: "custom",
      message: "invalid_range",
    });
    expect(setSectionServerErrors).toHaveBeenCalledWith({
      time: "invalid_range",
    });
    expect(sectionIds).toEqual(["time"]);
  });

  it("step 필터로 해당 단계 오류만 반영한다", () => {
    const setError = vi.fn();
    const setSectionServerErrors = vi.fn();

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
    expect(setSectionServerErrors).toHaveBeenCalledWith({
      classification: "required",
    });
  });
});
