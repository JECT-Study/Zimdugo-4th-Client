// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from "vitest";
import { MapLocationProvider, useMapLocation } from "./MapLocationProvider";
import type {
  LocationData,
  LocationRequestOutcome,
} from "./useLocationTracking";
import { useMapLocationValue } from "./useMapLocationValue";

vi.mock("./location-diagnostics", () => ({
  postLocationDiagnostic: vi.fn(),
}));

const orientation = vi.hoisted(() => ({
  heading: null as number | null,
  isTracking: false,
  isSupported: null as boolean | null,
  requestPermission: vi.fn(async () => false),
  startTracking: vi.fn(),
  stopTracking: vi.fn(),
}));

vi.mock("#/shared/hooks/useDeviceOrientation", () => ({
  useDeviceOrientation: () => orientation,
}));

/**
 * 위치를 쥔 쪽(레이아웃)과 듣는 쪽(`<Outlet />` 의 화면)을 실제로 갈라 놓고 잰다.
 *
 * 이 조각이 옮긴 것은 소유다. 훅 하나만 렌더하면 소유가 위로 갔을 때 알림이 아래까지
 * 닿는지 — 이 변경의 유일한 위험 — 를 재지 못한다.
 */
function Owner({ children }: { children: React.ReactNode }) {
  return (
    <MapLocationProvider value={useMapLocationValue()}>
      {children}
    </MapLocationProvider>
  );
}

function OrientationScreen() {
  const { deviceHeading, isOrientationTracking, isOrientationSupported } =
    useMapLocation();
  return (
    <span data-testid="orientation">
      {`${deviceHeading}/${isOrientationTracking}/${isOrientationSupported}`}
    </span>
  );
}

function Screen() {
  const {
    permission,
    location,
    requestStatus,
    startTracking,
    subscribeFirstLocation,
    subscribeRequestSettled,
  } = useMapLocation();
  const [heard, setHeard] = useState<string[]>([]);
  const setHeardRef = useRef(setHeard);
  setHeardRef.current = setHeard;

  useEffect(
    () =>
      subscribeFirstLocation((first: LocationData) =>
        setHeardRef.current((prev) => [...prev, `first:${first.lat}`]),
      ),
    [subscribeFirstLocation],
  );
  useEffect(
    () =>
      subscribeRequestSettled((outcome: LocationRequestOutcome) =>
        setHeardRef.current((prev) => [...prev, `settled:${outcome}`]),
      ),
    [subscribeRequestSettled],
  );

  return (
    <div>
      <button type="button" onClick={startTracking}>
        내 위치
      </button>
      <span data-testid="read">{`${permission}/${location?.lat ?? "none"}/${requestStatus}`}</span>
      <span data-testid="heard">{heard.join(",")}</span>
    </div>
  );
}

const renderSplit = () =>
  render(
    <Owner>
      <Screen />
    </Owner>,
  );

const read = () => screen.getByTestId("read").textContent;
const heard = () => screen.getByTestId("heard").textContent;

describe("useMapLocationValue", () => {
  let watchPosition: Mock;

  beforeEach(() => {
    orientation.heading = null;
    orientation.isTracking = false;
    orientation.isSupported = null;
    orientation.stopTracking.mockClear();
    watchPosition = vi.fn().mockReturnValue(123);
    Object.defineProperty(global.navigator, "geolocation", {
      value: { watchPosition, clearWatch: vi.fn() },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global.navigator, "permissions", {
      value: {
        query: vi.fn().mockResolvedValue({
          state: "prompt",
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * 순서까지 잰다. `useLocationTracking` 은 결말을 먼저 알리고 첫 위치를 뒤에 알린다.
   * 화면은 그 순서에 기대고 있다. 결말 처리가 먼저 돌아 대기 중인 의도를 정리하고
   * (`resolveLocationRequestSettlement`), 성공일 때만 남겨 둔 의도를 첫 위치 처리가
   * 꺼내 쓴다. 뒤집히면 방향 추적 시작 요청이 소비되기 전에 지워진다.
   */
  it("쥔 쪽이 받은 첫 위치가 아래 화면까지 닿는다", async () => {
    renderSplit();

    await act(async () => {
      screen.getByRole("button").click();
    });
    await act(async () => {
      watchPosition.mock.calls[0][0]({
        coords: { latitude: 37.5665, longitude: 126.978, heading: null },
      });
    });

    expect(heard()).toBe("settled:success,first:37.5665");
  });

  it("쥔 쪽이 받은 위치를 아래 화면이 읽는다", async () => {
    renderSplit();

    await act(async () => {
      screen.getByRole("button").click();
    });
    await act(async () => {
      watchPosition.mock.calls[0][0]({
        coords: { latitude: 37.5665, longitude: 126.978, heading: null },
      });
    });

    expect(read()).toBe("granted/37.5665/success");
  });

  it("아래 화면이 누른 내 위치가 쥔 쪽의 추적을 켠다", async () => {
    renderSplit();

    expect(watchPosition).not.toHaveBeenCalled();
    await act(async () => {
      screen.getByRole("button").click();
    });

    expect(watchPosition).toHaveBeenCalledTimes(1);
  });

  it("쥔 쪽이 읽은 방향이 아래 화면까지 닿는다", () => {
    orientation.heading = 137;
    orientation.isTracking = true;
    orientation.isSupported = true;

    render(
      <Owner>
        <OrientationScreen />
      </Owner>,
    );

    expect(screen.getByTestId("orientation").textContent).toBe("137/true/true");
  });

  /**
   * 센서에만 딸린 규칙이라 센서를 쥔 쪽에서 스스로 한다. PC 처럼 방향을 알 수 없는
   * 기기에서 추적이 켜진 채 남으면 마커가 마지막 방향을 계속 가리킨다.
   */
  it("센서가 없다고 확정되면 켜 둔 방향 추적을 스스로 끈다", () => {
    orientation.isTracking = true;
    orientation.isSupported = false;

    renderSplit();

    expect(orientation.stopTracking).toHaveBeenCalledTimes(1);
  });

  it("아직 판단 전이면 방향 추적을 끄지 않는다", () => {
    orientation.isTracking = true;
    orientation.isSupported = null;

    renderSplit();

    expect(orientation.stopTracking).not.toHaveBeenCalled();
  });

  it("켜 둔 방향 추적이 없으면 끄러 들지 않는다", () => {
    orientation.isTracking = false;
    orientation.isSupported = false;

    renderSplit();

    expect(orientation.stopTracking).not.toHaveBeenCalled();
  });

  /**
   * 위치를 못 받은 결말도 화면이 들어야 한다. 오류 팝업과 복구 안내가 여기에 달려 있다.
   */
  it("거부된 요청의 결말도 아래 화면까지 닿는다", async () => {
    renderSplit();

    await act(async () => {
      screen.getByRole("button").click();
    });
    await act(async () => {
      watchPosition.mock.calls[0][1]({ code: 1, message: "denied" });
    });

    expect(heard()).toBe("settled:permission-denied");
    expect(read()).toBe("denied/none/permission-denied");
  });
});
