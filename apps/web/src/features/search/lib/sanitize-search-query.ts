export const SEARCH_QUERY_MIN_LENGTH = 2;
export const SEARCH_QUERY_MAX_LENGTH = 30;

/** 한글 완성형, 영문, 숫자, CJK, 히라가나·가타카나, 공백만 허용 (초성·이모지·특수문자 제외) */
const ALLOWED_SEARCH_QUERY_CHAR =
  /[0-9A-Za-z\uAC00-\uD7A3\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF ]/;

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

  return [...draft].every((char) => ALLOWED_SEARCH_QUERY_CHAR.test(char));
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

  if (!isSearchQueryDraftWellFormed(draft)) {
    return "invalid-format";
  }

  if (draft.length < SEARCH_QUERY_MIN_LENGTH) {
    return "too-short";
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

  return trimSearchQueryDraft(raw);
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
