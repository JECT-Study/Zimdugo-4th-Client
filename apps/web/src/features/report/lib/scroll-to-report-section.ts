import type { ReportSectionId } from "#/features/report/model/report-types";

export const REPORT_CONTENT_SCROLL_CONTAINER_ATTR =
  "data-report-scroll-container";

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

export function getReportSectionScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

export function scrollToReportSection(sectionId: ReportSectionId): void {
  if (typeof document === "undefined") return;

  const section = document.querySelector<HTMLElement>(
    `[data-section="${sectionId}"]`,
  );
  if (!section) return;

  const scrollContainer = document.querySelector<HTMLElement>(
    `[${REPORT_CONTENT_SCROLL_CONTAINER_ATTR}]`,
  );

  if (scrollContainer) {
    const containerRect = scrollContainer.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const nextScrollTop =
      scrollContainer.scrollTop + (sectionRect.top - containerRect.top);

    scrollContainer.scrollTo({
      top: nextScrollTop,
      behavior: getReportSectionScrollBehavior(),
    });
    return;
  }

  section.scrollIntoView({
    behavior: getReportSectionScrollBehavior(),
    block: "start",
  });
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
