import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  type LockerMarkerBounds,
  subscribeNearbyLockersBounds,
} from "./map-bounds";

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

const createFakeMap = () => {
  const bounds = new FakeLatLngBounds(
    new FakeLatLng(37.6, 127.1),
    new FakeLatLng(37.5, 126.9),
  );
  return {
    getBounds: vi.fn(() => bounds),
  } as unknown as naver.maps.Map;
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
          if (eventName !== "bounds_changed") {
            throw new Error(`unexpected event: ${eventName}`);
          }
          state.handlers.push(handler);
          const listener = { id: state.handlers.length };
          return listener;
        },
      ),
      removeListener: vi.fn((listener: unknown) => {
        state.removed.push(listener);
      }),
    },
  }) as unknown as typeof naver.maps;

const expectedBounds: LockerMarkerBounds = {
  northEast: { lat: 37.6, lng: 127.1 },
  southWest: { lat: 37.5, lng: 126.9 },
};

describe("subscribeNearbyLockersBounds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("첫 bounds_changed에는 즉시(leading) 콜백을 호출하고 현재 bounds를 전달한다", () => {
    const state: FakeMapsState = { handlers: [], removed: [] };
    const map = createFakeMap();
    const maps = createFakeMaps(state);
    const onRequest = vi.fn();

    subscribeNearbyLockersBounds({
      map,
      maps,
      onRequestNearbyLockers: onRequest,
    });

    state.handlers[0]?.();

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onRequest).toHaveBeenCalledWith(expectedBounds);
  });

  it("연속된 bounds_changed를 throttle 한다 (leading 1회 + 마지막에 trailing 1회)", () => {
    const state: FakeMapsState = { handlers: [], removed: [] };
    const map = createFakeMap();
    const maps = createFakeMaps(state);
    const onRequest = vi.fn();

    subscribeNearbyLockersBounds({
      map,
      maps,
      onRequestNearbyLockers: onRequest,
      throttleMs: 300,
    });

    state.handlers[0]?.();
    vi.advanceTimersByTime(50);
    state.handlers[0]?.();
    vi.advanceTimersByTime(50);
    state.handlers[0]?.();
    vi.advanceTimersByTime(50);
    state.handlers[0]?.();

    expect(onRequest).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);

    expect(onRequest).toHaveBeenCalledTimes(2);
    expect(onRequest).toHaveBeenLastCalledWith(expectedBounds);
  });

  it("throttle 경계 이후의 이벤트는 즉시 다시 leading 호출한다", () => {
    const state: FakeMapsState = { handlers: [], removed: [] };
    const map = createFakeMap();
    const maps = createFakeMaps(state);
    const onRequest = vi.fn();

    subscribeNearbyLockersBounds({
      map,
      maps,
      onRequestNearbyLockers: onRequest,
      throttleMs: 300,
    });

    state.handlers[0]?.();
    expect(onRequest).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);

    state.handlers[0]?.();
    expect(onRequest).toHaveBeenCalledTimes(2);
  });

  it("cleanup 호출 시 listener와 pending trailing 호출을 모두 제거한다", () => {
    const state: FakeMapsState = { handlers: [], removed: [] };
    const map = createFakeMap();
    const maps = createFakeMaps(state);
    const onRequest = vi.fn();

    const cleanup = subscribeNearbyLockersBounds({
      map,
      maps,
      onRequestNearbyLockers: onRequest,
      throttleMs: 300,
    });

    state.handlers[0]?.();
    state.handlers[0]?.();
    expect(onRequest).toHaveBeenCalledTimes(1);

    cleanup();
    vi.advanceTimersByTime(1000);

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(state.removed).toHaveLength(1);
  });

  it("cleanup 이후 추가로 들어오는 핸들러 호출에도 콜백을 호출하지 않는다", () => {
    const state: FakeMapsState = { handlers: [], removed: [] };
    const map = createFakeMap();
    const maps = createFakeMaps(state);
    const onRequest = vi.fn();

    const cleanup = subscribeNearbyLockersBounds({
      map,
      maps,
      onRequestNearbyLockers: onRequest,
      throttleMs: 300,
    });

    cleanup();
    state.handlers[0]?.();
    vi.advanceTimersByTime(1000);

    expect(onRequest).not.toHaveBeenCalled();
  });

  it("Event.addListener는 'bounds_changed'에 정확히 1번 구독한다", () => {
    const state: FakeMapsState = { handlers: [], removed: [] };
    const map = createFakeMap();
    const maps = createFakeMaps(state);

    subscribeNearbyLockersBounds({
      map,
      maps,
      onRequestNearbyLockers: vi.fn(),
    });

    expect(maps.Event.addListener).toHaveBeenCalledTimes(1);
    expect(maps.Event.addListener).toHaveBeenCalledWith(
      map,
      "bounds_changed",
      expect.any(Function),
    );
  });
});
