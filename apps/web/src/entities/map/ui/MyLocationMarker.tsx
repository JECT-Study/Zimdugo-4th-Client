import { useEffect, useRef } from "react";
import { vars } from "@repo/ui/vars";

interface MyLocationMarkerProps {
  map: naver.maps.Map | null;
  location: { lat: number; lng: number; heading: number | null } | null;
  isTracking: boolean;
}

export function MyLocationMarker({ map, location, isTracking }: MyLocationMarkerProps) {
  const markerRef = useRef<naver.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || !location || typeof window === "undefined" || !window.naver?.maps) return;

    const latLng = new window.naver.maps.LatLng(location.lat, location.lng);
    const heading = location.heading || 0;
    
    // 임시 내 위치 아이콘 (방향 표시 포함)
    // isTracking 모드일 때만 파란색, 아니면 회색 등으로 변경할 수도 있지만 일단은 파란색 유지
    const iconHtml = `
      <div style="
        width: 32px; 
        height: 32px; 
        background-color: ${vars.color.palette.blue[500]}; 
        border-radius: 50%; 
        border: 4px solid ${vars.color.palette.white}; 
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(${heading}deg);
        transition: transform 0.2s ease-out;
      ">
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent; 
          border-right: 6px solid transparent; 
          border-bottom: 10px solid ${vars.color.palette.white};
          margin-bottom: 8px;
        "></div>
      </div>
    `;

    if (!markerRef.current) {
      markerRef.current = new window.naver.maps.Marker({
        map,
        position: latLng,
        icon: {
          content: iconHtml,
          anchor: new window.naver.maps.Point(16, 16),
        },
      });
    } else {
      markerRef.current.setPosition(latLng);
      markerRef.current.setIcon({
        content: iconHtml,
        anchor: new window.naver.maps.Point(16, 16),
      });
    }
  }, [map, location, isTracking]);

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
