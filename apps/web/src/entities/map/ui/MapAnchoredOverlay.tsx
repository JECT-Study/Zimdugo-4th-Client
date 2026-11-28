import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** 지도가 그 위의 클릭·끌기를 자기 것으로 받지 않도록 막는 이벤트들. */
const BLOCKED_MAP_EVENTS = [
  "pointerdown",
  "mousedown",
  "touchstart",
  "click",
  "dblclick",
  "contextmenu",
] as const;

interface MapAnchoredOverlayProps {
  map: naver.maps.Map | null;
  /** 붙일 지도 좌표. */
  position: { lat: number; lng: number };
  /** 다른 마커보다 위에 둘 층. */
  zIndex?: number;
  children: ReactNode;
}

/**
 * 지도 좌표 한 점에 React 화면을 붙인다.
 *
 * 네이버 지도 마커의 내용으로 크기 0 짜리 자리를 넣고 거기에 포털로 그린다. 마커라
 * 지도를 끌거나 확대해도 지도가 직접 자리를 옮겨 주어, 좌표를 픽셀로 바꿔 따라가는
 * 계산이 필요 없다. 자리의 원점이 곧 좌표이므로 내용은 원점 기준으로 스스로 놓는다
 * (예: 아래 가운데를 원점에 맞추려면 `translate(-50%, -100%)`).
 *
 * 내용 위의 클릭·끌기는 지도까지 올라가지 않게 막는다. 막지 않으면 카드의 버튼을
 * 누를 때 지도도 눌린 것으로 받아 카드를 닫거나 지도가 끌린다.
 */
export function MapAnchoredOverlay({
  map,
  position,
  zIndex = 1000,
  children,
}: MapAnchoredOverlayProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const { lat, lng } = position;

  useEffect(() => {
    if (!map || typeof window === "undefined" || !window.naver?.maps) return;

    const element = document.createElement("div");
    element.style.position = "relative";
    element.style.width = "0";
    element.style.height = "0";
    const stopPropagation = (event: Event) => event.stopPropagation();
    for (const type of BLOCKED_MAP_EVENTS) {
      element.addEventListener(type, stopPropagation);
    }

    const marker = new window.naver.maps.Marker({
      map,
      position: new window.naver.maps.LatLng(lat, lng),
      icon: { content: element, anchor: new window.naver.maps.Point(0, 0) },
      zIndex,
      clickable: true,
    });
    setContainer(element);

    return () => {
      for (const type of BLOCKED_MAP_EVENTS) {
        element.removeEventListener(type, stopPropagation);
      }
      marker.setMap(null);
      setContainer(null);
    };
  }, [map, lat, lng, zIndex]);

  return container ? createPortal(children, container) : null;
}
