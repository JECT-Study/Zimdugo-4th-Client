// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDocumentTitle } from "./useDocumentTitle";

beforeEach(() => {
  document.title = "짐두고 (Zimdugo)";
});

afterEach(() => {
  cleanup();
});

describe("useDocumentTitle", () => {
  it("화면이 떠 있는 동안 제목을 바꾸고 떠나면 되돌린다", () => {
    const { unmount } = renderHook(() => useDocumentTitle("강남역 보관함"));
    expect(document.title).toBe("강남역 보관함");

    unmount();
    expect(document.title).toBe("짐두고 (Zimdugo)");
  });

  it("제목이 null 이면 손대지 않는다", () => {
    renderHook(() => useDocumentTitle(null));
    expect(document.title).toBe("짐두고 (Zimdugo)");
  });

  it("다른 보관함으로 바뀌면 제목을 갈아 끼우고 떠날 때 처음 제목으로 돌아간다", () => {
    const { rerender, unmount } = renderHook(
      ({ title }) => useDocumentTitle(title),
      { initialProps: { title: "강남역 보관함" as string | null } },
    );
    rerender({ title: "역삼역 보관함" });
    expect(document.title).toBe("역삼역 보관함");

    unmount();
    expect(document.title).toBe("짐두고 (Zimdugo)");
  });

  it("그사이 다른 쪽이 제목을 바꿨으면 되돌리며 덮지 않는다", () => {
    const { unmount } = renderHook(() => useDocumentTitle("강남역 보관함"));
    document.title = "설정 | 짐두고";

    unmount();
    expect(document.title).toBe("설정 | 짐두고");
  });

  it("라우터가 제목을 덮었으면 다시 적용하고 떠날 때 원래 제목으로 돌아간다", () => {
    const { rerender, unmount } = renderHook(
      ({ key }) => useDocumentTitle("강남역 보관함", key),
      { initialProps: { key: "a" } },
    );
    // 같은 화면 안의 이동에서 라우터가 공통 제목으로 머리를 다시 그렸다.
    document.title = "짐두고 (Zimdugo)";
    rerender({ key: "b" });
    expect(document.title).toBe("강남역 보관함");

    unmount();
    expect(document.title).toBe("짐두고 (Zimdugo)");
  });

  it("덮이지 않았는데 다시 적용해도 떠날 때 원래 제목으로 돌아간다", () => {
    const { rerender, unmount } = renderHook(
      ({ key }) => useDocumentTitle("강남역 보관함", key),
      { initialProps: { key: "a" } },
    );
    rerender({ key: "b" });

    unmount();
    expect(document.title).toBe("짐두고 (Zimdugo)");
  });
});
