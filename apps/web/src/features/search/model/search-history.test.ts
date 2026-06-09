import { describe, expect, it } from "vitest";
import {
  createSearchHistoryEntry,
  formatSearchHistoryDateLabel,
  getSearchHistoryEntryId,
  upsertSearchHistoryEntry,
} from "./search-history";

describe("search-history", () => {
  it("keyword 중복은 searchedAt만 갱신하고 최신순으로 올린다", () => {
    const first = createSearchHistoryEntry(
      { kind: "keyword", query: "코엑스" },
      "2026-06-01T10:00:00.000Z",
    );
    const initial = [first];
    const next = upsertSearchHistoryEntry(
      initial,
      { kind: "keyword", query: "코엑스" },
      { searchedAt: "2026-06-09T12:00:00.000Z" },
    );

    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe(getSearchHistoryEntryId({ kind: "keyword", query: "코엑스" }));
    expect(next[0]?.searchedAt).toBe("2026-06-09T12:00:00.000Z");
  });

  it("locker는 id 기준으로 dedup한다", () => {
    const entries = upsertSearchHistoryEntry([], {
      kind: "locker",
      lockerId: 10,
      title: "A 보관함",
      searchDraft: "강남",
    });
    const next = upsertSearchHistoryEntry(entries, {
      kind: "locker",
      lockerId: 10,
      title: "A 보관함",
      searchDraft: "강남역",
    });

    expect(next).toHaveLength(1);
    expect(next[0]?.kind).toBe("locker");
    if (next[0]?.kind === "locker") {
      expect(next[0].searchDraft).toBe("강남역");
    }
  });

  it("place는 id 기준으로 dedup한다", () => {
    const entries = upsertSearchHistoryEntry([], {
      kind: "place",
      placeId: 7,
      title: "코엑스",
      searchDraft: "삼성",
    });
    const next = upsertSearchHistoryEntry(entries, {
      kind: "place",
      placeId: 7,
      title: "코엑스몰",
      searchDraft: "삼성역",
    });

    expect(next).toHaveLength(1);
    expect(next[0]?.kind).toBe("place");
    if (next[0]?.kind === "place") {
      expect(next[0].searchDraft).toBe("삼성역");
      expect(next[0].title).toBe("코엑스몰");
    }
  });

  it("날짜 라벨을 MM.DD 형식으로 포맷한다", () => {
    const searchedAt = new Date(2026, 5, 7, 12, 0, 0).toISOString();
    expect(formatSearchHistoryDateLabel(searchedAt)).toBe("06.07");
  });
});
