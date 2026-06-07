import { useFormContext, useFormState } from "react-hook-form";
import { getReportValidationMessage } from "#/features/report/lib/report-validation-message";
import type { ReportFormValues } from "./report-types";

export function useReportSectionError(
  fields: (keyof ReportFormValues)[],
  sectionServerError?: string,
): string | undefined {
  const { control } = useFormContext<ReportFormValues>();
  const { errors } = useFormState({ control });

  if (sectionServerError) {
    return getReportValidationMessage(sectionServerError);
  }

  for (const field of fields) {
    const message = errors[field]?.message;
    if (message) {
      return getReportValidationMessage(String(message));
    }
  }

  return undefined;
}
