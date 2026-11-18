import { describe, expect, it } from "vitest";
import {
  createSearchHistoryEntry,
  formatSearchHistoryDateLabel,
  getSearchHistoryEntryId,
  resolveSearchHistorySelectionQuery,
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
    expect(next[0]?.id).toBe(
      getSearchHistoryEntryId({ kind: "keyword", query: "코엑스" }),
    );
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
      expect(next[0].searchDraft).toBe("A 보관함");
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
      expect(next[0].searchDraft).toBe("코엑스몰");
      expect(next[0].title).toBe("코엑스몰");
    }
  });

  it("자동완성으로 고른 보관함은 입력한 글자가 아니라 고른 이름을 검색어 초안으로 남긴다", () => {
    const entry = createSearchHistoryEntry({
      kind: "locker",
      lockerId: 164,
      title: "강남역 4번 출구 보관함",
      searchDraft: "강남",
    });

    expect(entry.kind === "locker" && entry.searchDraft).toBe(
      "강남역 4번 출구 보관함",
    );
  });

  it("이름에 검색어가 받지 않는 글자가 있으면 공백으로 바꿔 남긴다", () => {
    const entry = createSearchHistoryEntry({
      kind: "locker",
      lockerId: 164,
      title: "강남역 1, 12번 출구 표 내는 곳 주변",
      searchDraft: "강남",
    });

    expect(entry.kind === "locker" && entry.searchDraft).toBe(
      "강남역 1 12번 출구 표 내는 곳 주변",
    );
    if (entry.kind === "locker") {
      // 다시 고를 때 검색창과 검색 결과에 그대로 쓸 수 있어야 한다.
      expect(resolveSearchHistorySelectionQuery(entry)).toBe(
        "강남역 1 12번 출구 표 내는 곳 주변",
      );
    }
  });

  it("이름이 검색어가 될 수 없으면 입력했던 글자를 남긴다", () => {
    const entry = createSearchHistoryEntry({
      kind: "place",
      placeId: 7,
      title: "###",
      searchDraft: "삼성",
    });

    expect(entry.kind === "place" && entry.searchDraft).toBe("삼성");
  });

  it("날짜 라벨을 MM.DD 형식으로 포맷한다", () => {
    const searchedAt = new Date(2026, 5, 7, 12, 0, 0).toISOString();
    expect(formatSearchHistoryDateLabel(searchedAt)).toBe("06.07");
  });

  it("locker/place 선택 검색어는 searchDraft를 우선하고 없으면 title을 사용한다", () => {
    expect(
      resolveSearchHistorySelectionQuery({
        kind: "locker",
        id: "locker:10",
        lockerId: 10,
        title: "강남역 보관함",
        searchDraft: " 강남 ",
        searchedAt: "2026-06-09T12:00:00.000Z",
      }),
    ).toBe("강남");

    expect(
      resolveSearchHistorySelectionQuery({
        kind: "place",
        id: "place:7",
        placeId: 7,
        title: "코엑스",
        searchDraft: "",
        searchedAt: "2026-06-09T12:00:00.000Z",
      }),
    ).toBe("코엑스");
  });
});
