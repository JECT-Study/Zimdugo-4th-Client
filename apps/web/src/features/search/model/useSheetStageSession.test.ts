import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSheetStageSession } from "./useSheetStageSession";

type Stage = "full" | "half" | "mini" | "dismiss";

const renderSession = (initialVisibleHeightPx: number | null = 191) =>
  renderHook(() =>
    useSheetStageSession<Stage>({
      initialStage: "half",
      initialVisibleHeightPx,
    }),
  );

describe("useSheetStageSession", () => {
  it("시트가 재기 전에는 준 가정값을 그대로 쓴다", () => {
    const { result } = renderSession(191);

    expect(result.current.snapStage).toBe("half");
    expect(result.current.visibleHeightPx).toBe(191);
  });

  /**
   * 단계와 높이는 늘 같은 틱에 함께 바뀌어야 한다. 따로 두면 지도 컨트롤이 한 프레임
   * 동안 옛 높이와 새 단계를 함께 보게 된다.
   */
  it("시트가 알려 온 단계와 높이를 함께 받는다", () => {
    const { result } = renderSession();

    act(() => result.current.handleSnapStageChange("full", 640));

    expect(result.current.snapStage).toBe("full");
    expect(result.current.visibleHeightPx).toBe(640);
  });

  it("밀어 올릴 단계가 아니면 높이 자리에 null 이 온다", () => {
    const { result } = renderSession();

    act(() => result.current.handleSnapStageChange("dismiss", null));

    expect(result.current.snapStage).toBe("dismiss");
    expect(result.current.visibleHeightPx).toBeNull();
  });

  it("스냅 요청은 요청마다 새 id 를 받는다", () => {
    const { result } = renderSession();

    act(() => result.current.requestSnap("mini"));
    const first = result.current.snapRequest;
    act(() => result.current.requestSnap("full"));

    expect(first?.stage).toBe("mini");
    expect(result.current.snapRequest?.stage).toBe("full");
    expect(result.current.snapRequest?.id).toBeGreaterThan(first?.id ?? 0);
  });

  it("요청을 비우면 시트가 더 옮겨 가지 않는다", () => {
    const { result } = renderSession();

    act(() => result.current.requestSnap("mini"));
    act(() => result.current.clearSnapRequest());

    expect(result.current.snapRequest).toBeNull();
  });
});
