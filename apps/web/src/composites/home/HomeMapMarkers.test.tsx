// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LockerPinItemResponse } from "#/shared/api/lockers";

const lockerLayer = vi.fn();
const searchResultLayer = vi.fn();

vi.mock("#/entities/map/ui/LockerMarkersLayer", () => ({
  LockerMarkersLayer: (props: unknown) => {
    lockerLayer(props);
    return null;
  },
}));
vi.mock("#/entities/map/ui/SearchResultMarkersLayer", () => ({
  SearchResultMarkersLayer: (props: unknown) => {
    searchResultLayer(props);
    return null;
  },
}));

const { HomeMapMarkers } = await import("./HomeMapMarkers");

const pin = (lockerId: number) =>
  ({ pinType: "LOCKER", lockerId }) as unknown as LockerPinItemResponse;

/** 층마다 다른 핀을 둔다. 같으면 어느 목록이 갔는지 가릴 수 없다. */
const PINS = {
  search: [pin(1)],
  mapPlace: [pin(2)],
  selectedMapDetail: [pin(3)],
};

const HANDLERS = {
  idle: vi.fn(),
  search: vi.fn(),
  mapPlace: vi.fn(),
  selectedMapDetail: vi.fn(),
};

const SPREAD_CENTER = { lat: 37.4979, lng: 127.0276 };
const PRESERVED = new Map([["LOCKER-3", { offsetX: 4, offsetY: 5 }]]);

type Props = Parameters<typeof HomeMapMarkers>[0];

const props = (overrides: Partial<Props> = {}): Props => ({
  layer: "idle",
  isMapReady: true,
  keywordSearchParams: null,
  pins: PINS,
  onSelectPin: HANDLERS,
  onClusterClick: vi.fn(),
  resolveEffectiveFavorite: () => false,
  ...overrides,
});

beforeEach(() => {
  lockerLayer.mockClear();
  searchResultLayer.mockClear();
});

afterEach(() => {
  cleanup();
});

const lastLocker = () => lockerLayer.mock.calls.at(-1)?.[0];
const lastSearchResult = () => searchResultLayer.mock.calls.at(-1)?.[0];

describe("HomeMapMarkers", () => {
  it("지도가 아직 없으면 아무 층도 얹지 않는다", () => {
    render(<HomeMapMarkers {...props({ isMapReady: false })} />);

    expect(lockerLayer).not.toHaveBeenCalled();
    expect(searchResultLayer).not.toHaveBeenCalled();
  });

  it("얹을 층이 없으면 아무 층도 얹지 않는다", () => {
    render(<HomeMapMarkers {...props({ layer: null })} />);

    expect(lockerLayer).not.toHaveBeenCalled();
    expect(searchResultLayer).not.toHaveBeenCalled();
  });

  /** 평소 지도는 목록을 받지 않고 보이는 범위의 핀을 스스로 가져온다. */
  it("평소에는 지도가 스스로 가져오는 층을 얹는다", () => {
    render(<HomeMapMarkers {...props({ layer: "idle" })} />);

    expect(searchResultLayer).not.toHaveBeenCalled();
    expect(lastLocker()).toMatchObject({ onSelectPin: HANDLERS.idle });
    expect(lastLocker()?.searchParams).toBeUndefined();
  });

  it("키워드 검색이면 검색 조건을 쥔 층을 얹는다", () => {
    const keywordSearchParams = { keyword: "강남" } as never;

    render(
      <HomeMapMarkers {...props({ layer: "search", keywordSearchParams })} />,
    );

    expect(searchResultLayer).not.toHaveBeenCalled();
    expect(lastLocker()).toMatchObject({
      searchParams: keywordSearchParams,
      onSelectPin: HANDLERS.search,
    });
  });

  /** 검색 조건은 검색 층에만 쓴다. 다른 층에서 새면 엉뚱한 핀이 뜬다. */
  it("검색 층이 아니면 검색 조건을 무시한다", () => {
    render(
      <HomeMapMarkers
        {...props({
          layer: "mapPlace",
          keywordSearchParams: { keyword: "강남" } as never,
        })}
      />,
    );

    expect(lockerLayer).not.toHaveBeenCalled();
    expect(lastSearchResult()).toMatchObject({ pins: PINS.mapPlace });
  });

  it.each([
    ["search", PINS.search, HANDLERS.search],
    ["mapPlace", PINS.mapPlace, HANDLERS.mapPlace],
    ["selectedMapDetail", PINS.selectedMapDetail, HANDLERS.selectedMapDetail],
  ] as const)(
    "%s 층은 자기 목록과 자기 핸들러를 받는다",
    (layer, pins, handler) => {
      render(<HomeMapMarkers {...props({ layer })} />);

      expect(lastSearchResult()).toMatchObject({
        pins,
        onSelectLocker: handler,
      });
    },
  );

  /**
   * 고른 핀 하나만 남긴 층에서는 펼칠 것이 없다. 대신 방금까지 있던 자리를 물려받아야
   * 다시 그릴 때 튀지 않는다.
   */
  it("고른 핀 층은 펼침 중심 대신 물려받은 자리를 쓴다", () => {
    render(
      <HomeMapMarkers
        {...props({
          layer: "selectedMapDetail",
          spreadCenter: SPREAD_CENTER,
          preservedOffsets: PRESERVED,
        })}
      />,
    );

    expect(lastSearchResult()).toMatchObject({
      spreadCenter: undefined,
      preservedOffsets: PRESERVED,
    });
  });

  it("장소 층은 물려받은 자리 대신 펼침 중심을 쓴다", () => {
    render(
      <HomeMapMarkers
        {...props({
          layer: "mapPlace",
          spreadCenter: SPREAD_CENTER,
          preservedOffsets: PRESERVED,
        })}
      />,
    );

    expect(lastSearchResult()).toMatchObject({
      spreadCenter: SPREAD_CENTER,
      preservedOffsets: undefined,
    });
  });
});
