import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEARCH_HISTORY_STORAGE_KEY } from "./search-history";

const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

describe("search-history-storage", () => {
  beforeEach(() => {
    const storage = createLocalStorageMock();
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", { localStorage: storage });
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("localStorage 읽기 실패 시 빈 배열을 반환한다", async () => {
    const storage = createLocalStorageMock();
    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    vi.stubGlobal("localStorage", storage);
    vi.resetModules();

    const { readSearchHistoryEntries } = await import("./search-history-storage");

    expect(readSearchHistoryEntries()).toEqual([]);
  });

  it("localStorage 쓰기 실패 시 예외를 전파하지 않는다", async () => {
    const storage = createLocalStorageMock();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    vi.stubGlobal("localStorage", storage);
    vi.resetModules();

    const { writeSearchHistoryEntries } = await import("./search-history-storage");

    expect(() =>
      writeSearchHistoryEntries([
        {
          kind: "keyword",
          id: "keyword:코엑스",
          query: "코엑스",
          searchedAt: "2026-06-09T12:00:00.000Z",
        },
      ]),
    ).not.toThrow();
  });

  it("저장한 검색 히스토리를 읽어온다", async () => {
    const { writeSearchHistoryEntries, readSearchHistoryEntries } = await import(
      "./search-history-storage"
    );
    const entries = [
      {
        kind: "keyword" as const,
        id: "keyword:강남",
        query: "강남",
        searchedAt: "2026-06-09T12:00:00.000Z",
      },
    ];

    writeSearchHistoryEntries(entries);

    expect(readSearchHistoryEntries()).toEqual(entries);
    expect(localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY)).toBe(
      JSON.stringify(entries),
    );
  });
});
