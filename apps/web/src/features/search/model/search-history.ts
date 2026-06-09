export const SEARCH_HISTORY_STORAGE_KEY = "search_history";
export const SEARCH_HISTORY_MAX_ENTRIES = 20;

export interface SearchHistoryKeywordEntry {
  kind: "keyword";
  id: string;
  query: string;
  searchedAt: string;
}

export interface SearchHistoryLockerEntry {
  kind: "locker";
  id: string;
  lockerId: number;
  title: string;
  searchDraft: string;
  searchedAt: string;
}

export interface SearchHistoryPlaceEntry {
  kind: "place";
  id: string;
  placeId: number;
  title: string;
  searchDraft: string;
  searchedAt: string;
}

export type SearchHistoryEntry =
  | SearchHistoryKeywordEntry
  | SearchHistoryLockerEntry
  | SearchHistoryPlaceEntry;

export type SearchHistoryInput =
  | { kind: "keyword"; query: string }
  | {
      kind: "locker";
      lockerId: number;
      title: string;
      searchDraft: string;
    }
  | {
      kind: "place";
      placeId: number;
      title: string;
      searchDraft: string;
    };

const normalizeKeyword = (query: string): string => query.trim().toLowerCase();

export const getSearchHistoryEntryId = (
  input: Pick<SearchHistoryInput, "kind"> &
    Partial<SearchHistoryKeywordEntry> &
    Partial<SearchHistoryLockerEntry> &
    Partial<SearchHistoryPlaceEntry>,
): string => {
  switch (input.kind) {
    case "keyword":
      return `keyword:${normalizeKeyword(input.query ?? "")}`;
    case "locker":
      return `locker:${input.lockerId}`;
    case "place":
      return `place:${input.placeId}`;
  }
};

export const createSearchHistoryEntry = (
  input: SearchHistoryInput,
  searchedAt = new Date().toISOString(),
): SearchHistoryEntry => {
  const id = getSearchHistoryEntryId(input);

  switch (input.kind) {
    case "keyword":
      return {
        kind: "keyword",
        id,
        query: input.query.trim(),
        searchedAt,
      };
    case "locker":
      return {
        kind: "locker",
        id,
        lockerId: input.lockerId,
        title: input.title,
        searchDraft: input.searchDraft.trim(),
        searchedAt,
      };
    case "place":
      return {
        kind: "place",
        id,
        placeId: input.placeId,
        title: input.title,
        searchDraft: input.searchDraft.trim(),
        searchedAt,
      };
  }
};

export const upsertSearchHistoryEntry = (
  entries: SearchHistoryEntry[],
  input: SearchHistoryInput,
  options: { maxEntries?: number; searchedAt?: string } = {},
): SearchHistoryEntry[] => {
  const maxEntries = options.maxEntries ?? SEARCH_HISTORY_MAX_ENTRIES;
  const nextEntry = createSearchHistoryEntry(
    input,
    options.searchedAt ?? new Date().toISOString(),
  );
  const withoutDuplicate = entries.filter((entry) => entry.id !== nextEntry.id);

  return [nextEntry, ...withoutDuplicate].slice(0, maxEntries);
};

export const formatSearchHistoryDateLabel = (searchedAt: string): string => {
  const timestamp = Date.parse(searchedAt);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}.${day}`;
};

export const getSearchHistoryEntryLabel = (entry: SearchHistoryEntry): string => {
  switch (entry.kind) {
    case "keyword":
      return entry.query;
    case "locker":
    case "place":
      return entry.title;
  }
};

export const parseSearchHistoryEntries = (raw: unknown): SearchHistoryEntry[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter(isSearchHistoryEntry);
};

const isSearchHistoryEntry = (value: unknown): value is SearchHistoryEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Partial<SearchHistoryEntry>;
  if (typeof entry.id !== "string" || typeof entry.searchedAt !== "string") {
    return false;
  }

  switch (entry.kind) {
    case "keyword":
      return typeof entry.query === "string";
    case "locker":
      return (
        typeof entry.lockerId === "number" &&
        typeof entry.title === "string" &&
        typeof entry.searchDraft === "string"
      );
    case "place":
      return (
        typeof entry.placeId === "number" &&
        typeof entry.title === "string" &&
        typeof entry.searchDraft === "string"
      );
    default:
      return false;
  }
};
