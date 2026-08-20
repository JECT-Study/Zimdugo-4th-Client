import { describe, expect, it } from "vitest";
import {
  MAP_CONTROL_FALLBACK_APP_MAX_WIDTH_PX,
  MAP_CONTROL_FALLBACK_BOTTOM_PX,
  MAP_CONTROL_FALLBACK_GAP_PX,
  MAP_CONTROL_FALLBACK_MAX_WIDTH,
  MAP_CONTROL_FALLBACK_SIDE_INSET,
  mapControlStackInlineFallbackStyle,
  mapControlStackPositionFallbackStyle,
} from "./map-control-stack-fallback";

describe("map-control-stack-fallback", () => {
  it("uses a centered fixed frame that matches the app max width", () => {
    expect(MAP_CONTROL_FALLBACK_APP_MAX_WIDTH_PX).toBe(430);
    expect(MAP_CONTROL_FALLBACK_MAX_WIDTH).toContain("430px");
    expect(mapControlStackPositionFallbackStyle).toMatchObject({
      position: "fixed",
      left: "50%",
      width: "100%",
      maxWidth: MAP_CONTROL_FALLBACK_MAX_WIDTH,
      transform: "translateX(-50%)",
      alignItems: "flex-end",
      boxSizing: "border-box",
      pointerEvents: "none",
    });
    expect(mapControlStackPositionFallbackStyle).not.toHaveProperty("right");
  });

  it("combines the right safe area with the default side inset", () => {
    expect(MAP_CONTROL_FALLBACK_SIDE_INSET).toBe(
      "max(16px, env(safe-area-inset-right, 0px))",
    );
    expect(mapControlStackInlineFallbackStyle.paddingRight).toBe(
      MAP_CONTROL_FALLBACK_SIDE_INSET,
    );
  });

  it("바텀 탭 없이 디자인 기준 하단 위치와 간격을 사용한다", () => {
    expect(MAP_CONTROL_FALLBACK_BOTTOM_PX).toBe(70);
    expect(MAP_CONTROL_FALLBACK_GAP_PX).toBe(12);
    expect(mapControlStackPositionFallbackStyle).toMatchObject({
      bottom: 70,
      gap: 12,
    });
  });
});
