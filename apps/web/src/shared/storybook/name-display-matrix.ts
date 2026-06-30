export const NAME_DISPLAY_VIEWPORTS = [320, 360, 375, 390, 430, 480] as const;

export type NameDisplayViewport = (typeof NAME_DISPLAY_VIEWPORTS)[number];

export const NAME_DISPLAY_DEFAULT_VIEWPORT: NameDisplayViewport = 390;

export const NAME_DISPLAY_VIEWPORT_LABELS: Record<NameDisplayViewport, string> =
  {
    320: "권장 테스트 최소",
    360: "최소 지원",
    375: "기존 디자인 기준",
    390: "현재 기본 검토",
    430: "스마트폰 최대 shell",
    480: "태블릿 shell",
  };

export type EllipsisLocale = "ko" | "en";

export type EllipsisLocaleSelection = EllipsisLocale | "all";

export type BoundaryTextKind = "place" | "keyword";

/** 화면별 말줄임 또는 줄바꿈 경계 추정치를 Storybook에서 ±radius로 확인 */
export type NameDisplaySlotId =
  | "search-autocomplete-120m"
  | "search-autocomplete-12km"
  | "search-list-place"
  | "search-list-locker"
  | "search-list-nested-locker"
  | "search-recent"
  | "search-results-heading-place"
  | "search-results-heading-query"
  | "favorite-title"
  | "report-list-title"
  | "report-detail-title-wrap";

type ViewportAnchors = Record<NameDisplayViewport, number>;

type SlotAnchorConfig = Record<EllipsisLocale, ViewportAnchors>;

/**
 * viewport·locale별 예상 말줄임 경계(글자 수).
 * 실제 CSS의 padding, marker, trailing action, card chrome을 기준으로 320/375 값을
 * 보정하고 현재 shell 폭 정책(360/390/430/480)으로 확장한 초기값이다.
 */
export const ELLIPSIS_ANCHORS: Record<NameDisplaySlotId, SlotAnchorConfig> = {
  "search-autocomplete-120m": {
    ko: { 320: 14, 360: 15, 375: 16, 390: 17, 430: 18, 480: 20 },
    en: { 320: 23, 360: 26, 375: 27, 390: 28, 430: 31, 480: 34 },
  },
  "search-autocomplete-12km": {
    ko: { 320: 13, 360: 14, 375: 15, 390: 16, 430: 17, 480: 19 },
    en: { 320: 21, 360: 24, 375: 25, 390: 26, 430: 29, 480: 32 },
  },
  "search-list-place": {
    ko: { 320: 11, 360: 13, 375: 14, 390: 15, 430: 17, 480: 20 },
    en: { 320: 19, 360: 23, 375: 24, 390: 25, 430: 29, 480: 33 },
  },
  "search-list-locker": {
    ko: { 320: 11, 360: 13, 375: 14, 390: 15, 430: 17, 480: 20 },
    en: { 320: 19, 360: 23, 375: 24, 390: 25, 430: 29, 480: 33 },
  },
  "search-list-nested-locker": {
    ko: { 320: 12, 360: 14, 375: 15, 390: 16, 430: 18, 480: 21 },
    en: { 320: 18, 360: 21, 375: 22, 390: 23, 430: 27, 480: 30 },
  },
  "search-recent": {
    ko: { 320: 16, 360: 17, 375: 18, 390: 19, 430: 20, 480: 22 },
    en: { 320: 27, 360: 30, 375: 31, 390: 32, 430: 35, 480: 38 },
  },
  "search-results-heading-place": {
    ko: { 320: 8, 360: 9, 375: 10, 390: 11, 430: 12, 480: 14 },
    en: { 320: 14, 360: 15, 375: 16, 390: 17, 430: 18, 480: 20 },
  },
  "search-results-heading-query": {
    ko: { 320: 17, 360: 19, 375: 20, 390: 21, 430: 23, 480: 26 },
    en: { 320: 29, 360: 33, 375: 34, 390: 35, 430: 39, 480: 43 },
  },
  "favorite-title": {
    ko: { 320: 15, 360: 16, 375: 17, 390: 18, 430: 19, 480: 21 },
    en: { 320: 21, 360: 23, 375: 24, 390: 25, 430: 28, 480: 32 },
  },
  "report-list-title": {
    ko: { 320: 11, 360: 13, 375: 13, 390: 14, 430: 16, 480: 18 },
    en: { 320: 20, 360: 22, 375: 23, 390: 24, 430: 27, 480: 30 },
  },
  "report-detail-title-wrap": {
    ko: { 320: 16, 360: 17, 375: 18, 390: 19, 430: 20, 480: 22 },
    en: { 320: 26, 360: 29, 375: 30, 390: 31, 430: 34, 480: 38 },
  },
};

/** 경계 앞뒤로 포함할 글자 수(총 2*radius+1개) */
export const ELLIPSIS_BOUNDARY_RADIUS = 5;

const KO_PLACE_SEGMENTS = [
  "강남역",
  "교보타워",
  "5층",
  "안내데스크",
  "맞은편",
  "물품보관함",
] as const;

const EN_PLACE_SEGMENTS = [
  "Gangnam Station",
  "Kyobo Tower",
  "5F",
  "Info Desk",
  "Opposite Side",
  "Locker",
] as const;

const KO_KEYWORD_SEGMENTS = [
  "강남역",
  "교보타워",
  "물품보관함",
  "안내데스크",
  "검색어",
] as const;

const EN_KEYWORD_SEGMENTS = [
  "Gangnam Station",
  "Kyobo Tower",
  "Locker",
  "Search",
  "Query",
] as const;

function buildPlaceStyleText(
  segments: readonly string[],
  targetLength: number,
): string {
  if (targetLength <= 0) return "";

  let expanded = segments.join(" ");
  const tail = segments[segments.length - 1] ?? segments[0] ?? "";
  while (expanded.length < targetLength) {
    expanded += ` ${tail}`;
  }

  let result = "";
  let index = 0;
  while (result.length < targetLength && index < expanded.length) {
    const char = expanded[index] ?? "";
    index += 1;

    // 마지막 글자를 공백으로 채우면 화면에서는 이전 행과 동일해 보여 건너뛴다.
    if (char === " " && result.length === targetLength - 1) {
      continue;
    }

    result += char;
  }

  return result;
}

/** 공백만 남아 행이 Matrix에서 중복되는 경우를 제외한다. */
export function isMeaningfulBoundaryText(text: string): boolean {
  return text.length > 0 && !text.endsWith(" ");
}

export function resolveEllipsisLocales(
  locale: EllipsisLocaleSelection,
): EllipsisLocale[] {
  return locale === "all" ? ["ko", "en"] : [locale];
}

export function buildBoundaryText(
  locale: EllipsisLocale,
  length: number,
  kind: BoundaryTextKind = "place",
): string {
  if (kind === "keyword") {
    const segments =
      locale === "ko" ? KO_KEYWORD_SEGMENTS : EN_KEYWORD_SEGMENTS;
    return buildPlaceStyleText(segments, length);
  }

  const segments = locale === "ko" ? KO_PLACE_SEGMENTS : EN_PLACE_SEGMENTS;
  return buildPlaceStyleText(segments, length);
}

export function buildEllipsisBoundaryLengths(
  anchor: number,
  radius = ELLIPSIS_BOUNDARY_RADIUS,
): number[] {
  const start = Math.max(1, anchor - radius);
  const end = anchor + radius;
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function formatBoundaryPosition(
  length: number,
  anchor: number,
): "under" | "at" | "over" {
  if (length < anchor) return "under";
  if (length === anchor) return "at";
  return "over";
}

function formatBoundaryLabel(
  locale: EllipsisLocale,
  length: number,
  anchor: number,
  extra?: string,
): string {
  const localeLabel = locale === "ko" ? "한글" : "영문";
  const position = formatBoundaryPosition(length, anchor);

  const positionLabel =
    position === "at"
      ? "예상 경계"
      : position === "under"
        ? `경계-${anchor - length}`
        : `경계+${length - anchor}`;

  const suffix = extra ? ` · ${extra}` : "";
  return `${localeLabel} ${length}자 · ${positionLabel}${suffix}`;
}

export interface EllipsisBoundaryRow {
  text: string;
  length: number;
  label: string;
  locale: EllipsisLocale;
  anchor: number;
}

export function buildEllipsisBoundaryRows(options: {
  slot: NameDisplaySlotId;
  locale: EllipsisLocaleSelection;
  viewport: NameDisplayViewport;
  radius?: number;
  labelExtra?: string;
  textKind?: BoundaryTextKind;
}): EllipsisBoundaryRow[] {
  const {
    slot,
    locale,
    viewport,
    radius,
    labelExtra,
    textKind = "place",
  } = options;

  return resolveEllipsisLocales(locale).flatMap((entry) => {
    const anchor = ELLIPSIS_ANCHORS[slot][entry][viewport];
    return buildEllipsisBoundaryLengths(anchor, radius)
      .map((length) => {
        const text = buildBoundaryText(entry, length, textKind);
        return {
          text,
          length,
          locale: entry,
          anchor,
          label: formatBoundaryLabel(entry, length, anchor, labelExtra),
        };
      })
      .filter((row) => isMeaningfulBoundaryText(row.text));
  });
}
