import {
  parseSearchHistoryEntries,
  SEARCH_HISTORY_STORAGE_KEY,
  type SearchHistoryEntry,
  type SearchHistoryInput,
  upsertSearchHistoryEntry,
} from "./search-history";

const EMPTY_SEARCH_HISTORY: SearchHistoryEntry[] = [];

let cachedRaw: string | null = null;
let cachedSnapshot: SearchHistoryEntry[] = EMPTY_SEARCH_HISTORY;

export const invalidateSearchHistoryCache = (): void => {
  cachedRaw = null;
  cachedSnapshot = EMPTY_SEARCH_HISTORY;
};

const syncSnapshotFromStorage = (): SearchHistoryEntry[] => {
  if (typeof window === "undefined") {
    return EMPTY_SEARCH_HISTORY;
  }

  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY) ?? "";

    if (raw === cachedRaw) {
      return cachedSnapshot;
    }

    cachedRaw = raw;

    if (!raw) {
      cachedSnapshot = EMPTY_SEARCH_HISTORY;
      return cachedSnapshot;
    }

    cachedSnapshot = parseSearchHistoryEntries(JSON.parse(raw));
  } catch {
    cachedRaw = "";
    cachedSnapshot = EMPTY_SEARCH_HISTORY;
  }

  return cachedSnapshot;
};

export const readSearchHistoryEntries = (): SearchHistoryEntry[] =>
  syncSnapshotFromStorage();

export const writeSearchHistoryEntries = (entries: SearchHistoryEntry[]): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = JSON.stringify(entries);
    window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSnapshot = entries;
  } catch {
    // QuotaExceededError·SecurityError 등 — 검색 흐름은 유지하고 저장만 생략
  }
};

export const appendSearchHistoryEntry = (
  input: SearchHistoryInput,
): SearchHistoryEntry[] => {
  const nextEntries = upsertSearchHistoryEntry(readSearchHistoryEntries(), input);
  writeSearchHistoryEntries(nextEntries);
  return nextEntries;
};

export const removeSearchHistoryEntry = (id: string): SearchHistoryEntry[] => {
  const nextEntries = readSearchHistoryEntries().filter((entry) => entry.id !== id);
  writeSearchHistoryEntries(nextEntries);
  return nextEntries;
};

export const clearSearchHistoryEntries = (): SearchHistoryEntry[] => {
  writeSearchHistoryEntries([]);
  return [];
};
