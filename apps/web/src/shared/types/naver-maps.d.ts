declare namespace naver.maps {
  // biome-ignore lint/suspicious/noShadowRestrictedNames: naver maps SDK 명세상 Map 이름 유지
  class Map {
    constructor(element: string | HTMLElement, options: any);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    panTo(latlng: LatLng | LatLngLiteral): void;
    getBounds(): LatLngBounds;
    getZoom(): number;
    refresh(noEffect?: boolean): void;
    destroy(): void;
  }
  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
  }
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }
  class LatLngBounds {
    getNE(): LatLng;
    getSW(): LatLng;
  }
  class Marker {
    constructor(options: any);
    setMap(map: Map | null): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
  }
  // Event.addListener는 removeListener에 넘길 수 있는 opaque 핸들을 돌려준다.
  type MapEventListener = unknown;
  namespace Event {
    function addListener(
      instance: any,
      eventName: string,
      handler: (event: any) => void,
    ): MapEventListener;
    function removeListener(
      listener: MapEventListener | MapEventListener[],
    ): void;
  }
  namespace Service {
    const Status: {
      readonly OK: 200;
      readonly ERROR: 500;
    };
    type Status = (typeof Status)[keyof typeof Status];
    interface ReverseGeocodeResponse {
      v2: {
        results: Array<{
          region: {
            area1: { name: string };
            area2: { name: string };
            area3: { name: string };
          };
          land?: {
            name: string;
            number1: string;
            number2: string;
          };
        }>;
      };
    }
    function reverseGeocode(
      options: any,
      callback: (status: Status, response: ReverseGeocodeResponse) => void,
    ): void;
    const OrderType: {
      readonly ROAD_ADDR: "roadaddr";
      readonly ADDR: "addr";
    };
  }
}

interface Window {
  naver?: typeof naver;
}
