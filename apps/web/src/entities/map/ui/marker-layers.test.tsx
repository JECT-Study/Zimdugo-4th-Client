// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MapRuntimeValue } from "#/entities/map/model/MapRuntimeProvider";
import { MapRuntimeProvider } from "#/entities/map/model/MapRuntimeProvider";
import type { MapSelectionValue } from "#/entities/map/model/MapSelectionProvider";
import { MapSelectionProvider } from "#/entities/map/model/MapSelectionProvider";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

const useLockerMarkers = vi.fn();
const useSearchResultMarkers = vi.fn();

vi.mock("#/entities/map", () => ({
  useNaverMapSdk: () => ({ maps: null }),
}));
vi.mock("#/entities/map/model/useLockerMarkers", () => ({
  useLockerMarkers: (options: unknown) => useLockerMarkers(options),
}));
vi.mock("#/entities/map/model/useSearchResultMarkers", () => ({
  useSearchResultMarkers: (options: unknown) => useSearchResultMarkers(options),
}));

const { LockerMarkersLayer } = await import("./LockerMarkersLayer");
const { SearchResultMarkersLayer } = await import("./SearchResultMarkersLayer");

beforeEach(() => {
  useLockerMarkers.mockClear();
  useSearchResultMarkers.mockClear();
});

afterEach(() => {
  cleanup();
});

const fakeMap = () => ({}) as unknown as naver.maps.Map;

const runtime = (map: naver.maps.Map | null): MapRuntimeValue => ({
  map,
  isLoading: false,
  hasError: false,
  camera: { focusOn: vi.fn(), fitBounds: vi.fn(), getZoom: vi.fn() },
  remount: vi.fn(),
  subscribeMapPress: vi.fn(() => () => {}),
});

const noSelection: MapSelectionValue = {
  selectedPinId: null,
  selectedPin: null,
};

const withMap = (
  map: naver.maps.Map | null,
  children: ReactNode,
  selection: MapSelectionValue = noSelection,
) =>
  render(
    <MapRuntimeProvider value={runtime(map)}>
      <MapSelectionProvider value={selection}>{children}</MapSelectionProvider>
    </MapRuntimeProvider>,
  );

describe("LockerMarkersLayer", () => {
  it("화면에 아무것도 그리지 않는다", () => {
    const { container } = withMap(fakeMap(), <LockerMarkersLayer />);

    expect(container.innerHTML).toBe("");
  });

  /**
   * 이 층이 받는 이름과 훅이 받는 이름이 다르다. 잘못 이어도 타입은 통과하고 마커만
   * 조용히 안 눌린다. 이름이 바뀌어 넘어가는 자리라 못 박아 둔다.
   */
  it("핀 선택 핸들러를 훅의 onSelectLocker 자리로 넘긴다", () => {
    const onSelectPin = vi.fn();

    withMap(fakeMap(), <LockerMarkersLayer onSelectPin={onSelectPin} />);

    expect(useLockerMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ onSelectLocker: onSelectPin }),
    );
  });

  /**
   * 지도는 prop 이 아니라 컨텍스트에서 온다. 경로가 나뉘면 화면은 지도를 prop 으로 받을
   * 길이 없어서, 이 층이 컨텍스트를 보는 것이 계약이다.
   */
  it("지도를 컨텍스트에서 읽어 훅에 넘긴다", () => {
    const map = fakeMap();

    withMap(map, <LockerMarkersLayer />);

    expect(useLockerMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ map }),
    );
  });

  /**
   * 선택은 화면이 정하고 지도가 그린다. 경로가 나뉘면 시트와 마커 층이 다른 라우트에
   * 놓여 prop 으로 건널 수 없으므로, 컨텍스트를 보는 것이 계약이다.
   */
  it("선택된 핀을 컨텍스트에서 읽어 훅에 넘긴다", () => {
    const selectedPin = {
      pinType: "LOCKER",
      lockerId: 164,
    } as unknown as LockerPinItemResponse;

    withMap(fakeMap(), <LockerMarkersLayer />, {
      selectedPinId: "LOCKER-164",
      selectedPin,
    });

    expect(useLockerMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ selectedPinId: "LOCKER-164", selectedPin }),
    );
  });

  it("지도가 없어도 훅을 부른다", () => {
    withMap(null, <LockerMarkersLayer />);

    expect(useLockerMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ map: null }),
    );
  });
});

describe("SearchResultMarkersLayer", () => {
  const pins: LockerPinItemResponse[] = [];

  it("화면에 아무것도 그리지 않는다", () => {
    const { container } = withMap(
      fakeMap(),
      <SearchResultMarkersLayer pins={pins} onSelectLocker={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("선택된 핀 id 를 컨텍스트에서 읽어 훅에 넘긴다", () => {
    withMap(
      fakeMap(),
      <SearchResultMarkersLayer pins={pins} onSelectLocker={vi.fn()} />,
      { selectedPinId: "PLACE-900", selectedPin: null },
    );

    expect(useSearchResultMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ selectedPinId: "PLACE-900" }),
    );
  });

  it("받은 핀 목록과 컨텍스트의 지도를 함께 훅에 넘긴다", () => {
    const map = fakeMap();
    const onSelectLocker = vi.fn();

    withMap(
      map,
      <SearchResultMarkersLayer pins={pins} onSelectLocker={onSelectLocker} />,
    );

    expect(useSearchResultMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ map, pins, onSelectLocker }),
    );
  });
});
