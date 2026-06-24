import { describe, expect, it, vi } from "vitest";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

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
          500: "#CACACA",
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
  const offsetX = content.match(/--offset-x: (-?\d+)px/)?.[1];
  const offsetY = content.match(/--offset-y: (-?\d+)px/)?.[1];

  if (offsetX == null || offsetY == null) return undefined;

  return `${offsetX},${offsetY}`;
};

const getMarkerItemClass = (content: string): string =>
  content.match(/class="map-marker-item ([^"]+)"/)?.[1] ?? "";

describe("createLockerMarkerIcon", () => {
  it("renders the default locker map pin asset", () => {
    const icon = createLockerMarkerIcon(createLockerPin());

    expect(icon).toContain("selected-map-pin.png");
    expect(icon).toContain('data-type="LOCKER"');
    expect(icon).toContain("object-fit: contain");
    expect(icon).toContain("<span");
  });

  it("renders the favorite locker map pin asset only when isFavorite is true", () => {
    const icon = createLockerMarkerIcon(createLockerPin({ isFavorite: true }));

    expect(icon).toContain("save-map-pin.png");
    expect(icon).toContain('data-type="LOCKER"');
  });

  it("renders the selected locker map pin asset", () => {
    const icon = createLockerMarkerIcon(createLockerPin(), true);

    expect(icon).toContain("selected-map-pin.png");
    expect(icon).toContain('data-type="LOCKER"');
  });

  it("renders place markers with the default map pin and a count badge", () => {
    const icon = createLockerMarkerIcon(createPlacePin({ lockerCount: 12 }));

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain("selected-map-pin.png");
    expect(icon).toContain(`fill="${MOCK_MARKER_FILL}"`);
    expect(icon).toContain(">9+<");
    expect(icon).toContain("<text");
    expect(icon).toContain("<span");
    expect(icon).toContain('width="42"');
    expect(icon).toContain("left: 54.5px; top: 9px");
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
    expect(options.icon?.content).toContain("selected-map-pin.png");
    expect(options.icon?.size).toMatchObject({ width: 55, height: 88 });
    expect(options.icon?.anchor).toMatchObject({ x: 27.5, y: 88 });
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

    expect(options.icon?.content).toContain("selected-map-pin.png");
    expect(options.icon?.size).toMatchObject({ width: 55, height: 88 });
    expect(options.icon?.anchor).toMatchObject({ x: 27.5, y: 88 });
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

    expect(options.icon?.content).toContain("save-map-pin.png");
    expect(options.icon?.size).toMatchObject({ width: 58, height: 88 });
    expect(options.icon?.anchor).toMatchObject({ x: 29, y: 88 });
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
      icon?: { content?: string; size?: FakeSize };
    };

    expect(options.icon?.content).toContain("map-marker-item");
    expect(options.icon?.content).toContain('data-type="PLACE"');
    expect(options.icon?.content).toContain("selected-map-pin.png");
    expect(options.icon?.content).toContain(">3<");
    expect(options.icon?.size).toMatchObject({ width: 88, height: 98 });
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
    );
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
      "save-map-pin.png",
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

    expect(content1).toContain("map-marker-offset-active");
    expect(content1).toContain("--offset-x: 15px");
    expect(content1).toContain("--offset-y: 0px");

    expect(content2).toContain("map-marker-offset-active");
    expect(content2).toContain("--offset-x: -15px");
    expect(content2).toContain("--offset-y: 0px");
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

    expect(new Set(offsets)).toEqual(new Set(["15,0", "-7,13", "-8,-13"]));
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

    expect(locker102Content).toContain("--offset-x: -15px");
    expect(locker102Content).toContain("--offset-y: 0px");
    expect(locker101Content).toContain("--offset-x: 15px");
    expect(locker101Content).toContain("--offset-y: 0px");
  });

  it("does not apply offset to PLACE type markers even when coordinates are shared", () => {
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

    expect(content1).not.toContain("--offset-x");
    expect(content2).not.toContain("--offset-x");
    expect(content1).not.toContain("map-marker-offset-active");
    expect(content2).not.toContain("map-marker-offset-active");
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
    expect(content).toContain("--offset-x: 15px");
    expect(content).toContain("--offset-y: 0px");
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
    expect(content).toContain("map-marker-offset-active");
    expect(content).toContain("--offset-x: 15px");
    expect(content).toContain("--offset-y: 0px");
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
    })) as naver.maps.Map["getProjection"];
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

  it("does not activate offset transform for markers without offset", () => {
    FakeMarker.instances = [];

    const map = createMockMap();
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        createLockerPin({ lockerId: 101, latitude: 37.5, longitude: 127.0 }),
        createPlacePin({ placeId: 201, latitude: 37.5, longitude: 127.0 }),
      ],
    });

    const lockerContent = getMarkerContent(FakeMarker.instances[0]);
    const placeContent = getMarkerContent(FakeMarker.instances[1]);

    expect(lockerContent).toContain("map-marker-offset-wrapper");
    expect(placeContent).toContain("map-marker-offset-wrapper");
    expect(lockerContent).not.toContain("map-marker-offset-active");
    expect(placeContent).not.toContain("map-marker-offset-active");
    expect(lockerContent).not.toContain("--offset-x");
    expect(placeContent).not.toContain("--offset-x");
  });
});
