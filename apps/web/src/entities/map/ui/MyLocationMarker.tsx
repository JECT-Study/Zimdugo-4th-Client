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
      // CSS transition을 제거하고 JS requestAnimationFrame으로 부드럽게(LERP) 회전 처리

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

  const targetHeadingRef = useRef(0);
  const currentHeadingRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // 3. 디바이스 방향(혹은 GPS 방향) 갱신 시 목표 각도(Target)만 설정 (리렌더링 최소화)
  useEffect(() => {
    const rawHeading = deviceHeading ?? location?.heading ?? 0;
    const prevTarget = targetHeadingRef.current;

    // 360도 <-> 0도 경계를 지날 때 최단 거리 계산
    const positiveModulo = ((prevTarget % 360) + 360) % 360;
    let diff = rawHeading - positiveModulo;

    if (diff > 180) diff -= 360;
    else if (diff < -180) diff += 360;

    targetHeadingRef.current = prevTarget + diff;
  }, [deviceHeading, location?.heading]);

  // 4. requestAnimationFrame을 활용한 LERP(Low Pass Filter) 스무딩 애니메이션 (극심한 떨림/노이즈 방지)
  useEffect(() => {
    const animate = () => {
      // 0.1은 보간(스무딩) 속도. 낮을수록 센서 노이즈가 제거되어 훨씬 부드럽지만 반응이 살짝 느려짐.
      currentHeadingRef.current +=
        (targetHeadingRef.current - currentHeadingRef.current) * 0.1;

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `rotate(${currentHeadingRef.current}deg)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
