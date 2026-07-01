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

export type NameDisplayLocale = "ko" | "zh" | "ja" | "en";

export type NameDisplayLocaleSelection = NameDisplayLocale | "all";

export type BoundaryTextKind = "place" | "keyword";

export const NAME_DISPLAY_LOCALE_OPTIONS = ["en", "ko", "zh", "ja"] as const;

export const NAME_DISPLAY_LOCALE_ARG_TYPE = {
  control: "inline-radio",
  options: NAME_DISPLAY_LOCALE_OPTIONS,
  description: "샘플 언어 — en / ko / zh / ja",
} as const;

export const NAME_DISPLAY_LENGTH_ARG_TYPE = {
  control: { type: "range", min: 1, max: 80, step: 1 },
  description: "선택 언어의 최대폭 문자 반복 글자수",
} as const;

export const NAME_DISPLAY_SAMPLE_NOTE =
  "worst-case 샘플: W / 힣 / 囍 / 曜 반복";

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
  | "report-detail-title-wrap"
  | "locker-detail-title";

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
    zh: { 320: 28, 360: 30, 375: 32, 390: 34, 430: 36, 480: 40 },
    ja: { 320: 28, 360: 30, 375: 32, 390: 34, 430: 36, 480: 40 },
    en: { 320: 28, 360: 30, 375: 32, 390: 34, 430: 36, 480: 40 },
  },
  "search-autocomplete-12km": {
    ko: { 320: 26, 360: 28, 375: 30, 390: 32, 430: 34, 480: 38 },
    zh: { 320: 26, 360: 28, 375: 30, 390: 32, 430: 34, 480: 38 },
    ja: { 320: 26, 360: 28, 375: 30, 390: 32, 430: 34, 480: 38 },
    en: { 320: 26, 360: 28, 375: 30, 390: 32, 430: 34, 480: 38 },
  },
  "search-list-place": {
    ko: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    zh: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    ja: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    en: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
  },
  "search-list-locker": {
    ko: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    zh: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    ja: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
    en: { 320: 22, 360: 26, 375: 28, 390: 30, 430: 34, 480: 40 },
  },
  "search-list-nested-locker": {
    ko: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    zh: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    ja: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    en: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
  },
  "search-recent": {
    ko: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    zh: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    ja: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    en: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
  },
  "search-results-heading-place": {
    ko: { 320: 16, 360: 18, 375: 20, 390: 22, 430: 24, 480: 28 },
    zh: { 320: 16, 360: 18, 375: 20, 390: 22, 430: 24, 480: 28 },
    ja: { 320: 16, 360: 18, 375: 20, 390: 22, 430: 24, 480: 28 },
    en: { 320: 16, 360: 18, 375: 20, 390: 22, 430: 24, 480: 28 },
  },
  "search-results-heading-query": {
    ko: { 320: 34, 360: 38, 375: 40, 390: 42, 430: 46, 480: 52 },
    zh: { 320: 34, 360: 38, 375: 40, 390: 42, 430: 46, 480: 52 },
    ja: { 320: 34, 360: 38, 375: 40, 390: 42, 430: 46, 480: 52 },
    en: { 320: 34, 360: 38, 375: 40, 390: 42, 430: 46, 480: 52 },
  },
  "favorite-title": {
    ko: { 320: 30, 360: 32, 375: 34, 390: 36, 430: 38, 480: 42 },
    zh: { 320: 30, 360: 32, 375: 34, 390: 36, 430: 38, 480: 42 },
    ja: { 320: 30, 360: 32, 375: 34, 390: 36, 430: 38, 480: 42 },
    en: { 320: 30, 360: 32, 375: 34, 390: 36, 430: 38, 480: 42 },
  },
  "report-list-title": {
    ko: { 320: 22, 360: 26, 375: 26, 390: 28, 430: 32, 480: 36 },
    zh: { 320: 22, 360: 26, 375: 26, 390: 28, 430: 32, 480: 36 },
    ja: { 320: 22, 360: 26, 375: 26, 390: 28, 430: 32, 480: 36 },
    en: { 320: 22, 360: 26, 375: 26, 390: 28, 430: 32, 480: 36 },
  },
  "report-detail-title-wrap": {
    ko: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    zh: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    ja: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
    en: { 320: 32, 360: 34, 375: 36, 390: 38, 430: 40, 480: 44 },
  },
  "locker-detail-title": {
    en: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    ko: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    zh: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
    ja: { 320: 24, 360: 28, 375: 30, 390: 32, 430: 36, 480: 42 },
  },
};

/** 경계 앞뒤로 포함할 글자 수(총 2*radius+1개) */
export const NAME_DISPLAY_BOUNDARY_RADIUS = 12;

export const NAME_DISPLAY_BOUNDARY_RADIUS_ARG_TYPE = {
  control: { type: "range", min: 1, max: 40, step: 1 },
  description: "예상 경계 앞뒤로 렌더링할 글자 수",
} as const;

const WIDEST_SAMPLE_CHAR: Record<NameDisplayLocale, string> = {
  ko: "힣",
  zh: "囍",
  ja: "曜",
  en: "W",
};

/** 공백만 남아 행이 Matrix에서 중복되는 경우를 제외한다. */
export function isMeaningfulBoundaryText(text: string): boolean {
  return text.length > 0 && !text.endsWith(" ");
}

export function resolveNameDisplayLocales(
  locale: NameDisplayLocaleSelection,
): NameDisplayLocale[] {
  return locale === "all" ? ["en", "ko", "zh", "ja"] : [locale];
}

export function resolveNameDisplayControlLocale(
  locale: NameDisplayLocaleSelection,
): NameDisplayLocale {
  return locale === "all" ? "en" : locale;
}

export function buildBoundaryText(
  locale: NameDisplayLocale,
  length: number,
  _kind: BoundaryTextKind = "place",
): string {
  const sampleChar = WIDEST_SAMPLE_CHAR[locale];
  return sampleChar.repeat(Math.max(0, length));
}

export function buildNameDisplayControlSample(options: {
  locale: NameDisplayLocaleSelection;
  length: number;
  textKind?: BoundaryTextKind;
}): {
  locale: NameDisplayLocale;
  text: string;
  length: number;
  label: string;
} {
  const { locale, length, textKind = "place" } = options;
  const selectedLocale = resolveNameDisplayControlLocale(locale);
  const text = buildBoundaryText(selectedLocale, length, textKind);

  return {
    locale: selectedLocale,
    text,
    length,
    label: `${selectedLocale} ${length}자`,
  };
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
  const localeLabel = {
    ko: "한글",
    zh: "중문",
    ja: "일문",
    en: "영문",
  }[locale];
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
