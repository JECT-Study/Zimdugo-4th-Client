import { vars } from "@repo/ui/vars";
import { describe, expect, it, vi } from "vitest";

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

const createFakeMaps = () =>
  ({
    LatLng: FakeLatLng,
    Marker: FakeMarker,
    Event: {
      addListener: vi.fn(
        (
          instance: FakeMarker,
          eventName: string,
          handler: () => void,
        ) => {
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
  it("외부 24x24 컨테이너 안에 흰색 배경 원과 IconMarker22 정의 그대로의 핀 SVG를 포함한다", () => {
    const icon = createLockerMarkerIcon({
      id: "locker-1",
      name: "서울역 보관함",
      lat: 37.5547,
      lng: 126.9706,
      availableCount: 3,
    });

    expect(icon).toContain('width="24"');
    expect(icon).toContain('height="24"');
    expect(icon).toContain('viewBox="0 0 24 24"');
    expect(icon).toContain(
      `<circle cx="12" cy="12" r="12" fill="${vars.color.palette.gray[100]}"/>`,
    );
    expect(icon).toContain(
      '<svg x="1" y="1" width="22" height="22" viewBox="0 0 22 22"',
    );
  });

  it("availableCount가 0보다 크면 active 상태와 잔여 수량을 데이터 속성으로 노출한다", () => {
    const icon = createLockerMarkerIcon({
      id: "locker-1",
      name: "서울역 보관함",
      lat: 37.5547,
      lng: 126.9706,
      availableCount: 3,
      totalCount: 10,
    });

    expect(icon).toContain('data-status="active"');
    expect(icon).toContain('data-available-count="3"');
    expect(icon).toContain('fill="#3BD569"');
    expect(icon).toContain("<title>서울역 보관함</title>");
  });

  it("availableCount가 0이면 inactive 상태와 회색으로 표시한다", () => {
    const icon = createLockerMarkerIcon({
      id: "locker-2",
      name: "강남역 보관함",
      lat: 37.4979,
      lng: 127.0276,
      availableCount: 0,
      totalCount: 10,
    });

    expect(icon).toContain('data-status="inactive"');
    expect(icon).toContain('data-available-count="0"');
    expect(icon).toContain('fill="#CACACA"');
  });

  it("availableCount가 없는 경우에도 낙관적으로 active 상태로 표시한다", () => {
    const icon = createLockerMarkerIcon({
      id: "locker-3",
      name: "역삼역 보관함",
      lat: 37.5006,
      lng: 127.0366,
    });

    expect(icon).toContain('data-status="active"');
    expect(icon).not.toContain("data-available-count");
    expect(icon).toContain('fill="#3BD569"');
  });

  it("name의 XML 특수문자를 이스케이프해 안전하게 직렬화한다", () => {
    const icon = createLockerMarkerIcon({
      id: "locker-4",
      name: "테스트 <보관함> & 부가시설",
      lat: 37.5,
      lng: 127.0,
    });

    expect(icon).toContain(
      "<title>테스트 &lt;보관함&gt; &amp; 부가시설</title>",
    );
    expect(icon).not.toContain("<보관함>");
  });
});

describe("syncLockerMarkers", () => {
  it("보관함 마커를 만들고 cleanup 시 지도에서 제거한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();

    const cleanup = syncLockerMarkers({
      map,
      maps,
      lockers: [
        {
          id: "locker-1",
          name: "서울역 보관함",
          lat: 37.5547,
          lng: 126.9706,
          availableCount: 3,
          totalCount: 10,
        },
      ],
    });

    expect(FakeMarker.instances).toHaveLength(1);
    expect(FakeMarker.instances[0]?.options).toMatchObject({
      map,
      title: "서울역 보관함",
    });
    expect(FakeMarker.instances[0]?.options.position).toBeInstanceOf(
      FakeLatLng,
    );

    cleanup();

    expect(FakeMarker.instances[0]?.setMap).toHaveBeenCalledWith(null);
    expect(maps.Event.removeListener).not.toHaveBeenCalled();
  });

  it("마커 옵션의 icon.content에 SVG 문자열을 전달한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        {
          id: "locker-1",
          name: "서울역 보관함",
          lat: 37.5547,
          lng: 126.9706,
          availableCount: 3,
        },
      ],
    });

    const options = FakeMarker.instances[0]?.options as {
      icon?: { content?: string };
    };

    expect(options.icon?.content).toContain('data-status="active"');
    expect(options.icon?.content).toContain("<title>서울역 보관함</title>");
  });

  it("보관함 마커 클릭 시 보관함 선택 콜백을 호출한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();
    const handleSelectLocker = vi.fn();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        {
          id: "locker-42",
          name: "강남역 보관함",
          lat: 37.4979,
          lng: 127.0276,
        },
      ],
      onSelectLocker: handleSelectLocker,
    });

    FakeMarker.instances[0]?.listeners[0]?.();

    expect(handleSelectLocker).toHaveBeenCalledWith("locker-42");
  });

  it("onSelectLocker가 있을 때 cleanup에서 click 리스너를 해제한다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();
    const handleSelectLocker = vi.fn();

    const cleanup = syncLockerMarkers({
      map,
      maps,
      lockers: [
        {
          id: "locker-42",
          name: "강남역 보관함",
          lat: 37.4979,
          lng: 127.0276,
        },
      ],
      onSelectLocker: handleSelectLocker,
    });

    cleanup();

    expect(maps.Event.removeListener).toHaveBeenCalledTimes(1);
  });

  it("onSelectLocker가 없으면 click 리스너를 등록하지 않는다", () => {
    FakeMarker.instances = [];

    const map = {} as naver.maps.Map;
    const maps = createFakeMaps();

    syncLockerMarkers({
      map,
      maps,
      lockers: [
        {
          id: "locker-9",
          name: "역삼역 보관함",
          lat: 37.5006,
          lng: 127.0366,
        },
      ],
    });

    expect(maps.Event.addListener).not.toHaveBeenCalled();
  });
});
