// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

describe("LockerMarkersLayer", () => {
  it("화면에 아무것도 그리지 않는다", () => {
    const { container } = render(<LockerMarkersLayer map={fakeMap()} />);

    expect(container.innerHTML).toBe("");
  });

  /**
   * 이 층이 받는 이름과 훅이 받는 이름이 다르다. 잘못 이어도 타입은 통과하고 마커만
   * 조용히 안 눌린다. 이름이 바뀌어 넘어가는 자리라 못 박아 둔다.
   */
  it("핀 선택 핸들러를 훅의 onSelectLocker 자리로 넘긴다", () => {
    const onSelectPin = vi.fn();
    const map = fakeMap();

    render(<LockerMarkersLayer map={map} onSelectPin={onSelectPin} />);

    expect(useLockerMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ map, onSelectLocker: onSelectPin }),
    );
  });

  it("지도가 없어도 훅을 부른다", () => {
    render(<LockerMarkersLayer map={null} />);

    expect(useLockerMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ map: null }),
    );
  });
});

describe("SearchResultMarkersLayer", () => {
  const pins: LockerPinItemResponse[] = [];

  it("화면에 아무것도 그리지 않는다", () => {
    const { container } = render(
      <SearchResultMarkersLayer
        map={fakeMap()}
        pins={pins}
        onSelectLocker={vi.fn()}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("받은 핀 목록을 그대로 훅에 넘긴다", () => {
    const map = fakeMap();
    const onSelectLocker = vi.fn();

    render(
      <SearchResultMarkersLayer
        map={map}
        pins={pins}
        onSelectLocker={onSelectLocker}
      />,
    );

    expect(useSearchResultMarkers).toHaveBeenCalledWith(
      expect.objectContaining({ map, pins, onSelectLocker }),
    );
  });
});
