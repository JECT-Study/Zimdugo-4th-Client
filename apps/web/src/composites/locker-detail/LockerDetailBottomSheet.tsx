import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LockerDetailItem,
  LockerDetailLoadState,
} from "#/entities/locker/model/locker-detail";
import { LockerRealtimeStatusCard } from "#/entities/locker/ui/realtime-availability";
import type { LockerCorrectionRequest } from "#/features/locker-correction/model/locker-correction-types";
import { useSafeAreaInsetTop } from "#/shared/hooks/useSafeAreaInsetTop";
import { useViewportHeight } from "#/shared/hooks/useViewportHeight";
import {
  resolveSheetFullSnapPoint,
  resolveSheetTopLimitPx,
} from "#/shared/lib/app-chrome-layout";
import {
  type BottomSheetLiveOffsetState,
  type BottomSheetSnapRequest,
  DraggableBottomSheet,
  SHEET_SETTLE_SPRING,
} from "#/shared/ui/DraggableBottomSheet";
import { realtimeStatusCardOverlay } from "./LockerDetailBottomSheet.css.ts";

import {
  DETAIL_ACTION_FOOTER_HEIGHT,
  LockerDetailScreen,
  type LockerDetailScreenMetrics,
} from "./LockerDetailScreen";

const REALTIME_STATUS_CARD_OVERLAY_GAP = 14;
/** full 콘텐츠 측정 시 실시간 카드가 DOM 에 들어 있는지 확인하는 표식 */
export interface LockerDetailSheetLiveOffsetState {
  /** 뷰포트 상단부터 시트 상단까지 거리. `100dvh - offsetPx` 가 시트가 차지하는 높이다. */
  offsetPx: number;
  /** 마운트 슬라이드 진행도. 0 이면 시트가 아직 화면 밖, 1 이면 제자리다. */
  mountProgress: number;
  /** 오프셋이 목표 스냅에 닿았는지. 스냅 애니메이션 중에는 false 다. */
  isSettled: boolean;
}

export interface LockerDetailBottomSheetProps {
  locker: LockerDetailItem;
  loadState?: LockerDetailLoadState;
  onRetry?: () => void;
  onFavoriteChange?: (item: LockerDetailItem, next: boolean) => void;
  onBack?: () => void;
  onShare?: (item: LockerDetailItem) => void;
  onReport?: (item: LockerDetailItem) => void;
  onCorrectionSubmit?: (
    item: LockerDetailItem,
    request: LockerCorrectionRequest,
  ) => Promise<void> | void;
  onNavigate?: (item: LockerDetailItem) => void;
  isFavoriteActionVisible?: boolean;
  minSnapPoint?: number;
  snapPoint?: number;
  /** 풀 스냅으로 열 때만 지정. 하프 스냅은 snapPoint에 유지 */
  initialSnapPoint?: number;
  maxSnapPoint?: number;
  animateOnMount?: boolean;
  onSnapChange?: (nextSnap: number) => void;
  /**
   * 두 번째 인자는 그 단계에서 시트가 실제로 차지하는 높이다. full 은 콘텐츠
   * 높이에 따라 달라지므로 상수로 정할 수 없다. dismiss 면 null 이다.
   */
  onSnapStageChange?: (
    nextStage: LockerDetailSheetSnapStage,
    visibleHeightPx: number | null,
  ) => void;
  /**
   * 프레임마다 불린다. 지도 컨트롤이 시트 윗변을 따라오게 하는 용도다.
   *
   * 부모는 반드시 identity 가 고정된 콜백을 넘겨야 한다. 매 렌더 새 함수를 주면
   * 시트 쪽 구독 effect 가 프레임마다 떼었다 붙는다.
   */
  onLiveOffsetChange?: (state: LockerDetailSheetLiveOffsetState) => void;
  snapRequest?: LockerDetailSheetSnapRequest | null;
  /**
   * 지도의 타이머 컨트롤처럼 시트 밖에서 타이머 모달까지 함께 열 때 켠다.
   *
   * 시트가 이 요청을 처리하면 `onTimerAutoOpenHandled` 로 알린다. 부모가 그때
   * 꺼주지 않으면 이후 다른 경로로 이 보관함을 열 때도 모달이 따라 열린다.
   */
  shouldOpenTimer?: boolean;
  onTimerAutoOpenHandled?: () => void;
}

export { SHEET_TOP_LIMIT_PX as LOCKER_DETAIL_FULL_TOP_OFFSET } from "#/shared/lib/app-chrome-layout";

const DETAIL_CONTENT_TOP_PADDING = 8;
const DETAIL_DISMISS_VISIBLE_HEIGHT = 52;
const DETAIL_MINI_VISIBLE_HEIGHT = 111;

/**
 * 액션 영역 높이의 기본값.
 *
 * 구분선 1 + 위 간격 16 + 버튼 한 줄 46 + 아래 패딩 16. 실제 높이는 홈 인디케이터를
 * 피하는 세이프 에어리어만큼 더 크므로, 그려진 뒤에는 잰 값으로 갈아 끼운다.
 * 이 값은 재기 전 첫 렌더에만 쓴다.
 */

/**
 * 하프에서 콘텐츠가 쓰는 높이.
 *
 * 액션 영역이 스크롤 밖으로 나오면서 자기 높이를 먼저 가져간다. 이 몫을 안 더하면
 * 핸들 24 와 패딩 8 을 뺀 159 중 79 를 액션이 쓰고 80 만 남아, 요약(약 79) 하나로
 * 꽉 차고 그 아래 정보가 전부 잘린다. 하프가 미니와 구분되지 않는다.
 */
const DETAIL_HALF_CONTENT_HEIGHT = 191;

/**
 * 하프에서 보이는 높이.
 *
 * 액션 영역 높이를 재기 전까지 쓰는 값이다. 세이프 에어리어가 있는 기기에서는
 * 실제 액션 영역이 더 높아, 잰 값을 받으면 그만큼 하프도 함께 커져야 한다.
 * 하프는 스크롤이 없어서 모자란 만큼이 그대로 잘린다.
 */
const DETAIL_HALF_VISIBLE_HEIGHT =
  DETAIL_HALF_CONTENT_HEIGHT + DETAIL_ACTION_FOOTER_HEIGHT;
const DETAIL_DRAG_SENSITIVITY = 1.2;

export type LockerDetailSheetSnapStage = "full" | "half" | "mini" | "dismiss";

/**
 * 단계별 기본 높이. 시트가 아직 자기 스냅을 못 정했을 때 쓰는 초기값이다.
 *
 * full 은 콘텐츠 높이에 따라 자리가 달라져 여기서 정할 수 없다. 실제 값은 시트가
 * onSnapStageChange 로 올려 준다. dismiss 는 사실상 닫힌 상태라 null 이다.
 */
export const resolveDetailSheetVisibleHeight = (
  stage: LockerDetailSheetSnapStage,
) => {
  if (stage === "mini") return DETAIL_MINI_VISIBLE_HEIGHT;
  if (stage === "half") return DETAIL_HALF_VISIBLE_HEIGHT;
  return null;
};

interface LockerDetailSheetSnapRequest {
  id: number;
  stage: LockerDetailSheetSnapStage;
}

interface ResolveLockerDetailSnapPointsOptions {
  windowHeight: number;
  /** 노치에 덮이는 높이. full 상한을 그만큼 함께 내린다. */
  safeAreaInsetTopPx?: number;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  fullContentHeight?: number | null;
  /** 잰 액션 영역 높이. 생략하면 세이프 에어리어를 뺀 기본값을 쓴다. */
  actionFooterHeightPx?: number;
}

const resolveLockerDetailSnapOffset = ({
  maxSnapPoint,
  minSnapPoint,
  visibleHeight,
  windowHeight,
}: {
  maxSnapPoint: number;
  minSnapPoint: number;
  visibleHeight: number;
  windowHeight: number;
}) =>
  Math.min(maxSnapPoint, Math.max(minSnapPoint, windowHeight - visibleHeight));

const resolveLockerDetailSnapStage = ({
  maxSnapPoint,
  miniSnapPoint,
  minSnapPoint,
  offset,
  snapPoint,
}: {
  maxSnapPoint: number;
  miniSnapPoint: number;
  minSnapPoint: number;
  offset: number;
  snapPoint: number;
}): LockerDetailSheetSnapStage => {
  const entries = [
    { stage: "full" as const, point: minSnapPoint },
    { stage: "half" as const, point: snapPoint },
    { stage: "mini" as const, point: miniSnapPoint },
    { stage: "dismiss" as const, point: maxSnapPoint },
  ];

  return entries.reduce((nearestEntry, entry) =>
    Math.abs(entry.point - offset) < Math.abs(nearestEntry.point - offset)
      ? entry
      : nearestEntry,
  ).stage;
};

export const resolveLockerDetailSnapPoints = ({
  fullContentHeight,
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
  actionFooterHeightPx = DETAIL_ACTION_FOOTER_HEIGHT,
  safeAreaInsetTopPx = 0,
}: ResolveLockerDetailSnapPointsOptions) => {
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - DETAIL_DISMISS_VISIBLE_HEIGHT;
  const resolvedFullTopOffset =
    minSnapPoint ?? resolveSheetTopLimitPx(safeAreaInsetTopPx);
  const resolvedMinSnapPoint = resolveSheetFullSnapPoint({
    contentHeight: fullContentHeight,
    topLimitPx: resolvedFullTopOffset,
    maxSnapPoint: resolvedMaxSnapPoint,
    windowHeight,
  });
  const resolvedSnapPoint =
    snapPoint ??
    resolveLockerDetailSnapOffset({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      visibleHeight: DETAIL_HALF_CONTENT_HEIGHT + actionFooterHeightPx,
      windowHeight,
    });
  const resolvedMiniSnapPoint = resolveLockerDetailSnapOffset({
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    visibleHeight: DETAIL_MINI_VISIBLE_HEIGHT,
    windowHeight,
  });

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

/**
 * 상세 화면을 바텀시트라는 표면에 얹는다.
 *
 * 표면이 아는 것은 자리 계산과 단계 알림, 그리고 시트 윗변을 따라다니는 실시간
 * 카드뿐이다. 화면이 무엇을 담고 있는지는 모르고, 잰 자리만 받아 스냅을 정한다.
 */
export function LockerDetailBottomSheet({
  locker,
  loadState = "ready",
  onRetry,
  onFavoriteChange,
  onBack,
  onShare,
  onReport,
  onCorrectionSubmit,
  onNavigate,
  isFavoriteActionVisible = true,
  minSnapPoint,
  snapPoint,
  initialSnapPoint,
  maxSnapPoint,
  animateOnMount = false,
  onSnapChange,
  onSnapStageChange,
  onLiveOffsetChange,
  snapRequest,
  shouldOpenTimer = false,
  onTimerAutoOpenHandled,
}: LockerDetailBottomSheetProps) {
  const windowHeight = useViewportHeight();
  const safeAreaInsetTop = useSafeAreaInsetTop();
  const [screenMetrics, setScreenMetrics] = useState<LockerDetailScreenMetrics>(
    {
      contentHeightPx: null,
      actionFooterHeightPx: DETAIL_ACTION_FOOTER_HEIGHT,
    },
  );
  const fullContentHeight = screenMetrics.contentHeightPx;
  const actionFooterHeight = screenMetrics.actionFooterHeightPx;
  const realtimeAvailability = locker.realtimeAvailability;
  const isRealtimeAvailable = realtimeAvailability?.isAvailable === true;
  const {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  } = resolveLockerDetailSnapPoints({
    maxSnapPoint,
    minSnapPoint,
    snapPoint,
    windowHeight,
    fullContentHeight:
      fullContentHeight === null
        ? null
        : fullContentHeight + DETAIL_CONTENT_TOP_PADDING,
    actionFooterHeightPx: actionFooterHeight,
    safeAreaInsetTopPx: safeAreaInsetTop,
  });
  const resolvedInitialSnapPoint =
    initialSnapPoint !== undefined
      ? Math.min(
          resolvedMaxSnapPoint,
          Math.max(resolvedMinSnapPoint, initialSnapPoint),
        )
      : resolvedSnapPoint;
  const resolvedSnapRequest: BottomSheetSnapRequest | null = snapRequest
    ? {
        id: snapRequest.id,
        snapPoint:
          snapRequest.stage === "full"
            ? resolvedMinSnapPoint
            : snapRequest.stage === "half"
              ? resolvedSnapPoint
              : snapRequest.stage === "mini"
                ? resolvedMiniSnapPoint
                : resolvedMaxSnapPoint,
      }
    : null;
  const [currentSnapStage, setCurrentSnapStage] =
    useState<LockerDetailSheetSnapStage>(() =>
      resolveLockerDetailSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
        snapPoint: resolvedSnapPoint,
      }),
    );
  /**
   * 시트를 새로 열었다고 볼 기준.
   *
   * 보관함이 바뀌거나, 어느 단계로 열지에 대한 "요청" 이 바뀔 때만 달라진다.
   * initialSnapPoint 는 단계가 아니라 픽셀 오프셋이라 호출부가 뷰포트마다 다시 계산할 수
   * 있다. 값 자체를 기준에 넣으면 같은 단계로 여는데도 시트가 다시 마운트된다.
   * resolvedInitialSnapPoint 는 거기에 clamp 까지 걸려 주소창이 접히기만 해도 변한다.
   * 그래서 "어느 단계로 열라는 요청이 있었는가" 만 본다.
   */
  const sheetSessionKey = `${locker.lockerId}-${
    initialSnapPoint === undefined ? "auto" : "requested"
  }`;
  const sheetSessionKeyRef = useRef(sheetSessionKey);
  const initialSnapPointRef = useRef(resolvedInitialSnapPoint);

  /**
   * 스냅 애니메이션이 진행되는 동안의 실제 시트 오프셋.
   *
   * onSnapChange 는 스프링이 끝나기 전에 호출되므로, 단계별 고정 높이로 오버레이를
   * 배치하면 카드가 시트보다 먼저 순간이동한다. 라이브 오프셋을 따라가야 함께 움직인다.
   *
   * state 가 아니라 motion value 인 이유는 이 값이 프레임마다 바뀌기 때문이다.
   * state 로 두면 드래그 내내 시트 전체가 초당 60번 리렌더된다. 시트가 자기 높이를
   * 잡는 방식과 같은 100dvh 기준이라, 모바일에서 URL 바가 접혀도 시트 윗변에 붙는다.
   */
  const sheetOffsetValue = useMotionValue(resolvedInitialSnapPoint);
  const realtimeOverlayBottom = useMotionTemplate`calc(100dvh - ${sheetOffsetValue}px + ${REALTIME_STATUS_CARD_OVERLAY_GAP}px)`;
  /**
   * 스프링이 실제로 향하는 오프셋. onSnapChange 가 주는 값이라 클램프까지 끝난 값이다.
   *
   * minSnapPoint 와 비교하면 안 된다. full 진입과 동시에 제목 펼치기 버튼이 붙어
   * 콘텐츠가 5px 늘고 minSnapPoint 가 그만큼 내려가는데, 스프링은 이미 잡아 둔
   * 이전 값에 안착한다. 그러면 "도착했는지" 판정이 영원히 거짓이 되어
   * 오버레이 카드가 시트 안 카드로 넘어가지 못한다.
   */
  const snapTargetOffsetRef = useRef(resolvedInitialSnapPoint);
  /** 오프셋이 타깃에 닿았는지. 전환당 한 번만 뒤집혀 리렌더도 그만큼만 난다. */
  const [isOffsetAtSnapTarget, setIsOffsetAtSnapTarget] = useState(true);

  /**
   * 마운트 애니메이션에서 시트가 아래에서 올라오는 거리.
   *
   * 시트는 sheetOffset 이 아니라 자기 높이만큼의 y 변환(100% -> 0)으로 올라온다.
   * 오버레이는 그 변환 밖에 있어 그대로 두면 최종 위치에 먼저 붙어 있고 시트만
   * 뒤늦게 따라 올라온다. 같은 거리를 같은 스프링으로 움직여 함께 오게 한다.
   */
  const mountSlideDistance = Math.max(
    0,
    windowHeight - resolvedInitialSnapPoint,
  );

  /** 시트가 full 에 안착한 뒤에야 오버레이 카드를 내부 카드로 넘긴다. */
  const isSheetAtFullOffset =
    currentSnapStage === "full" && isOffsetAtSnapTarget;
  const isRealtimeOverlayVisible =
    loadState === "ready" &&
    isRealtimeAvailable &&
    currentSnapStage !== "dismiss" &&
    !isSheetAtFullOffset;
  /**
   * 그 단계에서 시트가 화면 하단에 차지하는 높이.
   *
   * full 은 콘텐츠가 짧으면 화면을 다 덮지 못한다. 그때 지도 컨트롤을 무조건
   * 숨기면 시트 위에 남은 지도에서 새로고침·내 위치를 쓸 수 없고, 예전처럼 기본
   * 위치에 두면 시트 뒤에 깔려 눌리지도 않는다. 실제 높이를 올려 보내 컨트롤
   * 쪽이 놓을 자리가 있는지 직접 판단하게 한다.
   */
  const resolveStageVisibleHeight = (stage: LockerDetailSheetSnapStage) =>
    stage === "dismiss"
      ? null
      : Math.max(
          0,
          windowHeight -
            (stage === "full"
              ? resolvedMinSnapPoint
              : stage === "half"
                ? resolvedSnapPoint
                : resolvedMiniSnapPoint),
        );

  /**
   * 같은 값을 두 번 알리지 않는다.
   *
   * 단계가 바뀔 때는 onSnapChange 와 같은 틱에 알려야 해서 handleSnapChange 가
   * 직접 부르고, 콘텐츠가 측정돼 full 자리만 바뀌는 경우는 아래 이펙트가 부른다.
   * 두 경로가 겹칠 때 중복 호출을 막는다.
   */
  const lastStageNoticeRef = useRef<string | null>(null);
  const notifySnapStage = useCallback(
    (stage: LockerDetailSheetSnapStage, visibleHeightPx: number | null) => {
      const key = `${stage}|${visibleHeightPx}`;
      if (lastStageNoticeRef.current === key) {
        return;
      }

      lastStageNoticeRef.current = key;
      onSnapStageChange?.(stage, visibleHeightPx);
    },
    [onSnapStageChange],
  );

  useEffect(() => {
    notifySnapStage(
      currentSnapStage,
      resolveStageVisibleHeight(currentSnapStage),
    );
  });

  const handleSnapChange = (nextSnap: number) => {
    const nextStage = resolveLockerDetailSnapStage({
      maxSnapPoint: resolvedMaxSnapPoint,
      miniSnapPoint: resolvedMiniSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: nextSnap,
      snapPoint: resolvedSnapPoint,
    });

    setCurrentSnapStage(nextStage);
    snapTargetOffsetRef.current = nextSnap;
    setIsOffsetAtSnapTarget(sheetOffsetValue.get() <= nextSnap);
    onSnapChange?.(nextSnap);
    notifySnapStage(nextStage, resolveStageVisibleHeight(nextStage));
  };

  /**
   * 프레임마다 불린다. identity 가 매 렌더 바뀌면 시트 쪽 구독 effect 가
   * 그때마다 떼었다 붙으므로 useCallback 으로 고정한다.
   */
  const handleLiveOffsetChange = useCallback(
    ({ offset, mountProgress, isSettled }: BottomSheetLiveOffsetState) => {
      sheetOffsetValue.set(offset);
      setIsOffsetAtSnapTarget(offset <= snapTargetOffsetRef.current);
      onLiveOffsetChange?.({ offsetPx: offset, mountProgress, isSettled });
    },
    [onLiveOffsetChange, sheetOffsetValue],
  );
  /**
   * 보관함이 바뀌어도 초기 스냅이 같으면(대부분 half 로 연다) 이 초기화가 건너뛰어졌다.
   *
   * index.tsx 는 이 컴포넌트에 key 를 주지 않고 안쪽 DraggableBottomSheet 만 lockerId 로
   * 리마운트한다. 시트는 초기 스냅으로 새로 뜨는데 여기 라이브 상태는 직전 보관함의
   * 단계·오프셋으로 남아, mini 에서 다른 핀을 열면 카드가 mini 높이에 뜨거나 full 이었다면
   * 오버레이 대신 시트 안 카드가 나왔다. 안쪽 key 와 같은 기준으로 초기화한다.
   */
  useEffect(() => {
    if (
      initialSnapPointRef.current === resolvedInitialSnapPoint &&
      sheetSessionKeyRef.current === sheetSessionKey
    ) {
      return;
    }

    initialSnapPointRef.current = resolvedInitialSnapPoint;
    sheetSessionKeyRef.current = sheetSessionKey;
    sheetOffsetValue.set(resolvedInitialSnapPoint);
    snapTargetOffsetRef.current = resolvedInitialSnapPoint;
    setIsOffsetAtSnapTarget(true);
    setCurrentSnapStage(
      resolveLockerDetailSnapStage({
        maxSnapPoint: resolvedMaxSnapPoint,
        miniSnapPoint: resolvedMiniSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
        snapPoint: resolvedSnapPoint,
      }),
    );
  }, [
    sheetSessionKey,
    resolvedInitialSnapPoint,
    resolvedMaxSnapPoint,
    resolvedMiniSnapPoint,
    resolvedMinSnapPoint,
    resolvedSnapPoint,
    sheetOffsetValue.set,
  ]);

  return (
    <>
      {isRealtimeOverlayVisible ? (
        <motion.div
          className={realtimeStatusCardOverlay}
          initial={animateOnMount ? { y: mountSlideDistance } : { y: 0 }}
          animate={{ y: 0 }}
          transition={SHEET_SETTLE_SPRING}
          style={{ bottom: realtimeOverlayBottom }}
        >
          <LockerRealtimeStatusCard
            availability={realtimeAvailability}
            variant="floating"
          />
        </motion.div>
      ) : null}
      <DraggableBottomSheet
        key={sheetSessionKey}
        snapPoint={resolvedSnapPoint}
        initialSnapPoint={resolvedInitialSnapPoint}
        minSnapPoint={resolvedMinSnapPoint}
        miniSnapPoint={resolvedMiniSnapPoint}
        maxSnapPoint={resolvedMaxSnapPoint}
        dragSensitivity={DETAIL_DRAG_SENSITIVITY}
        animateOnMount={animateOnMount}
        showHomeIndicator={false}
        snapRequest={resolvedSnapRequest}
        onSnapChange={handleSnapChange}
        onLiveOffsetChange={handleLiveOffsetChange}
        onDismiss={onBack}
      >
        <LockerDetailScreen
          locker={locker}
          loadState={loadState}
          onRetry={onRetry}
          onBack={onBack}
          onShare={onShare}
          onNavigate={onNavigate}
          onFavoriteChange={onFavoriteChange}
          onReport={onReport}
          onCorrectionSubmit={onCorrectionSubmit}
          isFavoriteActionVisible={isFavoriteActionVisible}
          shouldOpenTimer={shouldOpenTimer}
          onTimerAutoOpenHandled={onTimerAutoOpenHandled}
          onMetricsChange={setScreenMetrics}
          isActionFooterVisible={
            currentSnapStage === "full" || currentSnapStage === "half"
          }
          isSummaryOnly={currentSnapStage === "mini"}
          isScrollEnabled={currentSnapStage === "full"}
          isRealtimeCardVisible={isSheetAtFullOffset}
        />
      </DraggableBottomSheet>
    </>
  );
}
