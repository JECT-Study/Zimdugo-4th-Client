import { useCallback, useSyncExternalStore } from "react";
import { SEARCH_HISTORY_STORAGE_KEY } from "../model/search-history";
import type { SearchHistoryEntry, SearchHistoryInput } from "../model/search-history";
import {
  appendSearchHistoryEntry,
  clearSearchHistoryEntries,
  invalidateSearchHistoryCache,
  readSearchHistoryEntries,
  removeSearchHistoryEntry,
} from "../model/search-history-storage";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SEARCH_HISTORY_STORAGE_KEY) {
      invalidateSearchHistoryCache();
      listener();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
};

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const SERVER_SNAPSHOT: SearchHistoryEntry[] = [];

const getSnapshot = () => readSearchHistoryEntries();

const getServerSnapshot = () => SERVER_SNAPSHOT;

const commit = () => {
  notify();
};

export const useSearchHistory = () => {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const record = useCallback((input: SearchHistoryInput) => {
    appendSearchHistoryEntry(input);
    commit();
  }, []);

  const remove = useCallback((id: string) => {
    removeSearchHistoryEntry(id);
    commit();
  }, []);

  const clear = useCallback(() => {
    clearSearchHistoryEntries();
    commit();
  }, []);

  return {
    entries,
    record,
    remove,
    clear,
  };
};
