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
  lat() { return this._lat; }
  lng() { return this._lng; }
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
  public readonly setVisible = vi.fn((visible: boolean) => { this.visible = visible; });
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
): LockerPinItemResponse => ({
  pinType: "LOCKER",
  placeId: null,
  lockerId: 42,
  latitude: 37.4979,
  longitude: 127.0276,
  ...overrides,
} as LockerPinItemResponse);

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
} as LockerPinItemResponse);

class FakeLatLngBounds {
  constructor(public readonly sw: FakeLatLng, public readonly ne: FakeLatLng) {}
  getSW() { return this.sw; }
  getNE() { return this.ne; }
  hasLatLng() { return true; }
}

const createMockMap = () => ({
  getBounds: vi.fn(() => new FakeLatLngBounds(new FakeLatLng(37.0, 126.0), new FakeLatLng(38.0, 128.0))),
  getZoom: vi.fn(() => 15),
} as unknown as naver.maps.Map);

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

describe("createLockerMarkerIcon", () => {
  it("renders a 24x24 locker marker SVG", () => {
    const icon = createLockerMarkerIcon(createLockerPin());

    expect(icon).toContain('width="100%"');
    expect(icon).toContain('height="100%"');
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

  it("renders place markers with a red marker icon and no count badge", () => {
    const icon = createLockerMarkerIcon(createPlacePin({ lockerCount: 12 }));

    expect(icon).toContain('data-type="PLACE"');
    expect(icon).toContain(`fill="${MOCK_ERROR_COLOR}"`);
    expect(icon).not.toContain(">9+<");
    expect(icon).not.toContain("<text");
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
      icon?: { content?: string; anchor?: FakePoint };
    };

    expect(options.icon?.content).toContain("map-marker-item");
    expect(options.icon?.content).toContain('data-type="LOCKER"');
    expect(options.icon?.anchor).toBeInstanceOf(FakePoint);
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
      icon?: { content?: string };
    };

    expect(options.icon?.content).toContain("map-marker-item");
    expect(options.icon?.content).toContain('data-type="PLACE"');
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

    expect(handleSelectLocker).toHaveBeenCalledWith("LOCKER", 42, expect.any(Object));
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

    expect(handleSelectLocker).toHaveBeenCalledWith("PLACE", 7, expect.any(Object));
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
});
