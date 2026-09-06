// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import { MapSelectionProvider, useMapSelection } from "./MapSelectionProvider";

afterEach(() => {
  cleanup();
});

const pin = (lockerId: number) =>
  ({ pinType: "LOCKER", lockerId }) as unknown as LockerPinItemResponse;

function Reader() {
  const { selectedPinId, selectedPin } = useMapSelection();
  return (
    <span data-testid="reader">
      {`${selectedPinId ?? "none"}/${
        (selectedPin as unknown as { lockerId?: number })?.lockerId ?? "none"
      }`}
    </span>
  );
}

describe("MapSelectionProvider", () => {
  it("아래에서 지금 선택을 읽는다", () => {
    render(
      <MapSelectionProvider
        value={{ selectedPinId: "LOCKER-164", selectedPin: pin(164) }}
      >
        <Reader />
      </MapSelectionProvider>,
    );

    expect(screen.getByTestId("reader").textContent).toBe("LOCKER-164/164");
  });

  /**
   * 둘의 출처가 다르다. 지도에서 고른 핀은 원본을 들고 있지만, 딥링크나 목록에서 연
   * 상세는 보관함 번호만 알아 id 만 선다. 원본이 없다고 선택이 없는 것이 아니다.
   */
  it("원본 없이 id 만 있는 선택도 그대로 내려간다", () => {
    render(
      <MapSelectionProvider
        value={{ selectedPinId: "LOCKER-164", selectedPin: null }}
      >
        <Reader />
      </MapSelectionProvider>,
    );

    expect(screen.getByTestId("reader").textContent).toBe("LOCKER-164/none");
  });

  it("감싸지 않고 쓰면 그 자리에서 알려 준다", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<Reader />)).toThrow(
      "useMapSelection must be used within MapSelectionProvider.",
    );

    consoleError.mockRestore();
  });
});
