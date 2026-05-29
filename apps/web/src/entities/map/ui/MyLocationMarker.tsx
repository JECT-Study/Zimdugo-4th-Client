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

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const coneRef = useRef<HTMLDivElement | null>(null);

  // 1. 마커 초기화 및 좌표 업데이트
  useEffect(() => {
    if (
      !map ||
      !location ||
      typeof window === "undefined" ||
      !window.naver?.maps
    )
      return;

    const latLng = new window.naver.maps.LatLng(location.lat, location.lng);

    if (!markerRef.current) {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = "80px";
      wrapper.style.height = "80px";
      wrapper.style.transition = "transform 0.1s linear"; // 부드러운 회전 효과

      const cone = document.createElement("div");
      cone.style.position = "absolute";
      cone.style.top = "0";
      cone.style.left = "20px";
      cone.style.width = "0";
      cone.style.height = "0";
      cone.style.borderLeft = "20px solid transparent";
      cone.style.borderRight = "20px solid transparent";
      cone.style.borderTop = "40px solid rgba(0, 102, 255, 0.25)";
      cone.style.display = isOrientationTracking ? "block" : "none";

      const dot = document.createElement("div");
      dot.style.position = "absolute";
      dot.style.top = "30px";
      dot.style.left = "30px";
      dot.style.width = "20px";
      dot.style.height = "20px";
      dot.style.backgroundColor = vars.color.palette.blue[500];
      dot.style.borderRadius = "50%";
      dot.style.border = `3px solid ${vars.color.palette.white}`;
      dot.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

      wrapper.appendChild(cone);
      wrapper.appendChild(dot);

      wrapperRef.current = wrapper;
      coneRef.current = cone;

      markerRef.current = new window.naver.maps.Marker({
        map,
        position: latLng,
        icon: {
          content: wrapper,
          anchor: new window.naver.maps.Point(40, 40),
        },
      });
    } else {
      markerRef.current.setPosition(latLng);
    }
  }, [map, location, isOrientationTracking]);

  // 2. 나침반 모드 ON/OFF 시 꼬깔(시야각) 렌더링 토글
  useEffect(() => {
    if (coneRef.current) {
      coneRef.current.style.display = isOrientationTracking ? "block" : "none";
    }
  }, [isOrientationTracking]);

  // 3. 디바이스 방향(혹은 GPS 방향) 갱신 시 DOM 엘리먼트 Transform 직접 수정 (리렌더링/플리커링 방지)
  useEffect(() => {
    if (wrapperRef.current) {
      const heading = deviceHeading ?? location?.heading ?? 0;
      wrapperRef.current.style.transform = `rotate(${heading}deg)`;
    }
  }, [deviceHeading, location?.heading]);

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
