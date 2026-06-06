import type { FieldErrors } from "react-hook-form";
import { resolveValidationErrorTarget } from "#/features/report/model/report-error-targets";
import type {
  ReportFormValues,
  ReportSectionId,
} from "#/features/report/model/report-types";

export function collectErrorSectionIds(
  errors: FieldErrors<ReportFormValues>,
): ReportSectionId[] {
  const sectionIds = new Set<ReportSectionId>();

  for (const field of Object.keys(errors)) {
    const target = resolveValidationErrorTarget(field);
    if (target.sectionId) {
      sectionIds.add(target.sectionId);
    }
  }

  return [...sectionIds];
}
