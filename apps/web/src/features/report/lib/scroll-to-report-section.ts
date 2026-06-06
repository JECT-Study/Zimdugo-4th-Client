import type { ReportSectionId } from "#/features/report/model/report-types";

export const REPORT_SECTION_ORDER: ReportSectionId[] = [
  "location",
  "floor",
  "classification",
  "size",
  "photo",
  "agreement",
  "price",
  "time",
  "additionalInfo",
];

export function scrollToReportSection(sectionId: ReportSectionId): void {
  if (typeof document === "undefined") return;
  document
    .querySelector(`[data-section="${sectionId}"]`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToEarliestReportSection(
  sectionIds: Iterable<ReportSectionId>,
): void {
  const sectionSet = new Set(sectionIds);
  for (const sectionId of REPORT_SECTION_ORDER) {
    if (sectionSet.has(sectionId)) {
      scrollToReportSection(sectionId);
      return;
    }
  }
}
