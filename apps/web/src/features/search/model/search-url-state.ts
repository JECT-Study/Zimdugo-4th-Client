import { getValidatedSearchQuery } from "../lib/sanitize-search-query";

export type SearchUrlParams = Record<string, unknown>;

export const readSearchQueryParam = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") {
    return undefined;
  }

  return getValidatedSearchQuery(raw) ?? undefined;
};

export const withSearchQueryParam = (
  params: SearchUrlParams,
  query: string | null | undefined,
): SearchUrlParams => {
  const next = { ...params };
  const validatedQuery =
    typeof query === "string" ? getValidatedSearchQuery(query) : null;

  if (validatedQuery) {
    next.q = validatedQuery;
    return next;
  }

  delete next.q;
  return next;
};
