// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MapLocationProvider,
  type MapLocationValue,
  useMapLocation,
} from "./MapLocationProvider";

afterEach(() => {
  cleanup();
});

const createValue = (
  overrides: Partial<MapLocationValue> = {},
): MapLocationValue => ({
  permission: "prompt",
  isTracking: false,
  isLocating: false,
  location: null,
  error: null,
  requestStatus: "idle",
  startTracking: () => {},
  subscribeFirstLocation: () => () => {},
  subscribeRequestSettled: () => () => {},
  ...overrides,
});

function Reader() {
  const { permission, location, requestStatus } = useMapLocation();
  return (
    <span data-testid="reader">
      {`${permission}/${location ? `${location.lat},${location.lng}` : "none"}/${requestStatus}`}
    </span>
  );
}

describe("MapLocationProvider", () => {
  it("아래에서 지금 위치를 읽는다", () => {
    render(
      <MapLocationProvider
        value={createValue({
          permission: "granted",
          location: { lat: 37.5665, lng: 126.978, heading: null },
          requestStatus: "success",
        })}
      >
        <Reader />
      </MapLocationProvider>,
    );

    expect(screen.getByTestId("reader").textContent).toBe(
      "granted/37.5665,126.978/success",
    );
  });

  /**
   * 위치가 없는 것과 권한이 거부된 것은 다르다. 거부돼도 화면은 그려져야 하고,
   * 아직 못 받았을 뿐인 상태와 구분되어야 안내를 고를 수 있다.
   */
  it("권한이 거부돼 위치가 없어도 그대로 내려간다", () => {
    render(
      <MapLocationProvider
        value={createValue({
          permission: "denied",
          requestStatus: "permission-denied",
        })}
      >
        <Reader />
      </MapLocationProvider>,
    );

    expect(screen.getByTestId("reader").textContent).toBe(
      "denied/none/permission-denied",
    );
  });

  it("추적을 켜 달라는 명령이 쥔 쪽에 그대로 닿는다", () => {
    const startTracking = vi.fn();

    function Starter() {
      const location = useMapLocation();
      return (
        <button type="button" onClick={location.startTracking}>
          내 위치
        </button>
      );
    }

    render(
      <MapLocationProvider value={createValue({ startTracking })}>
        <Starter />
      </MapLocationProvider>,
    );
    screen.getByRole("button").click();

    expect(startTracking).toHaveBeenCalledTimes(1);
  });

  it("아래에서 건 구독이 쥔 쪽의 창구에 붙는다", () => {
    const subscribeFirstLocation = vi.fn(() => () => {});
    const subscribeRequestSettled = vi.fn(() => () => {});

    function Listener() {
      const {
        subscribeFirstLocation: first,
        subscribeRequestSettled: settled,
      } = useMapLocation();
      first(() => {});
      settled(() => {});
      return null;
    }

    render(
      <MapLocationProvider
        value={createValue({ subscribeFirstLocation, subscribeRequestSettled })}
      >
        <Listener />
      </MapLocationProvider>,
    );

    expect(subscribeFirstLocation).toHaveBeenCalled();
    expect(subscribeRequestSettled).toHaveBeenCalled();
  });

  it("감싸지 않고 쓰면 그 자리에서 알려 준다", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<Reader />)).toThrow(
      "useMapLocation must be used within MapLocationProvider.",
    );

    consoleError.mockRestore();
  });
});
