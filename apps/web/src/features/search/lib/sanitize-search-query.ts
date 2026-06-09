export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 30;

/** 한글 완성형, 영문, 숫자, CJK, 히라가나·가타카나, 공백 */
const ALLOWED_SEARCH_QUERY_CHAR =
  /[0-9A-Za-z\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF ]/;

const COMPLETE_HANGUL_SYLLABLE = /[\uAC00-\uD7A3]/;

/** 완성형 한글이 있을 때만 허용 — IME 조합 중 ㄱ·ㅏ·ㄴ 같은 자모 */
const HANGUL_JAMO_CHAR =
  /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/;

const isHangulJamoOnlyDraft = (draft: string): boolean =>
  draft.length > 0 &&
  [...draft].every((char) => HANGUL_JAMO_CHAR.test(char));

/** index부터 끝까지 자모만 이어지는지 — 다음 음절 IME 조합 구간 */
const isTrailingHangulJamoSuffix = (draft: string, fromIndex: number): boolean =>
  [...draft.slice(fromIndex)].every((char) => HANGUL_JAMO_CHAR.test(char));

const isAllowedSearchQueryChar = (
  char: string,
  draft: string,
  index: number,
): boolean => {
  if (ALLOWED_SEARCH_QUERY_CHAR.test(char)) {
    return true;
  }

  if (!HANGUL_JAMO_CHAR.test(char)) {
    return false;
  }

  // IME 초기: ㄱ·ㄱㅏ처럼 자모만 있는 단계
  if (isHangulJamoOnlyDraft(draft)) {
    return true;
  }

  // 완성형 뒤 꼬리 자모만 허용 (강ㄴ O, 강ㄴ남 X)
  return (
    COMPLETE_HANGUL_SYLLABLE.test(draft) &&
    isTrailingHangulJamoSuffix(draft, index)
  );
};

const capSearchQueryLength = (raw: string): string =>
  raw.slice(0, SEARCH_QUERY_MAX_LENGTH);

/**
 * 입력 중 onChange용 — 길이만 제한한다.
 * 한글 IME 조합 중 ㄱ·ㅏ 같은 자모 단계는 그대로 두어 완성형(가)으로 이어질 수 있게 한다.
 */
export const capSearchQueryDraft = (raw: string): string =>
  capSearchQueryLength(raw);

/** 검증·input 동기화 시 trim. onChange에는 사용하지 않는다. */
export const trimSearchQueryDraft = (raw: string): string =>
  capSearchQueryDraft(raw).trim();

/** 연속 공백·허용 문자만 만족하는지 (trim된 문자열 기준) */
export const isSearchQueryDraftWellFormed = (draft: string): boolean => {
  if (draft.length === 0) {
    return true;
  }

  if (/\s{2,}/.test(draft)) {
    return false;
  }

  // 완성형 없이 자모만 2글자 이상 — IME 중간 단계가 아닌 잘못된 조합(ㄱㄴㄷ, ㄱㅏ 등)
  if (isHangulJamoOnlyDraft(draft) && draft.length >= 2) {
    return false;
  }

  return [...draft].every((char, index) =>
    isAllowedSearchQueryChar(char, draft, index),
  );
};

export type SearchQueryIssue = "too-short" | "invalid-format";

/** trim 후 검증. 유효하면 null */
export const getSearchQueryIssue = (raw: string): SearchQueryIssue | null => {
  const capped = capSearchQueryDraft(raw);

  if (capped.length === 0) {
    return null;
  }

  const draft = trimSearchQueryDraft(raw);

  if (draft.length === 0) {
    return null;
  }

  if (draft.length < SEARCH_QUERY_MIN_LENGTH) {
    return "too-short";
  }

  if (!isSearchQueryDraftWellFormed(draft)) {
    return "invalid-format";
  }

  return null;
};

export const isSearchQueryDraftValid = (raw: string): boolean =>
  getValidatedSearchQuery(raw) !== null;

export const isSearchQuerySubmittable = (raw: string): boolean =>
  isSearchQueryDraftValid(raw);

/** 검증 통과 시 trim된 검색어. 자동완성·제출에 사용 */
export const getValidatedSearchQuery = (raw: string): string | null => {
  const issue = getSearchQueryIssue(raw);

  if (issue) {
    return null;
  }

  const trimmed = trimSearchQueryDraft(raw);

  if (trimmed.length === 0) {
    return null;
  }

  return trimmed;
};

export type SearchQuerySubmitRejectReason = SearchQueryIssue;

export type SearchQuerySubmitAttempt =
  | { ok: true; query: string }
  | { ok: false; reason: SearchQuerySubmitRejectReason };

export const resolveSearchQuerySubmitAttempt = (
  raw: string,
): SearchQuerySubmitAttempt => {
  const validated = getValidatedSearchQuery(raw);

  if (!validated) {
    const issue = getSearchQueryIssue(raw);

    return {
      ok: false,
      reason: issue ?? "too-short",
    };
  }

  return { ok: true, query: validated };
};
