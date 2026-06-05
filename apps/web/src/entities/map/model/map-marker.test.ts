import { describe, expect, it, vi } from "vitest";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

const MOCK_ERROR_COLOR = "#FF4D4F";
const MOCK_MARKER_BACKGROUND = "#F5F5F5";
const MOCK_MARKER_FILL = "#3BD569";

vi.mock("@repo/ui/vars", () => ({
  vars: {
    color: {
      icon: {
        error: "#FF4D4F",
      },
      palette: {
        gray: {
          100: "#F5F5F5",
        },
        green: {
          500: "#3BD569",
        },
      },
    },
  },
}));

import { createLockerMarkerIcon, syncLockerMarkers } from "./map-marker";

class FakeLatLng {
  constructor(
    public readonly lat: number,
    public readonly lng: number,
  ) {}
}

class FakeMarker {
  static instances: FakeMarker[] = [];

  public readonly setMap = vi.fn();
  public readonly listeners: Array<() => void> = [];

  constructor(public readonly options: Record<string, unknown>) {
    FakeMarker.instances.push(this);
  }
}

const createLockerPin = (
  overrides: Partial<LockerPinItemResponse> = {},
): LockerPinItemResponse => ({
  pinType: "LOCKER",
  placeId: null,
  lockerId: 42,
  latitude: 37.4979,
  longitude: 127.0276,
  ...overrides,
});

const createPlacePin = (
  overrides: Partial<LockerPinItemResponse> = {},
): LockerPinItemResponse => ({
  pinType: "PLACE",
  placeId: 7,
  lockerId: null,
  latitude: 37.5547,
  longitude: 126.9706,
  lockerCount: 3,
  ...overrides,
});

const createFakeMaps = () =>
  ({
    LatLng: FakeLatLng,
    Marker: FakeMarker,
    Event: {
      addListener: vi.fn(
        (instance: FakeMarker, eventName: string, handler: () => void) => {
          if (eventName === "click") {
            instance.listeners.push(handler);
          }
          return { eventName, id: instance.listeners.length + 1 };
        },
      ),
      removeListener: vi.fn(),
    },
  }) as unknown as typeof naver.maps;

describe("createLockerMarkerIcon", () => {
  it("24x24 컨테이너에 디자인 토큰 기반 마커 SVG를 포함한다", () => {
    const icon = createLockerMarkerIcon(createLockerPin());

    expect(icon).toContain('width="24"');
    expect(icon).toContain('height="24"');
    expect(icon).toContain('viewBox="0 0 24 24"');
    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain(
      `<circle cx="12" cy="12" r="12" fill="${MOCK_MARKER_BACKGROUND}"/>`,
    );
    expect(icon).toContain(
      '<svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22"',
    );
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
  });

  it("장소 핀에는 보관함 개수 배지를 표시한다", () => {
    const icon = createLockerMarkerIcon(createPlacePin({ lockerCount: 12 }));

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain(">9+<");
    expect(icon).toContain(`fill="${MOCK_ERROR_COLOR}"`);
  });
});

describe("syncLockerMarkers", () => {
  it("보관함 마커를 만들고 cleanup 때 지도에서 제거한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();

    const cleanup = syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin()],
    });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(FakeMarker.instances[0]?.options).toMatchObject({
      map,
      title: "보관함",
    });
    expect(FakeMarker.instances[0]?.options.position).toBeInstanceOf(
      FakeLatLng,
    );

    cleanup();

    expect(FakeMarker.instances[0]?.setMap).toHaveBeenCalledWith(null);
    expect(maps.Event.removeListener).not.toHaveBeenCalled();
  });

  it("마커 옵션에 SVG 문자열을 전달한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin()],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string };
    };

    expect(options.icon?.content).toContain('data-type="LOCKER"');
  });

  it("보관함 마커 클릭 때 핀 유형과 id를 전달한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();
    const handleSelectLocker = vi.fn();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ lockerId: 42 })],
      onSelectLocker: handleSelectLocker,
    });

    FakeMarker.instances[0]?.listeners[0]?.();

    expect(handleSelectLocker).toHaveBeenCalledWith("LOCKER", 42);
  });

  it("장소 마커 클릭 때 장소 id를 전달한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();
    const handleSelectLocker = vi.fn();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createPlacePin({ placeId: 7 })],
      onSelectLocker: handleSelectLocker,
    });

    FakeMarker.instances[0]?.listeners[0]?.();

    expect(handleSelectLocker).toHaveBeenCalledWith("PLACE", 7);
  });

  it("onSelectLocker가 있으면 cleanup에서 click listener를 해제한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();

    const cleanup = syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin()],
      onSelectLocker: vi.fn(),
    });

    cleanup();

    expect(maps.Event.removeListener).toHaveBeenCalledTimes(1);
  });
});
