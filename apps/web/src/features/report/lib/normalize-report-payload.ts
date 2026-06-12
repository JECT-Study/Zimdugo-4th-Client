import { sortSizeTypes } from "#/entities/locker/lib/sort-size-types";
import { parseReportForm } from "#/features/report/model/report-schema";
import type {
  LockerReportCreateRequest,
  ReportFormValues,
} from "#/features/report/model/report-types";

const FLOOR_VALIDATION_FIELDS = new Set([
  "hasFloor",
  "floorType",
  "floorNumber",
]);
const ENUM_VALIDATION_FIELDS = new Set(["indoorOutdoorType", "lockerType"]);
const PRICE_VALIDATION_FIELDS = new Set(["isFree", "minPrice", "maxPrice"]);
const OPERATING_HOURS_VALIDATION_FIELDS = new Set(["startTime", "endTime"]);
const SIZE_TYPES_VALIDATION_FIELDS = new Set(["sizeTypes"]);

const hasValidationIssue = (
  invalidFields: Set<string>,
  fields: Set<string>,
): boolean => invalidFields.has("__root__") || [...fields].some((field) => invalidFields.has(field));

export const deriveReportValidationFlags = (values: ReportFormValues) => {
  const parsed = parseReportForm(values);

  if (parsed.success) {
    return {
      floorInputValid: true,
      enumInputValid: true,
      priceInputValid: true,
      operatingHoursValid: true,
      sizeTypesValid: true,
    };
  }

  const invalidFields = new Set(
    parsed.error.issues.map((issue) => String(issue.path[0] ?? "__root__")),
  );

  return {
    floorInputValid: !hasValidationIssue(invalidFields, FLOOR_VALIDATION_FIELDS),
    enumInputValid: !hasValidationIssue(invalidFields, ENUM_VALIDATION_FIELDS),
    priceInputValid: !hasValidationIssue(invalidFields, PRICE_VALIDATION_FIELDS),
    operatingHoursValid: !hasValidationIssue(
      invalidFields,
      OPERATING_HOURS_VALIDATION_FIELDS,
    ),
    sizeTypesValid: !hasValidationIssue(
      invalidFields,
      SIZE_TYPES_VALIDATION_FIELDS,
    ),
  };
};

/**
 * 폼 값 → API body. enum 재매핑 없음 — 구조 정리만 수행.
 * @see docs/features/ep-02-report.md §11
 */
export function normalizeReportPayload(
  values: ReportFormValues,
): LockerReportCreateRequest {
  const hasFloor = values.hasFloor === true;

  const floorType = hasFloor ? values.floorType : null;
  const floorNumber = hasFloor ? values.floorNumber : null;

  let minPrice = values.minPrice;
  let maxPrice = values.maxPrice;
  if (values.isFree !== false) {
    minPrice = null;
    maxPrice = null;
  }

  return {
    ...values,
    sizeTypes: sortSizeTypes(values.sizeTypes),
    roadAddress: values.roadAddress.trim(),
    hasFloor,
    floorType,
    floorNumber,
    minPrice,
    maxPrice,
    additionalInfo: values.additionalInfo.trim(),
    imageUrl: values.imageUrl,
    ...deriveReportValidationFlags({
      ...values,
      hasFloor,
      floorType,
      floorNumber,
      minPrice,
      maxPrice,
    }),
  };
}
