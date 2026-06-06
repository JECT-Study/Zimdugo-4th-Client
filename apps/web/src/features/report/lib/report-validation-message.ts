import { m } from "@repo/i18n";

const VALIDATION_MESSAGE_KEYS = new Set([
  "required",
  "pair_required",
  "invalid_range",
  "must_be_null",
  "min",
  "max",
  "range",
]);

export function getReportValidationMessage(message: string): string {
  if (!VALIDATION_MESSAGE_KEYS.has(message)) {
    return message;
  }

  switch (message) {
    case "required":
      return m.report_error_required();
    case "pair_required":
      return m.report_error_time_pair_required();
    case "invalid_range":
      return m.report_error_time_invalid_range();
    case "must_be_null":
      return m.report_error_floor_must_be_null();
    case "min":
      return m.report_error_price_min();
    case "max":
      return m.report_error_price_max();
    case "range":
      return m.report_error_price_range();
    default:
      return message;
  }
}
