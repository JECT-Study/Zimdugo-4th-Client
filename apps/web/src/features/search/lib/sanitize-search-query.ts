export const SEARCH_QUERY_MAX_LENGTH = 30;

/** 한글 완성형, 영문, 숫자, CJK, 히라가나·가타카나, 공백 */
const ALLOWED_SEARCH_QUERY_CHAR =
  /[0-9A-Za-z\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF ]/;

/** IME·초성검색용 한글 자모 */
const HANGUL_JAMO_CHAR =
  /[\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]/;

const isHangulJamoOnlyDraft = (draft: string): boolean =>
  draft.length > 0 &&
  [...draft].every((char) => HANGUL_JAMO_CHAR.test(char));

const isAllowedSearchQueryChar = (char: string): boolean =>
  ALLOWED_SEARCH_QUERY_CHAR.test(char) || HANGUL_JAMO_CHAR.test(char);

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

/** 연속 공백·허용 문자·초성검색 여부를 검사한다 (trim된 문자열 기준) */
export const isSearchQueryDraftWellFormed = (draft: string): boolean => {
  if (draft.length === 0) {
    return true;
  }

  if (/\s{2,}/.test(draft)) {
    return false;
  }

  // 완성형 없이 자모만 — 초성검색(ㄱㄴ) 및 IME 중간 단계(ㄱㅏ) 차단
  if (isHangulJamoOnlyDraft(draft)) {
    return false;
  }

  return [...draft].every((char) => isAllowedSearchQueryChar(char));
};

export type SearchQueryIssue = "invalid-format";

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

  if (!isSearchQueryDraftWellFormed(draft)) {
    return "invalid-format";
  }

  return null;
};

export const isSearchQueryDraftValid = (raw: string): boolean =>
  getValidatedSearchQuery(raw) !== null;

export const isSearchQuerySubmittable = (raw: string): boolean =>
  isSearchQueryDraftValid(raw);

/** 검증 통과 시 trim된 검색어. 자동완성·제출·키워드 API에 사용 */
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
    return {
      ok: false,
      reason: getSearchQueryIssue(raw) ?? "invalid-format",
    };
  }

  return { ok: true, query: validated };
};
