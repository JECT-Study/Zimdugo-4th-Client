import type { ReportFormValues } from "#/features/report/model/report-types";

const REPORT_EDIT_SESSION_KEY = "report-edit-session";

export type ReportEditSession = {
  reportId: number;
  values: ReportFormValues;
};

export const stashReportEditSession = (session: ReportEditSession) => {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(REPORT_EDIT_SESSION_KEY, JSON.stringify(session));
};

export const consumeReportEditSession = (): ReportEditSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(REPORT_EDIT_SESSION_KEY);
  if (!raw) {
    return null;
  }

  sessionStorage.removeItem(REPORT_EDIT_SESSION_KEY);

  try {
    return JSON.parse(raw) as ReportEditSession;
  } catch {
    return null;
  }
};
