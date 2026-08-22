import { useCallback, useRef, useState } from "react";

export interface SheetSnapRequest<TStage> {
  id: number;
  stage: TStage;
}

/**
 * 바텀시트 스냅 요청 큐.
 *
 * id 는 요청을 비워도(clear) 이어서 증가한다. 직전 요청에서 파생하면 비운 뒤 다시
 * 1 부터 시작하는데, 시트는 리마운트 시 마지막으로 처리한 id 를 기억하므로(과거
 * 요청 재생 방지) 되감긴 id 를 이미 처리한 요청으로 오인해 무시한다. 예를 들어
 * mini 요청 → 다른 핀 선택으로 리마운트 → 요청 비움 → 다시 mini 요청 순서에서
 * 마지막 요청이 그대로 삼켜졌다.
 *
 * 요청은 "이미 떠 있는 시트를 옮기는" 용도다. 시트를 특정 단계로 여는 것은
 * DraggableBottomSheet 의 initialSnapPoint 담당이다.
 */
export function useSheetSnapRequest<TStage>() {
  const [snapRequest, setSnapRequest] =
    useState<SheetSnapRequest<TStage> | null>(null);
  const lastRequestIdRef = useRef(0);

  const requestSnap = useCallback((stage: TStage) => {
    lastRequestIdRef.current += 1;
    setSnapRequest({ id: lastRequestIdRef.current, stage });
  }, []);

  const clearSnapRequest = useCallback(() => {
    setSnapRequest(null);
  }, []);

  return { snapRequest, requestSnap, clearSnapRequest };
}
