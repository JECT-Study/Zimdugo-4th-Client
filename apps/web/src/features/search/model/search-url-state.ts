import { getValidatedSearchQuery } from "../lib/sanitize-search-query";

export type SearchUrlParams = Record<string, unknown>;

export const readSearchQueryParam = (raw: unknown): string | undefined => {
  if (typeof raw !== "string") {
    return undefined;
  }

  return getValidatedSearchQuery(raw) ?? undefined;
};

export const readSearchPlaceIdParam = (raw: unknown): number | undefined => {
  const value =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw.trim())
        : Number.NaN;

  return Number.isInteger(value) && value > 0 ? value : undefined;
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

export const withSearchPlaceIdParam = (
  params: SearchUrlParams,
  placeId: number | null | undefined,
): SearchUrlParams => {
  const next = { ...params };

  if (typeof placeId === "number" && Number.isInteger(placeId) && placeId > 0) {
    next.searchPlaceId = placeId;
    return next;
  }

  delete next.searchPlaceId;
  return next;
};
