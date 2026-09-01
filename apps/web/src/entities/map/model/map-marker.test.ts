import { describe, expect, it, vi } from "vitest";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

const MOCK_MARKER_FILL = "#3BD569";
const MOCK_INACTIVE_MARKER_FILL = "#CACACA";

vi.mock("@repo/ui/vars", () => ({
  vars: {
    color: {
      icon: {
        error: "#FF4D4F",
      },
      palette: {
        gray: {
          100: "#F5F5F5",
          500: "#CACACA",
          700: "#4B4B4B",
        },
        green: {
          500: "#3BD569",
        },
        red: {
          300: "#FF4D4F",
        },
      },
    },
  },
}));

import { createMapPinIcon, syncLockerMarkers } from "./map-marker";

class FakeLatLng {
  constructor(
    public readonly _lat: number,
    public readonly _lng: number,
  ) {}
  lat() {
    return this._lat;
  }
  lng() {
    return this._lng;
  }
}

class FakePoint {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}
}

class FakeSize {
  constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}
}

class FakeMarker {
  static instances: FakeMarker[] = [];

  private attachedMap: unknown = null;
  public readonly setMap = vi.fn((nextMap: unknown) => {
    this.attachedMap = nextMap;
  });
  public readonly getMap = vi.fn(() => this.attachedMap);
  public readonly setIcon = vi.fn();
  public readonly setPosition = vi.fn();
  public readonly setZIndex = vi.fn();
  public readonly setVisible = vi.fn((visible: boolean) => {
    this.visible = visible;
  });
  public readonly getVisible = vi.fn(() => this.visible);
  public readonly listeners: Array<() => void> = [];
  public visible = true;

  constructor(public readonly options: Record<string, unknown>) {
    this.attachedMap = options.map ?? null;
    FakeMarker.instances.push(this);
  }
}

const createLockerPin = (
  overrides: Partial<LockerPinItemResponse> = {},
): LockerPinItemResponse =>
  ({
    pinType: "LOCKER",
    placeId: null,
    lockerId: 42,
    latitude: 37.4979,
    longitude: 127.0276,
    ...overrides,
  }) as LockerPinItemResponse;

const createPlacePin = (
  overrides: Partial<LockerPinItemResponse> = {},
): LockerPinItemResponse =>
  ({
    pinType: "PLACE",
    placeId: 7,
    lockerId: null,
    latitude: 37.5547,
    longitude: 126.9706,
    lockerCount: 3,
    ...overrides,
  }) as LockerPinItemResponse;

const createClusterPin = (
  overrides: Partial<LockerPinItemResponse> = {},
): LockerPinItemResponse =>
  ({
    pinType: "CLUSTER",
    placeId: null,
    lockerId: null,
    latitude: 37.5547,
    longitude: 126.9706,
    pinCount: 5,
    bounds: {
      swLat: 37.55,
      swLng: 126.97,
      neLat: 37.56,
      neLng: 126.98,
    },
    ...overrides,
  }) as LockerPinItemResponse;

class FakeLatLngBounds {
  constructor(
    public readonly sw: FakeLatLng,
    public readonly ne: FakeLatLng,
  ) {}
  getSW() {
    return this.sw;
  }
  getNE() {
    return this.ne;
  }
  hasLatLng() {
    return true;
  }
}

const createMockMap = () =>
  ({
    getBounds: vi.fn(
      () =>
        new FakeLatLngBounds(
          new FakeLatLng(37.0, 126.0),
          new FakeLatLng(38.0, 128.0),
        ),
    ),
    getZoom: vi.fn(() => 15),
    getProjection: vi.fn(() => ({
      fromCoordToOffset: vi.fn((latlng: FakeLatLng) => {
        return new FakePoint(
          Math.round(latlng.lat() * 1000),
          Math.round(latlng.lng() * 1000),
        );
      }),
    })),
  }) as unknown as naver.maps.Map;

const createFakeMaps = () =>
  ({
    LatLng: FakeLatLng,
    Marker: FakeMarker,
    Point: FakePoint,
    Size: FakeSize,
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
    LatLngBounds: FakeLatLngBounds,
  }) as unknown as typeof naver.maps;

const getMarkerContent = (marker: FakeMarker | undefined): string => {
  const options = marker?.options as {
    icon?: { content?: string };
  };

  return options.icon?.content ?? "";
};

const getSetIconContent = (marker: FakeMarker | undefined): string => {
  const icon = marker?.setIcon.mock.calls.at(-1)?.[0] as
    | { content?: string }
    | undefined;

  return icon?.content ?? "";
};

const getOffsetStyle = (content: string): string | undefined => {
  const offsetX = content.match(/data-offset-x="(-?\d+)"/)?.[1];
  const offsetY = content.match(/data-offset-y="(-?\d+)"/)?.[1];

  if (offsetX == null || offsetY == null) return undefined;

  return `${offsetX},${offsetY}`;
};

const getMarkerAnchor = (marker: FakeMarker | undefined): FakePoint | null => {
  const options = marker?.options as {
    icon?: { anchor?: FakePoint };
  };

  return options.icon?.anchor ?? null;
};

const expectMarkerAnchorToMatch = (
  marker: FakeMarker | undefined,
  expected: { x: number; y: number },
) => {
  const anchor = getMarkerAnchor(marker);

  expect(anchor).not.toBeNull();
  expect(anchor?.x).toBeCloseTo(expected.x, 5);
  expect(anchor?.y).toBeCloseTo(expected.y, 5);
};

const getMarkerItemClass = (content: string): string =>
  content.match(/class="map-marker-item ([^"]+)"/)?.[1] ?? "";

describe("createMapPinIcon", () => {
  it("기본 보관함 핀 그림을 그린다", () => {
    const icon = createMapPinIcon(createLockerPin());

    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain('data-map-pin-variant="default"');
    expect(icon).toContain('viewBox="0 0 90 90"');
    expect(icon).toContain('width="100%" height="100%"');
    expect(icon).not.toContain('<svg width="90" height="90"');
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
    expect(icon).toContain(`stroke="${MOCK_MARKER_FILL}" stroke-width="3"`);
    expect(icon).toContain('fill="white"');
  });

  it("즐겨찾기 핀 그림은 isFavorite 일 때만 그린다", () => {
    const icon = createMapPinIcon(createLockerPin({ isFavorite: true }));

    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain('data-map-pin-variant="save"');
    expect(icon).toContain('width="100%" height="100%"');
    expect(icon).not.toContain('<svg width="90" height="90"');
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
  });

  it("선택된 보관함도 기본 그림을 그대로 쓴다", () => {
    const icon = createMapPinIcon(createLockerPin(), true);

    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain('data-map-pin-variant="default"');
    expect(icon).toContain(`stroke="${MOCK_MARKER_FILL}" stroke-width="3"`);
  });

  it("영업하지 않는 보관함 마커는 회색으로 그린다", () => {
    const icon = createMapPinIcon(
      createLockerPin({ markerStatus: "inactive" }),
      true,
    );

    expect(icon).toContain('data-map-pin-variant="inactive"');
    expect(icon).toContain(`fill="${MOCK_INACTIVE_MARKER_FILL}"`);
    expect(icon).toContain(
      `stroke="${MOCK_INACTIVE_MARKER_FILL}" stroke-width="3"`,
    );
  });

  it("장소 마커는 기본 핀에 개수 배지를 붙여 그린다", () => {
    const icon = createMapPinIcon(createPlacePin({ lockerCount: 12 }));

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain('data-map-pin-variant="cluster"');
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
    expect(icon).toContain('fill="white"');
    expect(icon).toContain(`stroke="${MOCK_MARKER_FILL}" stroke-width="3"`);
    expect(icon).toContain(`text-anchor="middle" fill="white"`);
    expect(icon).toContain(">9+<");
    expect(icon).toContain("<text");
    expect(icon).toContain('viewBox="0 0 121 121"');
    expect(icon).toContain('width="100%" height="100%"');
    expect(icon).not.toContain('width="121" height="121"');
  });

  it("영업하지 않는 장소 마커는 회색으로 그린다", () => {
    const icon = createMapPinIcon(
      createPlacePin({ markerStatus: "inactive", lockerCount: 12 }),
    );

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain('data-map-pin-variant="inactive"');
    expect(icon).toContain(`fill="${MOCK_INACTIVE_MARKER_FILL}"`);
    expect(icon).toContain(
      `stroke="${MOCK_INACTIVE_MARKER_FILL}" stroke-width="3"`,
    );
    expect(icon).toContain(`text-anchor="middle" fill="white"`);
  });

  it("10 개 미만 클러스터는 S 크기로 그린다", () => {
    const icon = createMapPinIcon(createClusterPin({ pinCount: 5 }));

    expect(icon).toContain('data-type="CLUSTER"');
    expect(icon).toContain('data-map-pin-variant="cluster"');
    expect(icon).toContain('viewBox="0 0 330 330"');
    expect(icon).toContain(">5<");
    expect(icon).toContain('font-size="76"');
    expect(icon).toContain('fill-opacity="0.64"');
    expect(icon).toContain('font-weight="700"');
  });

  it("10 개 이상 클러스터는 L 크기로 그린다", () => {
    const icon = createMapPinIcon(createClusterPin({ pinCount: 15 }));

    expect(icon).toContain('data-type="CLUSTER"');
    expect(icon).toContain('data-map-pin-variant="cluster"');
    expect(icon).toContain('viewBox="0 0 440 440"');
    expect(icon).toContain(">15<");
    expect(icon).toContain('font-size="78"');
  });
});

describe("syncLockerMarkers", () => {
  it("보관함 마커를 만들고 정리할 때 지운다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    const cleanup = syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin()],
    });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(FakeMarker.instances[0]?.options).toMatchObject({ map });
    expect(FakeMarker.instances[0]?.options.position).toBeInstanceOf(
      FakeLatLng,
    );

    cleanup();

    expect(FakeMarker.instances[0]?.setMap).toHaveBeenCalledWith(null);
    expect(maps.Event.removeListener).not.toHaveBeenCalled();
  });

  it("보관함 마커는 HTML 아이콘으로 넘긴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin()],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string; anchor?: FakePoint; size?: FakeSize };
    };

    expect(options.icon?.content).toContain("map-marker-item");
    expect(options.icon?.content).toContain('data-type="LOCKER"');
    expect(options.icon?.content).toContain('data-map-pin-variant="default"');
    expect(options.icon?.content).toContain('width="100%" height="100%"');
    expect(options.icon?.content).not.toContain('<svg width="90" height="90"');
    expect(options.icon?.size).toMatchObject({ width: 44, height: 44 });
    expect(options.icon?.anchor).toMatchObject({ x: 22, y: 22 });
  });

  it("선택된 보관함 핀의 크기를 쓴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin()],
      selectedPinId: "LOCKER-42",
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string; anchor?: FakePoint; size?: FakeSize };
    };

    expect(options.icon?.content).toContain('data-map-pin-variant="default"');
    expect(options.icon?.content).toContain("selected-active");
    expect(options.icon?.size).toMatchObject({ width: 44, height: 44 });
    expect(options.icon?.anchor).toMatchObject({ x: 22, y: 22 });
  });

  it("즐겨찾기 핀의 크기를 쓴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: true })],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string; anchor?: FakePoint; size?: FakeSize };
    };

    expect(options.icon?.content).toContain('data-map-pin-variant="save"');
    expect(options.icon?.size).toMatchObject({ width: 44, height: 44 });
    expect(options.icon?.anchor).toMatchObject({ x: 22, y: 22 });
  });

  it("장소 마커는 HTML 아이콘으로 넘긴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createPlacePin()],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string; anchor?: FakePoint; size?: FakeSize };
    };

    expect(options.icon?.content).toContain("map-marker-item");
    expect(options.icon?.content).toContain('data-type="PLACE"');
    expect(options.icon?.content).toContain('data-map-pin-variant="cluster"');
    expect(options.icon?.content).toContain(">3<");
    expect(options.icon?.content).toContain('width="100%" height="100%"');
    expect(options.icon?.content).not.toContain('width="121" height="121"');
    expect(options.icon?.size).toMatchObject({ width: 54.5, height: 54.5 });
    expect(options.icon?.anchor).toMatchObject({ x: 23.6, y: 28.4 });
  });

  it("10 개 미만 클러스터는 S 크기와 앵커를 쓴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createClusterPin({ pinCount: 5 })],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string; anchor?: FakePoint; size?: FakeSize };
    };

    expect(options.icon?.content).toContain('data-type="CLUSTER"');
    expect(options.icon?.size).toMatchObject({ width: 52, height: 52 });
    expect(options.icon?.anchor).toMatchObject({ x: 26, y: 26 });
  });

  it("10 개 이상 클러스터는 L 크기와 앵커를 쓴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createClusterPin({ pinCount: 15 })],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string; anchor?: FakePoint; size?: FakeSize };
    };

    expect(options.icon?.content).toContain('data-type="CLUSTER"');
    expect(options.icon?.size).toMatchObject({ width: 64, height: 64 });
    expect(options.icon?.anchor).toMatchObject({ x: 32, y: 32 });
  });

  it("보관함 마커를 누르면 핀 종류와 id 를 넘긴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const handleSelectLocker = vi.fn();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ lockerId: 42 })],
      onSelectLocker: handleSelectLocker,
    });

    FakeMarker.instances[0]?.listeners[0]?.();

    expect(handleSelectLocker).toHaveBeenCalledWith(
      "LOCKER",
      42,
      expect.any(Object),
      { offsetX: 0, offsetY: 0 },
    );
  });

  it("장소 마커를 누르면 장소 id 를 넘긴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const handleSelectLocker = vi.fn();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createPlacePin({ placeId: 7 })],
      onSelectLocker: handleSelectLocker,
    });

    FakeMarker.instances[0]?.listeners[0]?.();

    expect(handleSelectLocker).toHaveBeenCalledWith(
      "PLACE",
      7,
      expect.any(Object),
      { offsetX: 0, offsetY: 0 },
    );
  });

  it("마커를 재사용해도 클러스터 클릭 핸들러는 최신 것을 쓴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const firstClusterClick = vi.fn();
    const nextClusterClick = vi.fn();
    const pin = createClusterPin();

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin],
      onClusterClick: firstClusterClick,
      registry,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [pin],
      onClusterClick: nextClusterClick,
      registry,
    });

    FakeMarker.instances[0]?.listeners.at(-1)?.();

    expect(firstClusterClick).not.toHaveBeenCalled();
    expect(nextClusterClick).toHaveBeenCalledWith(pin.bounds);
  });

  it("정리할 때 클릭 리스너를 걷어낸다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
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

  it("같은 핀 id 와 핸들러면 리스너를 그대로 둔다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const handleSelectLocker = vi.fn();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ lockerId: 42, latitude: 37.5 })],
      onSelectLocker: handleSelectLocker,
      registry,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ lockerId: 42, latitude: 37.6 })],
      onSelectLocker: handleSelectLocker,
      registry,
    });

    FakeMarker.instances[0]?.listeners[0]?.();

    expect(maps.Event.addListener).toHaveBeenCalledTimes(1);
    expect(maps.Event.removeListener).not.toHaveBeenCalled();
    expect(handleSelectLocker).toHaveBeenCalledWith(
      "LOCKER",
      42,
      expect.objectContaining({ latitude: 37.6 }),
      { offsetX: 0, offsetY: 0 },
    );
  });

  it("같은 핀이면 있던 마커를 다시 쓴다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ latitude: 37.5 })],
      registry,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ latitude: 37.6 })],
      registry,
    });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(FakeMarker.instances[0]?.setMap).not.toHaveBeenCalled();
    expect(FakeMarker.instances[0]?.setPosition).toHaveBeenCalledWith(
      expect.any(FakeLatLng),
    );
  });

  it("핀 데이터가 그대로면 마커를 건드리지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin = createLockerPin();

    syncLockerMarkers({ map, maps, lockers: [pin], registry });
    syncLockerMarkers({ map, maps, lockers: [pin], registry });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(FakeMarker.instances[0]?.setPosition).not.toHaveBeenCalled();
    expect(FakeMarker.instances[0]?.setIcon).not.toHaveBeenCalled();
  });

  it("즐겨찾기가 되면 있던 마커에 애니메이션을 준다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: false })],
      registry,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: true })],
      registry,
    });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(getSetIconContent(FakeMarker.instances[0])).toContain(
      'data-map-pin-variant="save"',
    );
    expect(getSetIconContent(FakeMarker.instances[0])).toContain(
      "favorite-added",
    );

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: true })],
      registry,
    });

    expect(FakeMarker.instances[0]?.setIcon).toHaveBeenCalledTimes(1);
  });

  it("처음부터 즐겨찾기인 마커는 애니메이션하지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: true })],
      registry,
    });

    expect(getMarkerContent(FakeMarker.instances[0])).not.toContain(
      "favorite-added",
    );
  });

  it("가드가 끝나면 즐겨찾기 애니메이션 클래스를 뗀다", () => {
    vi.useFakeTimers();

    try {
      FakeMarker.instances = [];

      const map = createMockMap();
      const maps = createFakeMaps();
      const registry = new Map();

      syncLockerMarkers({
        map,
        maps,
        lockers: [createLockerPin({ isFavorite: false })],
        registry,
      });
      syncLockerMarkers({
        map,
        maps,
        lockers: [createLockerPin({ isFavorite: true })],
        registry,
      });

      vi.advanceTimersByTime(501);
      syncLockerMarkers({
        map,
        maps,
        lockers: [createLockerPin({ isFavorite: true })],
        registry,
      });

      expect(FakeMarker.instances[0]?.setIcon).toHaveBeenCalledTimes(2);
      expect(getSetIconContent(FakeMarker.instances[0])).not.toContain(
        "favorite-added",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("즐겨찾기를 풀 때는 애니메이션하지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: true })],
      registry,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ isFavorite: false })],
      registry,
    });

    expect(getSetIconContent(FakeMarker.instances[0])).not.toContain(
      "favorite-added",
    );
  });

  it("선택된 마커를 곁의 마커보다 위로 올린다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin1 = createLockerPin({ lockerId: 101 });
    const pin2 = createLockerPin({ lockerId: 102, latitude: 37.498 });

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      registry,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      selectedPinId: "LOCKER-102",
      registry,
    });

    const marker1Options = FakeMarker.instances[0]?.options as {
      zIndex?: number;
    };
    const marker2Options = FakeMarker.instances[1]?.options as {
      zIndex?: number;
    };

    expect(marker1Options.zIndex).toBe(10);
    expect(marker2Options.zIndex).toBe(10);
    expect(FakeMarker.instances[0]?.setZIndex).not.toHaveBeenCalled();
    expect(FakeMarker.instances[1]?.setZIndex).toHaveBeenCalledWith(20);
  });

  it("마커의 누르는 영역을 보이는 크기에 맞춘다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin(), createPlacePin()],
    });

    const lockerOptions = FakeMarker.instances[0]?.options as {
      icon?: { size?: FakeSize; anchor?: FakePoint };
    };
    const placeOptions = FakeMarker.instances[1]?.options as {
      icon?: { size?: FakeSize; anchor?: FakePoint };
    };

    expect(lockerOptions.icon?.size).toMatchObject({
      width: 44,
      height: 44,
    });
    expect(lockerOptions.icon?.anchor).toMatchObject({ x: 22, y: 22 });
    expect(placeOptions.icon?.size).toMatchObject({
      width: 54.5,
      height: 54.5,
    });
    expect(placeOptions.icon?.anchor).toMatchObject({ x: 23.6, y: 28.4 });
  });

  it("겹친 보관함·장소 마커는 z-index 대신 펼쳐서 가른다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        createPlacePin({ placeId: 201, latitude: 37.5, longitude: 127.0 }),
        createLockerPin({
          lockerId: 101,
          latitude: 37.50001,
          longitude: 127.0,
        }),
      ],
    });

    const placeContent = getMarkerContent(FakeMarker.instances[0]);
    const lockerContent = getMarkerContent(FakeMarker.instances[1]);

    expect(
      new Set([getOffsetStyle(placeContent), getOffsetStyle(lockerContent)]),
    ).toEqual(new Set(["-24,0", "24,0"]));
    expectMarkerAnchorToMatch(FakeMarker.instances[0], {
      x: 47.6,
      y: 28.4,
    });
    expectMarkerAnchorToMatch(FakeMarker.instances[1], {
      x: -2,
      y: 22,
    });
  });

  it("spreadCenter 가 오면 펼침 클래스와 스타일을 붙인다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [createLockerPin({ latitude: 37.4979, longitude: 127.0276 })],
      spreadCenter: { lat: 37.5547, lng: 126.9706 },
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string };
    };

    expect(options.icon?.content).toContain("spread");
    expect(options.icon?.content).toContain("--spread-x");
    expect(options.icon?.content).toContain("--spread-y");
  });

  it("펼친 마커도 핀 데이터가 그대로면 아이콘을 다시 만들지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin = createLockerPin();
    const spreadCenter = { lat: 37.5547, lng: 126.9706 };

    syncLockerMarkers({ map, maps, lockers: [pin], registry, spreadCenter });
    syncLockerMarkers({ map, maps, lockers: [pin], registry, spreadCenter });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(FakeMarker.instances[0]?.setIcon).not.toHaveBeenCalled();
  });

  it("좌표가 같은 보관함 둘은 서로 다른 자리로 민다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    const pin1 = createLockerPin({
      lockerId: 101,
      latitude: 37.5,
      longitude: 127.0,
    });
    const pin2 = createLockerPin({
      lockerId: 102,
      latitude: 37.5,
      longitude: 127.0,
    });

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
    });

    expect(FakeMarker.instances).toHaveLength(2);

    const content1 = getMarkerContent(FakeMarker.instances[0]);
    const content2 = getMarkerContent(FakeMarker.instances[1]);

    expect(content1).toContain('data-offset-x="24"');
    expect(content1).toContain('data-offset-y="0"');
    expectMarkerAnchorToMatch(FakeMarker.instances[0], {
      x: -2,
      y: 22,
    });

    expect(content2).toContain('data-offset-x="-24"');
    expect(content2).toContain('data-offset-y="0"');
    expectMarkerAnchorToMatch(FakeMarker.instances[1], {
      x: 46,
      y: 22,
    });
  });

  it("선택된 마커만 남아도 밀어 둔 자리를 지킨다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const pin = createLockerPin({ lockerId: 101 });

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin],
      selectedPinId: "LOCKER-101",
      preservedOffsets: new Map([["LOCKER-101", { offsetX: 24, offsetY: 0 }]]),
    });

    const content = getMarkerContent(FakeMarker.instances[0]);

    expect(content).toContain('data-offset-x="24"');
    expect(content).toContain('data-offset-y="0"');
    expectMarkerAnchorToMatch(FakeMarker.instances[0], {
      x: -2,
      y: 22,
    });
  });

  it("좌표가 같은 보관함이 셋 이상이어도 고르게 흩는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        createLockerPin({ lockerId: 101, latitude: 37.5, longitude: 127.0 }),
        createLockerPin({ lockerId: 102, latitude: 37.5, longitude: 127.0 }),
        createLockerPin({ lockerId: 103, latitude: 37.5, longitude: 127.0 }),
      ],
    });

    const offsets = FakeMarker.instances.map((marker) =>
      getOffsetStyle(getMarkerContent(marker)),
    );

    expect(new Set(offsets)).toEqual(new Set(["24,0", "-12,21", "-12,-21"]));
  });

  it("서버 응답 순서가 바뀌어도 같은 보관함은 같은 자리에 둔다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        createLockerPin({ lockerId: 102, latitude: 37.5, longitude: 127.0 }),
        createLockerPin({ lockerId: 101, latitude: 37.5, longitude: 127.0 }),
      ],
    });

    const locker102Content = getMarkerContent(FakeMarker.instances[0]);
    const locker101Content = getMarkerContent(FakeMarker.instances[1]);

    expect(locker102Content).toContain('data-offset-x="-24"');
    expect(locker102Content).toContain('data-offset-y="0"');
    expect(locker101Content).toContain('data-offset-x="24"');
    expect(locker101Content).toContain('data-offset-y="0"');
  });

  it("좌표가 겹치면 장소 마커도 자리를 민다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    const pin1 = createLockerPin({
      lockerId: 101,
      latitude: 37.5,
      longitude: 127.0,
    });
    const pin2 = createPlacePin({
      placeId: 201,
      latitude: 37.5,
      longitude: 127.0,
    });

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
    });

    expect(FakeMarker.instances).toHaveLength(2);

    const content1 = getMarkerContent(FakeMarker.instances[0]);
    const content2 = getMarkerContent(FakeMarker.instances[1]);

    expect(content1).toContain("data-offset-x");
    expect(content2).toContain("data-offset-x");
    expectMarkerAnchorToMatch(FakeMarker.instances[0], {
      x: -2,
      y: 22,
    });
    expectMarkerAnchorToMatch(FakeMarker.instances[1], {
      x: 47.6,
      y: 28.4,
    });
  });

  it("펼친 마커의 아이콘을 갱신해도 민 자리를 지킨다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin1 = createLockerPin({
      lockerId: 101,
      latitude: 37.5,
      longitude: 127.0,
    });
    const pin2 = createLockerPin({
      lockerId: 102,
      latitude: 37.5,
      longitude: 127.0,
    });
    const spreadCenter = { lat: 37.5547, lng: 126.9706 };

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      registry,
      spreadCenter,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      selectedPinId: "LOCKER-101",
      registry,
      spreadCenter,
    });

    const content = getSetIconContent(FakeMarker.instances[0]);

    expect(FakeMarker.instances[0]?.setIcon).toHaveBeenCalledTimes(1);
    expect(content).not.toContain("--spread-x");
    expect(content).not.toContain("--spread-y");
    expect(content).toContain('data-offset-x="24"');
    expect(content).toContain('data-offset-y="0"');
  });

  it("펼친 마커가 선택돼도 펼침 애니메이션을 다시 돌리지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin = createLockerPin({
      lockerId: 101,
      latitude: 37.5,
      longitude: 127.0,
    });
    const spreadCenter = { lat: 37.5547, lng: 126.9706 };

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin],
      registry,
      spreadCenter,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [pin],
      selectedPinId: "LOCKER-101",
      registry,
      spreadCenter,
    });

    const content = getSetIconContent(FakeMarker.instances[0]);
    const markerItemClass = getMarkerItemClass(content);

    expect(markerItemClass).toContain("selected-active");
    expect(markerItemClass).not.toContain("spread");
    expect(content).not.toContain("--spread-x");
    expect(content).not.toContain("--spread-y");
  });

  it("펼친 마커의 선택을 풀어도 펼침 애니메이션을 다시 돌리지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin1 = createLockerPin({
      lockerId: 101,
      latitude: 37.5,
      longitude: 127.0,
    });
    const pin2 = createLockerPin({
      lockerId: 102,
      latitude: 37.5,
      longitude: 127.0,
    });
    const spreadCenter = { lat: 37.5547, lng: 126.9706 };

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      selectedPinId: "LOCKER-101",
      registry,
      spreadCenter,
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      selectedPinId: "LOCKER-102",
      registry,
      spreadCenter,
    });

    const content = getSetIconContent(FakeMarker.instances[0]);
    const markerItemClass = getMarkerItemClass(content);

    expect(markerItemClass).toContain("unselected-active");
    expect(markerItemClass).not.toContain("spread");
    expect(content).not.toContain("--spread-x");
    expect(content).not.toContain("--spread-y");
    expect(content).toContain('data-offset-x="24"');
    expect(content).toContain('data-offset-y="0"');
  });

  it("선택 상태는 클래스로만 나타내고 아이콘 종류는 바꾸지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();
    const registry = new Map();
    const pin1 = createLockerPin({ lockerId: 101 });
    const pin2 = createLockerPin({ lockerId: 102 });

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      registry,
      selectedPinId: "LOCKER-101",
    });
    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2],
      registry,
      selectedPinId: "LOCKER-102",
    });

    expect(getSetIconContent(FakeMarker.instances[0])).toContain(
      'data-map-pin-variant="default"',
    );
    expect(getSetIconContent(FakeMarker.instances[1])).toContain(
      'data-map-pin-variant="default"',
    );
    expect(getSetIconContent(FakeMarker.instances[0])).toContain(
      "unselected-active",
    );
    expect(getSetIconContent(FakeMarker.instances[1])).toContain(
      "selected-active",
    );
  });

  it("투영이 바뀐 뒤 선택이 바뀌어도 무관한 펼친 마커는 건드리지 않는다", () => {
    FakeMarker.instances = [];

    let projectionScale = 1000;
    const map = createMockMap();
    map.getProjection = vi.fn(() => ({
      fromCoordToOffset: vi.fn((latlng: FakeLatLng) => {
        return new FakePoint(
          Math.round(latlng.lat() * projectionScale),
          Math.round(latlng.lng() * projectionScale),
        );
      }),
    })) as unknown as naver.maps.Map["getProjection"];
    const maps = createFakeMaps();
    const registry = new Map();
    const pin1 = createLockerPin({
      lockerId: 101,
      latitude: 37.5,
      longitude: 127.0,
    });
    const pin2 = createLockerPin({
      lockerId: 102,
      latitude: 37.5001,
      longitude: 127.0001,
    });
    const pin3 = createLockerPin({
      lockerId: 103,
      latitude: 37.5002,
      longitude: 127.0002,
    });
    const spreadCenter = { lat: 37.5547, lng: 126.9706 };

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2, pin3],
      selectedPinId: "LOCKER-101",
      registry,
      spreadCenter,
    });

    projectionScale = 1100;

    syncLockerMarkers({
      map,
      maps,
      lockers: [pin1, pin2, pin3],
      selectedPinId: "LOCKER-102",
      registry,
      spreadCenter,
    });

    expect(FakeMarker.instances[0]?.setIcon).toHaveBeenCalledTimes(1);
    expect(FakeMarker.instances[1]?.setIcon).toHaveBeenCalledTimes(1);
    expect(FakeMarker.instances[2]?.setIcon).not.toHaveBeenCalled();
  });

  it("충분히 떨어진 마커는 자리를 밀지 않는다", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        createLockerPin({ lockerId: 101, latitude: 37.5, longitude: 127.0 }),
        createPlacePin({ placeId: 201, latitude: 37.7, longitude: 127.0 }),
      ],
    });

    const lockerContent = getMarkerContent(FakeMarker.instances[0]);
    const placeContent = getMarkerContent(FakeMarker.instances[1]);

    expect(lockerContent).toContain("map-marker-offset-wrapper");
    expect(placeContent).toContain("map-marker-offset-wrapper");
    expect(lockerContent).not.toContain("data-offset-x");
    expect(placeContent).not.toContain("data-offset-x");
  });
});
