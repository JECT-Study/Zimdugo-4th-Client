import {
  AGGREGATE_VALIDATION_FIELDS,
  type AggregateValidationField,
  type ReportFormValues,
  type ReportSectionId,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from "./report-types";

export type ValidationErrorTargetKind = "field" | "aggregate" | "unknown";

export type ValidationErrorTarget = {
  kind: ValidationErrorTargetKind;
  field: string;
  sectionId: ReportSectionId | null;
  step: 1 | 2 | null;
  /** RHF setError 대상. aggregate·unknown은 null */
  anchorField: keyof ReportFormValues | null;
};

const AGGREGATE_FIELD_SET = new Set<string>(AGGREGATE_VALIDATION_FIELDS);

const FIELD_TARGETS: Record<
  string,
  Omit<ValidationErrorTarget, "field" | "kind">
> = {
  roadAddress: { sectionId: "location", step: 1, anchorField: "roadAddress" },
  latitude: { sectionId: "location", step: 1, anchorField: "latitude" },
  longitude: { sectionId: "location", step: 1, anchorField: "longitude" },
  indoorOutdoorType: {
    sectionId: "classification",
    step: 1,
    anchorField: "indoorOutdoorType",
  },
  lockerType: {
    sectionId: "classification",
    step: 1,
    anchorField: "lockerType",
  },
  enumInputValid: {
    sectionId: "classification",
    step: 1,
    anchorField: null,
  },
  hasFloor: { sectionId: "floor", step: 1, anchorField: "hasFloor" },
  floorType: { sectionId: "floor", step: 1, anchorField: "floorType" },
  floorNumber: { sectionId: "floor", step: 1, anchorField: "floorNumber" },
  floorInputValid: { sectionId: "floor", step: 1, anchorField: null },
  sizeTypes: { sectionId: "size", step: 1, anchorField: "sizeTypes" },
  sizeTypesValid: { sectionId: "size", step: 1, anchorField: null },
  locationConsentAgreed: {
    sectionId: "agreement",
    step: 2,
    anchorField: "locationConsentAgreed",
  },
  isFree: { sectionId: "price", step: 2, anchorField: "isFree" },
  minPrice: { sectionId: "price", step: 2, anchorField: "minPrice" },
  maxPrice: { sectionId: "price", step: 2, anchorField: "maxPrice" },
  priceInputValid: { sectionId: "price", step: 2, anchorField: null },
  startTime: { sectionId: "time", step: 2, anchorField: "startTime" },
  endTime: { sectionId: "time", step: 2, anchorField: "endTime" },
  operatingHoursValid: { sectionId: "time", step: 2, anchorField: null },
  additionalInfo: {
    sectionId: "additionalInfo",
    step: 2,
    anchorField: "additionalInfo",
  },
  imageUrl: { sectionId: "photo", step: 2, anchorField: null },
};

export function resolveValidationErrorTarget(
  field: string,
): ValidationErrorTarget {
  const mapped = FIELD_TARGETS[field];
  if (!mapped) {
    return {
      kind: "unknown",
      field,
      sectionId: null,
      step: null,
      anchorField: null,
    };
  }

  const kind: ValidationErrorTargetKind = AGGREGATE_FIELD_SET.has(
    field as AggregateValidationField,
  )
    ? "aggregate"
    : "field";

  return {
    kind,
    field,
    ...mapped,
  };
}

export function getEarliestStep(
  targets: ValidationErrorTarget[],
): 1 | 2 | null {
  const steps = targets
    .map((t) => t.step)
    .filter((step): step is 1 | 2 => step !== null);

  if (steps.length === 0) return null;
  return steps.includes(1) ? 1 : 2;
}

export type ValidationErrorItem = {
  field: string;
  message: string;
};

export type ApplyValidationErrorsParams = {
  setError: (
    name: keyof ReportFormValues,
    error: { type: string; message: string },
  ) => void;
  setSectionServerErrors: (
    updater: (
      prev: Partial<Record<ReportSectionId, string>>,
    ) => Partial<Record<ReportSectionId, string>>,
  ) => void;
};

export type ApplyValidationErrorsResult = {
  targets: ValidationErrorTarget[];
  earliestStep: 1 | 2 | null;
  hasUnknown: boolean;
  firstSectionId: ReportSectionId | null;
};

export function applyValidationErrors(
  errors: ValidationErrorItem[],
  { setError, setSectionServerErrors }: ApplyValidationErrorsParams,
): ApplyValidationErrorsResult {
  const targets = errors.map((e) => resolveValidationErrorTarget(e.field));
  const sectionUpdates: Partial<Record<ReportSectionId, string>> = {};

  for (const item of errors) {
    const target = resolveValidationErrorTarget(item.field);

    if (target.kind === "unknown") continue;

    if (target.kind === "aggregate" && target.sectionId) {
      sectionUpdates[target.sectionId] = item.message;
      continue;
    }

    if (target.anchorField) {
      setError(target.anchorField, { type: "server", message: item.message });
      continue;
    }

    if (target.sectionId) {
      sectionUpdates[target.sectionId] = item.message;
    }
  }

  if (Object.keys(sectionUpdates).length > 0) {
    setSectionServerErrors((prev) => ({ ...prev, ...sectionUpdates }));
  }

  const earliestStep = getEarliestStep(targets);
  const hasUnknown = targets.some((t) => t.kind === "unknown");
  const firstSectionId =
    targets.find((t) => t.sectionId !== null)?.sectionId ?? null;

  return { targets, earliestStep, hasUnknown, firstSectionId };
}

export function isStep1Field(
  field: keyof ReportFormValues,
): field is (typeof STEP_1_FIELDS)[number] {
  return (STEP_1_FIELDS as readonly string[]).includes(field);
}

export function isStep2Field(
  field: keyof ReportFormValues,
): field is (typeof STEP_2_FIELDS)[number] {
  return (STEP_2_FIELDS as readonly string[]).includes(field);
}

export type ClientValidationIssue = {
  path: (string | number)[];
  message: string;
};

export function toClientValidationIssues(
  issues: Array<{ path: PropertyKey[]; message: string }>,
): ClientValidationIssue[] {
  return issues.map((issue) => ({
    path: issue.path.filter(
      (segment): segment is string | number =>
        typeof segment === "string" || typeof segment === "number",
    ),
    message: issue.message,
  }));
}

export function getSectionAnchorFields(
  sectionId: ReportSectionId,
): Array<keyof ReportFormValues> {
  return Object.entries(FIELD_TARGETS)
    .filter(([, target]) => target.sectionId === sectionId && target.anchorField)
    .map(([, target]) => target.anchorField as keyof ReportFormValues);
}

/** Zod 클라이언트 검증 오류를 섹션 UI + RHF field error로 반영한다. */
export function applyClientValidationIssues(
  issues: ClientValidationIssue[],
  { setError, setSectionServerErrors }: ApplyValidationErrorsParams,
  options?: { step?: 1 | 2 },
): ReportSectionId[] {
  const sectionUpdates: Partial<Record<ReportSectionId, string>> = {};
  const sectionOrder: ReportSectionId[] = [];

  for (const issue of issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;

    const target = resolveValidationErrorTarget(field);
    if (options?.step && target.step !== options.step) continue;
    if (!target.sectionId) continue;

    if (target.anchorField) {
      setError(target.anchorField, {
        type: "custom",
        message: issue.message,
      });
    }

    if (!sectionUpdates[target.sectionId]) {
      sectionUpdates[target.sectionId] = issue.message;
      sectionOrder.push(target.sectionId);
    }
  }

  if (Object.keys(sectionUpdates).length > 0) {
    setSectionServerErrors((prev) => ({ ...prev, ...sectionUpdates }));
  }

  return sectionOrder;
}
