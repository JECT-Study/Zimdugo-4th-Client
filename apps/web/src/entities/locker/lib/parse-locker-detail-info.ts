/**
 * 보관함 상세 정보(`detailInfo`) 문자열을 그래픽으로 그릴 수 있는 값으로 읽는다.
 *
 * 서버는 상세 정보를 구조화된 필드가 아니라 언어별로 번역한 반구조 문자열로 준다.
 *
 * ```text
 * - 상세위치: 표 내는 곳 주변
 * - 보관함 개수: 소형 36개 / 중형 8개 / 대형 8개
 * - 이용요금: 대형 4,400원 / 중형 3,300원 / 소형 2,200원 (평일 기본 4시간 기준)
 * ```
 *
 * 번역은 기계 번역이라 모양이 조금씩 다르다. 중국어는 `0 大型 / 8 中型 / 32 小` 처럼
 * 숫자가 앞에 오고 크기 이름이 줄기도 한다. 그래서 줄 이름은 언어별 낱말 목록으로,
 * 크기는 칸마다 크기 낱말과 숫자를 따로 찾아 순서에 기대지 않는다.
 *
 * 읽지 못한 줄은 버리지 않고 `unparsedLines` 로 돌려준다. 화면은 그 줄을 원문 그대로
 * 보여 주어, 서버 문구가 바뀌어도 정보가 사라지지 않게 한다. 백엔드가 개수·요금을
 * 구조화해 주면 이 파서를 걷어 낸다.
 */

export type LockerSizeType = "SMALL" | "MEDIUM" | "LARGE";

export interface LockerSizeInfo {
  size: LockerSizeType;
  /** 그 크기 칸의 전체 개수. */
  count?: number;
  /** 그 크기 칸의 요금(원). */
  price?: number;
}

export interface LockerDetailInfo {
  /** 상세위치. 번역된 문장 그대로다. */
  location?: string;
  /** 크기별 개수·요금. 소형 → 중형 → 대형 순이다. */
  sizes: LockerSizeInfo[];
  /** 요금의 기준(예: "평일 기본 4시간 기준"). 번역된 문장 그대로다. */
  priceBasis?: string;
  /** 읽지 못한 줄. 원문 그대로다. */
  unparsedLines: string[];
}

type DetailLineKind = "location" | "count" | "fee";

/** 줄 이름 → 종류. 다섯 언어의 서버 문구를 소문자·공백 제거로 맞춘다. */
const LINE_LABELS: Record<DetailLineKind, readonly string[]> = {
  location: ["상세위치", "detailedlocation", "詳細位置", "详细位置"],
  count: [
    "보관함개수",
    "numberoflockers",
    "ロッカー数",
    "寄存柜数量",
    "寄存櫃數量",
  ],
  fee: ["이용요금", "fee", "利用料金", "使用费用", "使用費用"],
};

/**
 * 크기 낱말. 칸을 공백·숫자로 끊은 조각 중 하나와 **통째로** 같아야 한다. 일부만
 * 맞춰 보면 `특대형` 이 `대형` 으로 읽혀 없는 대형 칸을 그린다. 한 글자 낱말
 * (`小`·`中`·`大`)은 중국어 번역이 줄여 쓴 경우다.
 */
const SIZE_WORDS: ReadonlyMap<string, LockerSizeType> = new Map([
  ["소형", "SMALL"],
  ["중형", "MEDIUM"],
  ["대형", "LARGE"],
  ["small", "SMALL"],
  ["medium", "MEDIUM"],
  ["large", "LARGE"],
  ["小型", "SMALL"],
  ["中型", "MEDIUM"],
  ["大型", "LARGE"],
  ["小", "SMALL"],
  ["中", "MEDIUM"],
  ["大", "LARGE"],
]);

const SIZE_ORDER: readonly LockerSizeType[] = ["SMALL", "MEDIUM", "LARGE"];

/** `- 이름: 값` 또는 전각 콜론 `- 이름：값`. 앞의 `-` 는 없어도 받는다. */
const LINE_PATTERN = /^\s*-?\s*([^:：]+?)\s*[:：]\s*(.+?)\s*$/;
/** 값 끝의 괄호(반각·전각) 하나. 요금 기준이 여기 들어온다. */
const TRAILING_PAREN_PATTERN = /\s*[(（]([^()（）]+)[)）]\s*$/;
const NUMBER_PATTERN = /\d[\d,]*/;

const normalizeLabel = (label: string) =>
  label.toLowerCase().replace(/\s+/g, "");

const resolveLineKind = (label: string): DetailLineKind | null => {
  const normalized = normalizeLabel(label);
  for (const kind of Object.keys(LINE_LABELS) as DetailLineKind[]) {
    if (LINE_LABELS[kind].includes(normalized)) return kind;
  }
  return null;
};

const findSizeWord = (segment: string): LockerSizeType | null => {
  for (const token of segment.toLowerCase().split(/[\s\d,]+/)) {
    const size = SIZE_WORDS.get(token);
    if (size) return size;
  }
  return null;
};

/**
 * `소형 36개 / 중형 8개` 를 크기별 숫자로 읽는다. 칸 하나라도 크기나 숫자를 찾지
 * 못하면 줄 전체를 읽지 못한 것으로 본다. 반쯤 읽은 값을 그리면 틀린 그림이 된다.
 */
const parseSizeNumbers = (
  value: string,
): Map<LockerSizeType, number> | null => {
  const result = new Map<LockerSizeType, number>();

  for (const segment of value.split("/")) {
    const size = findSizeWord(segment);
    const numberMatch = segment.match(NUMBER_PATTERN);
    if (!size || !numberMatch || result.has(size)) return null;

    result.set(size, Number(numberMatch[0].replace(/,/g, "")));
  }

  return result.size > 0 ? result : null;
};

export const parseLockerDetailInfo = (
  text: string | null | undefined,
): LockerDetailInfo | null => {
  if (!text?.trim()) return null;

  let location: string | undefined;
  let priceBasis: string | undefined;
  const counts = new Map<LockerSizeType, number>();
  const prices = new Map<LockerSizeType, number>();
  const unparsedLines: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(LINE_PATTERN);
    const kind = match ? resolveLineKind(match[1]) : null;
    const value = match?.[2] ?? "";

    if (kind === "location" && value) {
      location = value;
      continue;
    }

    if (kind === "count") {
      const parsed = parseSizeNumbers(value);
      if (parsed) {
        for (const [size, count] of parsed) counts.set(size, count);
        continue;
      }
    }

    if (kind === "fee") {
      const basisMatch = value.match(TRAILING_PAREN_PATTERN);
      const feeValue = basisMatch
        ? value.slice(0, basisMatch.index).trim()
        : value;
      const parsed = parseSizeNumbers(feeValue);
      if (parsed) {
        for (const [size, price] of parsed) prices.set(size, price);
        priceBasis = basisMatch?.[1].trim() || undefined;
        continue;
      }
    }

    unparsedLines.push(line.replace(/^-\s*/, ""));
  }

  const sizes = SIZE_ORDER.filter(
    (size) => counts.has(size) || prices.has(size),
  ).map((size) => ({
    size,
    count: counts.get(size),
    price: prices.get(size),
  }));

  if (!location && sizes.length === 0) return null;

  return { location, sizes, priceBasis, unparsedLines };
};
