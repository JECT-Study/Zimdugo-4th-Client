declare namespace naver.maps {
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    logoControl?: boolean;
    mapDataControl?: boolean;
    scaleControl?: boolean;
    zoomControl?: boolean;
    draggable?: boolean;
    scrollWheel?: boolean;
    pinchZoom?: boolean;
  }

  // biome-ignore lint/suspicious/noShadowRestrictedNames: naver maps SDK 명세의 Map 이름을 따른다
  class Map {
    constructor(element: string | HTMLElement, options: MapOptions);
    setOptions(options: MapOptions): void;
    setCenter(latlng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    panTo(latlng: LatLng | LatLngLiteral): void;
    morph(
      target: LatLng | LatLngLiteral,
      zoom?: number,
      options?: {
        duration?: number;
        easing?: string;
      },
    ): void;
    getBounds(): LatLngBounds;
    getZoom(): number;
    setZoom(zoom: number, effect?: boolean): void;
    getProjection(): MapSystemProjection;
    getSize?(): Size;
    refresh(noEffect?: boolean): void;
    setSize(size: Size): void;
    destroy(): void;
    fitBounds?(
      bounds: LatLngBounds,
      margins?:
        | number
        | {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
          },
    ): void;
  }
  class Size {
    constructor(width: number, height: number);
    width: number;
    height: number;
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
    constructor(sw: LatLng | LatLngLiteral, ne: LatLng | LatLngLiteral);
    getNE(): LatLng;
    getSW(): LatLng;
    hasLatLng(latlng: LatLng | LatLngLiteral): boolean;
  }
  interface MapSystemProjection {
    fromCoordToOffset(latlng: LatLng | LatLngLiteral): Point;
    fromOffsetToCoord(offset: Point): LatLng;
  }
  interface HtmlIcon {
    content: string | HTMLElement;
    size?: Size;
    anchor?: Point;
  }
  interface ImageIcon {
    url: string;
    size?: Size;
    origin?: Point;
    anchor?: Point;
  }
  interface SymbolIcon {
    path: number[] | string;
    style?: Record<string, unknown>;
    anchor?: Point;
  }
  type MarkerIcon = string | ImageIcon | SymbolIcon | HtmlIcon;
  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map | null;
    icon?: MarkerIcon;
    visible?: boolean;
    clickable?: boolean;
    title?: string;
    zIndex?: number;
  }
  class Marker {
    constructor(options: MarkerOptions);
    getVisible(): boolean;
    setMap(map: Map | null): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
    setIcon?(icon: MarkerIcon): void;
    setVisible(visible: boolean): void;
  }
  // Event.addListener와 removeListener에만 전달하는 opaque 핸들이다.
  type MapEventListener = unknown;
  namespace Event {
    function addListener(
      instance: unknown,
      eventName: string,
      handler: (event: unknown) => void,
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
    interface ReverseGeocodeOptions {
      coords: LatLng;
      orders: string;
    }
    function reverseGeocode(
      options: ReverseGeocodeOptions,
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
