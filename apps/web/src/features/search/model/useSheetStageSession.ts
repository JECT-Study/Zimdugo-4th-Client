import { useCallback, useState } from "react";
import {
  type SheetSnapRequest,
  useSheetSnapRequest,
} from "#/features/search/model/useSheetSnapRequest";

/**
 * 시트 하나가 홈에 알려 주는 것들.
 *
 * 목록 시트와 상세 시트가 같은 묶음을 각자 들고 있었다. 단계와 실측 높이, 스냅 요청,
 * 그리고 시트가 단계를 알려 올 때 둘을 함께 갱신하는 핸들러까지 네 벌이 똑같다.
 *
 * 묶어 두면 나중에 갈라지는 자리도 한 곳이 된다. 경로 라우트 전환(#215)에서 시트는
 * `<Outlet>` 의 자식이 되고 지도 컨트롤은 레이아웃에 남는데, 그때 레이아웃이 볼 것은
 * 실측 높이(가려진 영역)이고 화면이 볼 것은 단계다. 지금은 한 컴포넌트가 둘 다 읽고
 * 있어 경계가 보이지 않는다.
 */
export interface SheetStageSession<TStage> {
  /** 시트가 지금 안착해 있는 단계. */
  snapStage: TStage;
  setSnapStage: (stage: TStage) => void;
  /**
   * 그 단계에서 시트가 화면 하단에 실제로 차지하는 높이. 시트가 재서 올려 준다.
   *
   * full 은 콘텐츠에 따라 자리가 달라져 단계 상수로는 알 수 없다. 밀어 올릴 단계가
   * 아니면 null 이다.
   */
  visibleHeightPx: number | null;
  setVisibleHeightPx: (visibleHeightPx: number | null) => void;
  /** 이미 떠 있는 시트를 다른 단계로 옮기는 요청. */
  snapRequest: SheetSnapRequest<TStage> | null;
  requestSnap: (stage: TStage) => void;
  clearSnapRequest: () => void;
  /** 시트가 단계를 알려 올 때 단계와 높이를 함께 받는다. */
  handleSnapStageChange: (
    stage: TStage,
    visibleHeightPx: number | null,
  ) => void;
}

interface UseSheetStageSessionOptions<TStage> {
  /** 시트가 처음 뜨는 단계. */
  initialStage: TStage;
  /**
   * 첫 렌더에 쓸 높이.
   *
   * 시트가 아직 재기 전이라 서버와 같은 가정 높이에서 나온 값이다. 마운트 뒤 시트가
   * 실측값을 올려 준다.
   */
  initialVisibleHeightPx: number | null;
}

export function useSheetStageSession<TStage>({
  initialStage,
  initialVisibleHeightPx,
}: UseSheetStageSessionOptions<TStage>): SheetStageSession<TStage> {
  const [snapStage, setSnapStage] = useState<TStage>(initialStage);
  const [visibleHeightPx, setVisibleHeightPx] = useState<number | null>(
    initialVisibleHeightPx,
  );
  const { snapRequest, requestSnap, clearSnapRequest } =
    useSheetSnapRequest<TStage>();

  const handleSnapStageChange = useCallback(
    (nextStage: TStage, nextVisibleHeightPx: number | null) => {
      setSnapStage(nextStage);
      setVisibleHeightPx(nextVisibleHeightPx);
    },
    [],
  );

  return {
    snapStage,
    setSnapStage,
    visibleHeightPx,
    setVisibleHeightPx,
    snapRequest,
    requestSnap,
    clearSnapRequest,
    handleSnapStageChange,
  };
}
