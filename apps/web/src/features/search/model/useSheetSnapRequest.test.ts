// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSheetSnapRequest } from "./useSheetSnapRequest";

type Stage = "full" | "half" | "mini";

describe("useSheetSnapRequest", () => {
  it("issues a new id for every request", () => {
    const { result } = renderHook(() => useSheetSnapRequest<Stage>());

    expect(result.current.snapRequest).toBeNull();

    act(() => result.current.requestSnap("mini"));
    expect(result.current.snapRequest).toEqual({ id: 1, stage: "mini" });

    act(() => result.current.requestSnap("half"));
    expect(result.current.snapRequest).toEqual({ id: 2, stage: "half" });
  });

  it("keeps ids increasing after the request is cleared", () => {
    const { result } = renderHook(() => useSheetSnapRequest<Stage>());

    act(() => result.current.requestSnap("mini"));
    const clearedId = result.current.snapRequest?.id;

    act(() => result.current.clearSnapRequest());
    expect(result.current.snapRequest).toBeNull();

    // 되감긴 id 는 시트가 리마운트 시 기억해 둔 "마지막으로 처리한 id" 와 겹쳐서
    // 새 요청인데도 이미 처리한 요청으로 삼켜진다.
    act(() => result.current.requestSnap("mini"));
    expect(result.current.snapRequest?.id).toBeGreaterThan(clearedId ?? 0);
  });
});
