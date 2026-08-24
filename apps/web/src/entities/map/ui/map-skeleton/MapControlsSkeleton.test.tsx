// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MAP_CONTROL_FALLBACK_BOTTOM_PX } from "#/entities/map/ui/map-control-stack-fallback";
import { MapControlsSkeleton } from "./MapControlsSkeleton";

afterEach(cleanup);

const getStack = () =>
  document.querySelector<HTMLElement>('[aria-hidden="true"]');

describe("MapControlsSkeleton", () => {
  it("실제 컨트롤과 같은 위치를 받아 그대로 배치한다", () => {
    // 상세 시트가 하프로 열린 화면에서 실제 컨트롤이 쓰는 값.
    render(<MapControlsSkeleton bottomPx={203} />);

    expect(getStack()?.style.bottom).toBe("203px");
  });

  it("시트가 없는 화면에서는 폴백 위치를 그대로 쓴다", () => {
    render(<MapControlsSkeleton bottomPx={MAP_CONTROL_FALLBACK_BOTTOM_PX} />);

    expect(getStack()?.style.bottom).toBe(
      `${MAP_CONTROL_FALLBACK_BOTTOM_PX}px`,
    );
  });

  it("로딩 표시라 접근성 트리에서 제외한다", () => {
    render(<MapControlsSkeleton bottomPx={203} />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(getStack()?.getAttribute("aria-hidden")).toBe("true");
  });
});
