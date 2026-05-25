declare namespace naver.maps {
  class Map {
    constructor(element: string | HTMLElement, options: any);
    setCenter(latlng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    panTo(latlng: LatLng | LatLngLiteral): void;
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
  class Marker {
    constructor(options: any);
  }
  namespace Event {
    function addListener(
      instance: any,
      eventName: string,
      handler: (event: any) => void,
    ): void;
  }
  namespace Service {
    enum Status {
      OK,
      ERROR
    }
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
      ROAD_ADDR: string;
      ADDR: string;
    };
  }
}

interface Window {
  naver?: typeof naver;
}
