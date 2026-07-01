export const NAME_DISPLAY_VIEWPORTS = [320, 360, 375, 390, 430, 480] as const;

export type NameDisplayViewport = (typeof NAME_DISPLAY_VIEWPORTS)[number];

export const NAME_DISPLAY_DEFAULT_VIEWPORT: NameDisplayViewport = 375;

export const NAME_DISPLAY_VIEWPORT_LABELS: Record<NameDisplayViewport, string> =
  {
    320: "권장 테스트 최소",
    360: "최소 지원",
    375: "기본 디자인 기준",
    390: "표준 모바일 검토",
    430: "스마트폰 최대 shell",
    480: "태블릿 shell",
  };

export type NameDisplayLocale = "ko" | "en";

export type NameDisplayLocaleSelection = NameDisplayLocale | "all";

export type BoundaryTextKind = "place" | "keyword";

/** 화면별 2줄 표시 경계 추정치를 Storybook에서 ±radius로 확인 */
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

type SlotAnchorConfig = Record<NameDisplayLocale, ViewportAnchors>;

/**
 * viewport·locale별 예상 2줄 표시 경계(글자 수).
 * 실제 CSS의 padding, marker, trailing action, card chrome을 기준으로 320/375 값을
 * 보정하고 현재 shell 폭 정책(360/390/430/480)으로 확장한 초기값이다.
 */
export const TWO_LINE_ANCHORS: Record<NameDisplaySlotId, SlotAnchorConfig> = {
  "search-autocomplete-120m": {
    ko: { 320: 28, 360: 30, 375: 32, 390: 34, 430: 36, 480: 40 },
    en: { 320: 46, 360: 52, 375: 54, 390: 56, 430: 62, 480: 68 },
  },
  "search-autocomplete-12km": {
    ko: { 320: 26, 360: 28, 375: 30, 390: 32, 430: 34, 480: 38 },
    en: { 320: 42, 360: 48, 375: 50, 390: 52, 430: 58, 480: 64 },
  },
  "search-list-place": {
    ko: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    en: { 320: 38, 360: 46, 375: 48, 390: 50, 430: 58, 480: 66 },
  },
  "search-list-locker": {
    ko: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    en: { 320: 38, 360: 46, 375: 48, 390: 50, 430: 58, 480: 66 },
  },
  "search-list-nested-locker": {
    ko: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    en: { 320: 36, 360: 42, 375: 44, 390: 46, 430: 54, 480: 60 },
  },
  "search-recent": {
    ko: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    en: { 320: 54, 360: 60, 375: 62, 390: 64, 430: 70, 480: 76 },
  },
  "search-results-heading-place": {
    ko: { 320: 16, 360: 18, 375: 20, 390: 22, 430: 24, 480: 28 },
    en: { 320: 28, 360: 30, 375: 32, 390: 34, 430: 36, 480: 40 },
  },
  "search-results-heading-query": {
    ko: { 320: 34, 360: 38, 375: 40, 390: 42, 430: 46, 480: 52 },
    en: { 320: 58, 360: 66, 375: 68, 390: 70, 430: 78, 480: 86 },
  },
  "favorite-title": {
    ko: { 320: 30, 360: 32, 375: 34, 390: 36, 430: 38, 480: 42 },
    en: { 320: 42, 360: 46, 375: 48, 390: 50, 430: 56, 480: 64 },
  },
  "report-list-title": {
    ko: { 320: 22, 360: 26, 375: 26, 390: 28, 430: 32, 480: 36 },
    en: { 320: 40, 360: 44, 375: 46, 390: 48, 430: 54, 480: 60 },
  },
  "report-detail-title-wrap": {
    ko: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    en: { 320: 52, 360: 58, 375: 60, 390: 62, 430: 68, 480: 76 },
  },
};

/** 경계 앞뒤로 포함할 글자 수(총 2*radius+1개) */
export const NAME_DISPLAY_BOUNDARY_RADIUS = 5;

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

export function resolveNameDisplayLocales(
  locale: NameDisplayLocaleSelection,
): NameDisplayLocale[] {
  return locale === "all" ? ["ko", "en"] : [locale];
}

export function buildBoundaryText(
  locale: NameDisplayLocale,
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

export function buildNameDisplayBoundaryLengths(
  anchor: number,
  radius = NAME_DISPLAY_BOUNDARY_RADIUS,
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
  locale: NameDisplayLocale,
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

export interface NameDisplayBoundaryRow {
  text: string;
  length: number;
  label: string;
  locale: NameDisplayLocale;
  anchor: number;
}

export function buildNameDisplayBoundaryRows(options: {
  slot: NameDisplaySlotId;
  locale: NameDisplayLocaleSelection;
  viewport: NameDisplayViewport;
  radius?: number;
  labelExtra?: string;
  textKind?: BoundaryTextKind;
}): NameDisplayBoundaryRow[] {
  const {
    slot,
    locale,
    viewport,
    radius,
    labelExtra,
    textKind = "place",
  } = options;

  return resolveNameDisplayLocales(locale).flatMap((entry) => {
    const anchor = TWO_LINE_ANCHORS[slot][entry][viewport];
    return buildNameDisplayBoundaryLengths(anchor, radius)
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
