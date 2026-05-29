import { vars } from "@repo/ui/vars";
import { useEffect, useRef } from "react";

interface MyLocationMarkerProps {
  map: naver.maps.Map | null;
  location: { lat: number; lng: number; heading: number | null } | null;
  deviceHeading?: number | null;
  isOrientationTracking?: boolean;
}

export function MyLocationMarker({
  map,
  location,
  deviceHeading,
  isOrientationTracking = false,
}: MyLocationMarkerProps) {
  const markerRef = useRef<naver.maps.Marker | null>(null);

  useEffect(() => {
    if (
      !map ||
      !location ||
      typeof window === "undefined" ||
      !window.naver?.maps
    )
      return;

    const latLng = new window.naver.maps.LatLng(location.lat, location.lng);
    // 방향 센서(deviceHeading)가 있으면 최우선 적용, 없으면 GPS 이동 기반(heading) 사용
    const heading = deviceHeading ?? location.heading ?? 0;

    // 캔버스 크기: 80x80, 중심 40,40
    // 중앙 파란 점 크기: 20x20
    const dotHtml = `
      <div style="
        position: absolute;
        top: 30px;
        left: 30px;
        width: 20px;
        height: 20px;
        background-color: ${vars.color.palette.blue[500]};
        border-radius: 50%;
        border: 3px solid ${vars.color.palette.white};
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>
    `;

    // 꼬깔(시야각): 위쪽으로 넓어지는 반투명 파란색 부채꼴 (CSS border 트릭)
    const coneHtml = isOrientationTracking
      ? `
      <div style="
        position: absolute;
        top: 0;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-top: 40px solid rgba(0, 102, 255, 0.25);
      "></div>
      `
      : "";

    const iconHtml = `
      <div style="
        position: relative;
        width: 80px; 
        height: 80px; 
        transform: rotate(${heading}deg);
        transition: transform 0.2s ease-out;
      ">
        ${coneHtml}
        ${dotHtml}
      </div>
    `;

    if (!markerRef.current) {
      markerRef.current = new window.naver.maps.Marker({
        map,
        position: latLng,
        icon: {
          content: iconHtml,
          anchor: new window.naver.maps.Point(40, 40),
        },
      });
    } else {
      markerRef.current.setPosition(latLng);
      markerRef.current.setIcon({
        content: iconHtml,
        anchor: new window.naver.maps.Point(40, 40),
      });
    }
  }, [map, location, deviceHeading, isOrientationTracking]);

  // 언마운트 시 마커 제거
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  return null;
}
