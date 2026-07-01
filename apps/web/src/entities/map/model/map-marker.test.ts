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

import { createLockerMarkerIcon, syncLockerMarkers } from "./map-marker";

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

describe("createLockerMarkerIcon", () => {
  it("renders the default locker map pin asset", () => {
    const icon = createLockerMarkerIcon(createLockerPin());

    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain('data-map-pin-variant="default"');
    expect(icon).toContain('viewBox="0 0 90 90"');
    expect(icon).toContain('width="100%" height="100%"');
    expect(icon).not.toContain('<svg width="90" height="90"');
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
    expect(icon).toContain(`stroke="${MOCK_MARKER_FILL}" stroke-width="3"`);
    expect(icon).toContain('fill="white"');
  });

  it("renders the favorite locker map pin asset only when isFavorite is true", () => {
    const icon = createLockerMarkerIcon(createLockerPin({ isFavorite: true }));

    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain('data-map-pin-variant="save"');
    expect(icon).toContain('width="100%" height="100%"');
    expect(icon).not.toContain('<svg width="90" height="90"');
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
  });

  it("keeps the default locker asset when the locker is selected", () => {
    const icon = createLockerMarkerIcon(createLockerPin(), true);

    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain('data-map-pin-variant="default"');
    expect(icon).toContain(`stroke="${MOCK_MARKER_FILL}" stroke-width="3"`);
  });

  it("renders inactive locker markers in gray", () => {
    const icon = createLockerMarkerIcon(
      createLockerPin({ markerStatus: "inactive" }),
      true,
    );

    expect(icon).toContain('data-map-pin-variant="inactive"');
    expect(icon).toContain(`fill="${MOCK_INACTIVE_MARKER_FILL}"`);
    expect(icon).toContain(
      `stroke="${MOCK_INACTIVE_MARKER_FILL}" stroke-width="3"`,
    );
  });

  it("renders place markers with the same default map pin as lockers", () => {
    const icon = createLockerMarkerIcon(createPlacePin({ lockerCount: 12 }));

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain('data-map-pin-variant="default"');
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
    expect(icon).toContain('fill="white"');
    expect(icon).toContain(`stroke="${MOCK_MARKER_FILL}" stroke-width="3"`);
    expect(icon).not.toContain(`text-anchor="middle"`);
    expect(icon).not.toContain(">9+<");
    expect(icon).not.toContain("<text");
    expect(icon).toContain('viewBox="0 0 90 90"');
    expect(icon).toContain('width="100%" height="100%"');
    expect(icon).not.toContain('width="121" height="121"');
  });

  it("renders inactive place markers in gray", () => {
    const icon = createLockerMarkerIcon(
      createPlacePin({ markerStatus: "inactive", lockerCount: 12 }),
    );

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain('data-map-pin-variant="inactive"');
    expect(icon).toContain(`fill="${MOCK_INACTIVE_MARKER_FILL}"`);
    expect(icon).toContain(
      `stroke="${MOCK_INACTIVE_MARKER_FILL}" stroke-width="3"`,
    );
    expect(icon).not.toContain(`text-anchor="middle"`);
  });

  it("renders cluster markers for count < 10 (S size)", () => {
    const icon = createLockerMarkerIcon(createClusterPin({ pinCount: 5 }));

    expect(icon).toContain('data-type="CLUSTER"');
    expect(icon).toContain('data-map-pin-variant="cluster"');
    expect(icon).toContain('viewBox="0 0 330 330"');
    expect(icon).toContain(">5<");
    expect(icon).toContain('font-size="76"');
    expect(icon).toContain('fill-opacity="0.64"');
    expect(icon).toContain('font-weight="700"');
  });

  it("renders cluster markers for count >= 10 (L size)", () => {
    const icon = createLockerMarkerIcon(createClusterPin({ pinCount: 15 }));

    expect(icon).toContain('data-type="CLUSTER"');
    expect(icon).toContain('data-map-pin-variant="cluster"');
    expect(icon).toContain('viewBox="0 0 440 440"');
    expect(icon).toContain(">15<");
    expect(icon).toContain('font-size="78"');
  });
});

describe("syncLockerMarkers", () => {
  it("creates locker markers and removes them on cleanup", () => {
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

  it("uses an HTML icon option for locker markers", () => {
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

  it("uses the selected locker map pin dimensions", () => {
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

  it("uses the favorite locker map pin dimensions", () => {
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

  it("uses an HTML icon option for place markers", () => {
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
    expect(options.icon?.content).toContain('data-map-pin-variant="default"');
    expect(options.icon?.content).not.toContain(">3<");
    expect(options.icon?.content).toContain('width="100%" height="100%"');
    expect(options.icon?.content).not.toContain('width="121" height="121"');
    expect(options.icon?.size).toMatchObject({ width: 44, height: 44 });
    expect(options.icon?.anchor).toMatchObject({ x: 22, y: 22 });
  });

  it("uses S size and anchor for cluster markers with < 10 items", () => {
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

  it("uses L size and anchor for cluster markers with >= 10 items", () => {
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

  it("passes pin type and id when a locker marker is clicked", () => {
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

  it("passes place id when a place marker is clicked", () => {
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

  it("uses the latest cluster click handler when reusing an existing marker", () => {
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

  it("removes click listeners on cleanup", () => {
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

  it("keeps an existing click listener when the same pin id and handler are synced", () => {
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

  it("reuses an existing marker for the same pin", () => {
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

  it("skips marker updates when the pin data is unchanged", () => {
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

  it("updates an existing locker marker when favorite state changes", () => {
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
  });

  it("raises the selected marker above nearby markers", () => {
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

  it("keeps marker hit boxes aligned to visible marker dimensions", () => {
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
      width: 44,
      height: 44,
    });
    expect(placeOptions.icon?.anchor).toMatchObject({ x: 22, y: 22 });
  });

  it("spreads nearby locker and place markers instead of relying on z-index", () => {
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
      x: 46,
      y: 22,
    });
    expectMarkerAnchorToMatch(FakeMarker.instances[1], {
      x: -2,
      y: 22,
    });
  });

  it("applies spread class and styles when spreadCenter is provided", () => {
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

  it("skips icon updates after creating a spread marker with unchanged pin data", () => {
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

  it("applies different offsets when two lockers share the same coordinates", () => {
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

  it("keeps a preserved offset when only the selected marker is rendered", () => {
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

  it("distributes three or more lockers with the same coordinates", () => {
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

  it("keeps the same locker offset when server response order changes", () => {
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

  it("applies offset to PLACE type markers when coordinates are shared", () => {
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
      x: 46,
      y: 22,
    });
  });

  it("keeps offset styles when an existing spread marker icon is updated", () => {
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

  it("does not replay spread animation when a spread marker becomes selected", () => {
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

  it("does not replay spread animation when a selected spread marker is unselected", () => {
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

  it("keeps selected state in marker classes without changing icon variant", () => {
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

  it("does not update unrelated spread markers when selection changes after map projection changes", () => {
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

  it("does not activate offset transform for markers far enough apart", () => {
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
