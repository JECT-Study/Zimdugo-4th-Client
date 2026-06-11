import type { ValidationErrorResponse } from "#/features/report/model/report-types";

export type ReportSubmitFailureKind = "validation" | "auth" | "server";

export type ReportSubmitFailure =
  | {
      kind: "validation";
      validationErrors: ValidationErrorResponse["validationErrors"];
    }
  | { kind: "auth" }
  | { kind: "server" };

type HttpLikeError = {
  response?: {
    status?: number;
    data?: unknown;
  };
};

export function parseReportSubmitFailure(error: unknown): ReportSubmitFailure {
  if (!isHttpLikeError(error)) {
    return { kind: "server" };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 400 && isValidationErrorResponse(data)) {
    return {
      kind: "validation",
      validationErrors: data.validationErrors,
    };
  }

  if (status === 401) {
    return { kind: "auth" };
  }

  return { kind: "server" };
}

function isHttpLikeError(error: unknown): error is HttpLikeError {
  return typeof error === "object" && error !== null && "response" in error;
}

function isValidationErrorResponse(
  data: unknown,
): data is ValidationErrorResponse {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as ValidationErrorResponse;
  return (
    candidate.code === "VALIDATION_FAILED" &&
    Array.isArray(candidate.validationErrors)
  );
}
