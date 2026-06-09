import { describe, expect, it, vi } from "vitest";

import { type MapViewport, subscribeMapIdle } from "./map-idle-controller";

class FakeLatLng {
  constructor(
    private readonly latValue: number,
    private readonly lngValue: number,
  ) {}
  lat() {
    return this.latValue;
  }
  lng() {
    return this.lngValue;
  }
}

class FakeLatLngBounds {
  constructor(
    private readonly ne: FakeLatLng,
    private readonly sw: FakeLatLng,
  ) {}
  getNE() {
    return this.ne;
  }
  getSW() {
    return this.sw;
  }
}

interface FakeMapState {
  center: FakeLatLng;
  zoom: number;
  bounds: FakeLatLngBounds;
}

const createFakeMap = (overrides?: Partial<FakeMapState>) => {
  const state: FakeMapState = {
    center: new FakeLatLng(37.4979, 127.0276),
    zoom: 15,
    // bounds 폭: lat 0.01 (37.50 - 37.49), lng 0.03 (127.04 - 127.01)
    // 임계값 20% = lat 0.002, lng 0.006
    bounds: new FakeLatLngBounds(
      new FakeLatLng(37.5, 127.04),
      new FakeLatLng(37.49, 127.01),
    ),
    ...overrides,
  };
  return {
    state,
    map: {
      getCenter: vi.fn(() => state.center),
      getZoom: vi.fn(() => state.zoom),
      getBounds: vi.fn(() => state.bounds),
    } as unknown as naver.maps.Map,
  };
};

interface FakeMapsState {
  handlers: Array<() => void>;
  removed: unknown[];
}

const createFakeMaps = (state: FakeMapsState) =>
  ({
    Event: {
      addListener: vi.fn(
        (_instance: unknown, eventName: string, handler: () => void) => {
          if (eventName !== "idle") {
            throw new Error(`unexpected event: ${eventName}`);
          }
          state.handlers.push(handler);
          return { id: state.handlers.length };
        },
      ),
      removeListener: vi.fn((listener: unknown) => {
        state.removed.push(listener);
      }),
    },
  }) as unknown as typeof naver.maps;

const expectedInitialViewport: MapViewport = {
  center: { lat: 37.4979, lng: 127.0276 },
  zoom: 15,
  bounds: {
    northEast: { lat: 37.5, lng: 127.04 },
    southWest: { lat: 37.49, lng: 127.01 },
  },
};

describe("subscribeMapIdle", () => {
  it("emits current viewport immediately after subscription", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const { map } = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map, maps, onSettle });

    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(onSettle).toHaveBeenCalledWith(expectedInitialViewport);
  });

  it("첫 idle 이벤트에 현재 viewport 스냅샷을 발행한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const { map } = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map, maps, onSettle });
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(onSettle).toHaveBeenCalledWith(expectedInitialViewport);
  });

  it("Event.addListener는 'idle'에 정확히 1번 구독한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const { map } = createFakeMap();
    const maps = createFakeMaps(mapsState);

    subscribeMapIdle({ map, maps, onSettle: vi.fn() });

    expect(maps.Event.addListener).toHaveBeenCalledTimes(1);
    expect(maps.Event.addListener).toHaveBeenCalledWith(
      map,
      "idle",
      expect.any(Function),
    );
  });

  it("동일한 viewport로 다시 idle이 발생하면 onSettle을 호출하지 않는다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const { map } = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map, maps, onSettle });

    mapsState.handlers[0]?.();
    mapsState.handlers[0]?.();
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(1);
  });

  it("center가 bounds 폭의 20% 이상 이동하면 onSettle을 다시 호출한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();

    // lat 이동: 0.003 > bounds lat 폭(0.01) × 0.2(0.002) → 임계값 초과
    fake.state.center = new FakeLatLng(37.4979 + 0.003, 127.0276);
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(2);
    expect(onSettle).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: { lat: 37.4979 + 0.003, lng: 127.0276 },
      }),
    );
  });

  it("center 이동이 bounds 폭의 20% 미만이면 onSettle을 호출하지 않는다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();

    // lat 이동: 0.001 < bounds lat 폭(0.01) × 0.2(0.002) → 임계값 미만
    fake.state.center = new FakeLatLng(37.4979 + 0.001, 127.0276);
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(1);
  });

  it("center가 bounds 폭의 정확히 20% 이동하면 onSettle을 호출하지 않는다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap({
      center: new FakeLatLng(100, 127),
      bounds: new FakeLatLngBounds(
        new FakeLatLng(110, 130),
        new FakeLatLng(90, 120),
      ),
    });
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();

    // lat 이동: 4 = bounds lat 폭(20) × 0.2 → 임계값과 동일 (> 비교)
    fake.state.center = new FakeLatLng(104, 127);
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(1);
  });

  it("center 이동 없이 bounds span이 바뀌면 onSettle을 다시 호출한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();

    fake.state.bounds = new FakeLatLngBounds(
      new FakeLatLng(37.51, 127.05),
      new FakeLatLng(37.49, 127.01),
    );
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(2);
  });

  it("zoom이 바뀌면 onSettle을 다시 호출한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();

    fake.state.zoom = 16;
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(2);
    expect(onSettle).toHaveBeenLastCalledWith(
      expect.objectContaining({ zoom: 16 }),
    );
  });

  it("줌이 바뀌면 bounds 이동량 무관하게 onSettle을 다시 호출한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();

    // 줌만 변경 → center·bounds 이동 없어도 즉시 발행
    fake.state.zoom = 14;
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(2);
    expect(onSettle).toHaveBeenLastCalledWith(
      expect.objectContaining({ zoom: 14 }),
    );
  });

  it("bounds가 비어있으면 center 좌표로 안전하게 fallback 한다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    subscribeMapIdle({ map: fake.map, maps, onSettle });

    fake.state.bounds = null as unknown as FakeLatLngBounds;
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(2);
    expect(onSettle).toHaveBeenLastCalledWith(
      expect.objectContaining({
        center: { lat: 37.4979, lng: 127.0276 },
        bounds: {
          northEast: { lat: 37.4979, lng: 127.0276 },
          southWest: { lat: 37.4979, lng: 127.0276 },
        },
      }),
    );
  });

  it("cleanup 시 listener를 해제하고 이후 핸들러 호출은 onSettle을 일으키지 않는다", () => {
    const mapsState: FakeMapsState = { handlers: [], removed: [] };
    const fake = createFakeMap();
    const maps = createFakeMaps(mapsState);
    const onSettle = vi.fn();

    const cleanup = subscribeMapIdle({ map: fake.map, maps, onSettle });
    mapsState.handlers[0]?.();
    cleanup();

    fake.state.center = new FakeLatLng(37.5, 127.05);
    mapsState.handlers[0]?.();

    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(mapsState.removed).toHaveLength(1);
  });
});
