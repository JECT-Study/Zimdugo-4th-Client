// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { MapRuntimeValue } from "./MapRuntimeProvider";
import { MapRuntimeProvider, useMapRuntime } from "./MapRuntimeProvider";

afterEach(() => {
  cleanup();
});

const fakeMap = (label: string) => ({ label }) as unknown as naver.maps.Map;

const value = (map: naver.maps.Map | null): MapRuntimeValue => ({
  map,
  isLoading: false,
  hasError: false,
  camera: { focusOn: vi.fn(), fitBounds: vi.fn(), getZoom: vi.fn() },
  remount: vi.fn(),
  subscribeMapPress: vi.fn(() => () => {}),
});

function Reader() {
  const { map, isLoading, hasError } = useMapRuntime();
  return (
    <span data-testid="reader">
      {`${(map as unknown as { label?: string })?.label ?? "none"}/${isLoading}/${hasError}`}
    </span>
  );
}

describe("MapRuntimeProvider", () => {
  it("아래에서 지금 지도를 읽는다", () => {
    render(
      <MapRuntimeProvider value={value(fakeMap("current"))}>
        <Reader />
      </MapRuntimeProvider>,
    );

    expect(screen.getByTestId("reader").textContent).toBe(
      "current/false/false",
    );
  });

  it("지도가 바뀌면 아래도 바뀐 지도를 본다", () => {
    const { rerender } = render(
      <MapRuntimeProvider value={value(fakeMap("first"))}>
        <Reader />
      </MapRuntimeProvider>,
    );

    rerender(
      <MapRuntimeProvider value={value(fakeMap("second"))}>
        <Reader />
      </MapRuntimeProvider>,
    );

    expect(screen.getByTestId("reader").textContent).toBe("second/false/false");
  });

  /**
   * 지도가 없는 자리에서 조용히 null 을 돌려주면, 마커가 안 그려지는 이유를 화면에서
   * 되짚어야 한다. 감싸지 않고 쓴 것은 배치 실수라 그 자리에서 알려 준다.
   */
  it("감싸지 않고 쓰면 그 자리에서 알려 준다", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<Reader />)).toThrow(
      "useMapRuntime must be used within MapRuntimeProvider.",
    );

    consoleError.mockRestore();
  });
});
