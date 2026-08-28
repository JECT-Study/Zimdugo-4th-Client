import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import {
  IconCaution24,
  IconChevronLeft13,
  IconDistanceRoute24,
  IconLockerDetailCapacity24,
  IconLockerDetailMapPin24,
  IconLockerDetailWallet24,
  IconMore24,
  IconNavigationClock24,
  IconX24,
} from "@repo/ui/tokens/icons";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  LockerDetailItem,
  LockerDetailLoadState,
} from "#/entities/locker/model/locker-detail";
import { LockerDetailImageStrip } from "#/entities/locker/ui/detail-images";
import {
  LOCKER_REALTIME_STATUS_CARD_HEIGHT_PX,
  LockerRealtimeStatusCard,
} from "#/entities/locker/ui/realtime-availability";
import type { LockerCorrectionRequest } from "#/features/locker-correction/model/locker-correction-types";
import { LockerCorrectionRequestFlow } from "#/features/locker-correction/ui/LockerCorrectionRequestFlow";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
} from "#/shared/lib/locker-detail-labels";
import {
  type BottomSheetLiveOffsetState,
  type BottomSheetSnapRequest,
  DraggableBottomSheet,
  SHEET_SETTLE_SPRING,
} from "#/shared/ui/DraggableBottomSheet";
import { OriginalImagePreview } from "#/shared/ui/OriginalImagePreview";
import { OverflowMarqueeText } from "#/shared/ui/OverflowMarqueeText";
import { SKELETON_SURFACE_STYLE } from "#/shared/ui/skeleton-style";
import {
  actionDivider,
  actionRow,
  actionSection,
  backButton,
  backIcon,
  CONTENT_STACK_GAP_PX,
  contentStack,
  detailDescription,
  detailDescriptionMultiline,
  detailHeader,
  detailIcon,
  detailIconNeutral,
  detailItem,
  detailItemContent,
  detailLeading,
  detailTextColumn,
  detailTitle,
  detailTitleMultiline,
  detailTrailing,
  distanceRow,
  fullActionRow,
  fullContentScroll,
  fullContentScrollEnabled,
  fullDetailList,
  fullPrimaryActionButton,
  loadingActionRow,
  loadingContent,
  loadingDetailList,
  loadingDetailRow,
  loadingSummary,
  loadingTextStack,
  lockerTitle,
  lockerTitleExpanded,
  metaDot,
  metaIcon,
  metaIconText,
  metaRow,
  metaTruncatedText,
  primaryActionButton,
  realtimeAvailabilityDivider,
  realtimeStatusCardOverlay,
  sheetColumn,
  summaryActions,
  summaryIconButton,
  summaryRow,
  summarySection,
  summaryTextColumn,
  titleControlRow,
  titleExpandButton,
  titleExpandIcon,
  titleExpandIconExpanded,
} from "./LockerDetailBottomSheet.css.ts";
import { LockerDetailMoreActionsModal } from "./LockerDetailMoreActionsModal";

const skeletonSurfaceStyle: CSSProperties = SKELETON_SURFACE_STYLE;
const LOCKER_DETAIL_SKELETON_ROWS = ["address", "price", "size", "info"];
const REALTIME_STATUS_CARD_OVERLAY_GAP = 14;
/** full 콘텐츠 측정 시 실시간 카드가 DOM 에 들어 있는지 확인하는 표식 */
const REALTIME_CARD_MEASURE_SELECTOR = "[data-realtime-status-card]";

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
}

export const LOCKER_DETAIL_FULL_TOP_OFFSET = 112;
const DETAIL_CONTENT_TOP_PADDING = 8;
const DETAIL_CONTENT_BOTTOM_PADDING = 24;
const DETAIL_DISMISS_VISIBLE_HEIGHT = 52;
const DETAIL_MINI_VISIBLE_HEIGHT = 111;
const DETAIL_HALF_VISIBLE_HEIGHT = 191;
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
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  fullContentHeight?: number | null;
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

export const resolveLockerDetailFullSnapPoint = ({
  contentHeight,
  maxSnapPoint,
  minSnapPoint,
  windowHeight,
}: {
  contentHeight?: number | null;
  maxSnapPoint: number;
  minSnapPoint: number;
  windowHeight: number;
}) => {
  if (!contentHeight || contentHeight <= 0) {
    return minSnapPoint;
  }

  return Math.min(
    maxSnapPoint,
    Math.max(minSnapPoint, windowHeight - contentHeight),
  );
};

export const resolveLockerDetailSnapPoints = ({
  fullContentHeight,
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
}: ResolveLockerDetailSnapPointsOptions) => {
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - DETAIL_DISMISS_VISIBLE_HEIGHT;
  const resolvedFullTopOffset = minSnapPoint ?? LOCKER_DETAIL_FULL_TOP_OFFSET;
  const resolvedMinSnapPoint = resolveLockerDetailFullSnapPoint({
    contentHeight: fullContentHeight,
    maxSnapPoint: resolvedMaxSnapPoint,
    minSnapPoint: resolvedFullTopOffset,
    windowHeight,
  });
  const resolvedSnapPoint =
    snapPoint ??
    resolveLockerDetailSnapOffset({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      visibleHeight: DETAIL_HALF_VISIBLE_HEIGHT,
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
}: LockerDetailBottomSheetProps) {
  const [windowHeight, setWindowHeight] = useState(812);
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [fullContentHeight, setFullContentHeight] = useState<number | null>(
    null,
  );
  const fullContentMeasureRef = useRef<HTMLDivElement | null>(null);
  const moreActionsButtonRef = useRef<HTMLButtonElement | null>(null);
  const realtimeAvailability = locker.realtimeAvailability;
  const isRealtimeAvailable = realtimeAvailability?.isAvailable === true;
  const updateFullContentHeight = useCallback(() => {
    const element = fullContentMeasureRef.current;

    if (!element) {
      setFullContentHeight(null);
      return;
    }

    /**
     * 실시간 카드는 full 에서만 콘텐츠 안에 들어간다. 단계에 따라 DOM 에서 빠지면
     * 측정값이 달라져 full 스냅 위치가 흔들리므로, 빠져 있는 동안은 카드 블록 높이를
     * 더해 full 기준으로 맞춘다. 자리를 비워 두면 하프에서 빈 공간이 보인다.
     *
     * 카드가 드나들면 contentStack 높이가 바뀌어 ResizeObserver 가 다시 부르고,
     * 그때 DOM 을 직접 확인하므로 보정값이 측정 시점과 어긋나지 않는다.
     */
    const missingRealtimeCardHeight =
      isRealtimeAvailable &&
      element.querySelector(REALTIME_CARD_MEASURE_SELECTOR) === null
        ? LOCKER_REALTIME_STATUS_CARD_HEIGHT_PX + CONTENT_STACK_GAP_PX
        : 0;

    setFullContentHeight(
      Math.ceil(
        element.scrollHeight +
          missingRealtimeCardHeight +
          DETAIL_CONTENT_TOP_PADDING +
          DETAIL_CONTENT_BOTTOM_PADDING,
      ),
    );
  }, [isRealtimeAvailable]);
  const handleFullContentMeasureRef = useCallback(
    (element: HTMLDivElement | null) => {
      fullContentMeasureRef.current = element;
      updateFullContentHeight();
    },
    [updateFullContentHeight],
  );
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
    fullContentHeight,
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
  const detailHelpText = locker.detailHelpText ?? m.locker_detail_detail_help();
  const canFavorite =
    isFavoriteActionVisible && typeof onFavoriteChange === "function";

  const handleFavoritePress = () => {
    if (!canFavorite) {
      return;
    }

    onFavoriteChange?.(locker, !locker.isFavorite);
  };

  const handleBack = () => {
    onBack?.();
  };

  const handleShare = () => {
    onShare?.(locker);
  };

  const handleReport = () => {
    setIsCorrectionOpen(true);
    onReport?.(locker);
  };

  // 부모가 제출 핸들러를 넘기지 않았으면 흐름에도 넘기지 않는다. 그래야
  // 요청 없이 성공 팝업이 열리는 일이 없다.
  const handleCorrectionSubmit = onCorrectionSubmit
    ? (request: LockerCorrectionRequest) => onCorrectionSubmit(locker, request)
    : undefined;

  const handleNavigate = () => {
    onNavigate?.(locker);
  };

  const handleOpenMoreActions = () => {
    setIsMoreActionsOpen(true);
  };

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

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (loadState !== "ready") {
      setFullContentHeight(null);
      return;
    }

    updateFullContentHeight();
    const element = fullContentMeasureRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateFullContentHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [loadState, updateFullContentHeight]);

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
        onDismiss={handleBack}
      >
        <div className={sheetColumn}>
          {loadState === "loading" ? (
            <LockerDetailLoadingContent />
          ) : loadState === "error" ? (
            <LockerDetailErrorContent onBack={handleBack} onRetry={onRetry} />
          ) : (
            <FullDetailContent
              locker={locker}
              images={locker.images ?? []}
              detailHelpText={detailHelpText}
              onClose={handleBack}
              onMoreActionsOpen={handleOpenMoreActions}
              moreActionsButtonRef={moreActionsButtonRef}
              onNavigate={handleNavigate}
              snapStage={currentSnapStage}
              isRealtimeCardVisible={isSheetAtFullOffset}
              isScrollEnabled={currentSnapStage === "full"}
              contentRef={handleFullContentMeasureRef}
            />
          )}
        </div>
      </DraggableBottomSheet>
      <LockerDetailMoreActionsModal
        isOpen={isMoreActionsOpen}
        onOpenChange={setIsMoreActionsOpen}
        anchorRef={moreActionsButtonRef}
        isFavorite={locker.isFavorite === true}
        canFavorite={canFavorite}
        onShare={handleShare}
        onFavoriteChange={handleFavoritePress}
        onReport={handleReport}
      />
      <LockerCorrectionRequestFlow
        key={locker.lockerId}
        isOpen={isCorrectionOpen}
        onOpenChange={setIsCorrectionOpen}
        onConfirm={handleCorrectionSubmit}
      />
    </>
  );
}

function LockerDetailLoadingContent() {
  return (
    <output
      className={loadingContent}
      aria-live="polite"
      aria-label={m.search_result_loading_aria()}
    >
      <div className={loadingSummary}>
        <div className={loadingTextStack}>
          <Skeleton
            width="72%"
            height={18}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
          <Skeleton
            width="54%"
            height={14}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
          <Skeleton
            width="86%"
            height={14}
            borderRadius={6}
            style={skeletonSurfaceStyle}
          />
        </div>
        <Skeleton
          width={32}
          height={32}
          borderRadius={16}
          style={skeletonSurfaceStyle}
        />
      </div>
      <Skeleton
        width="100%"
        height={64}
        borderRadius={12}
        style={skeletonSurfaceStyle}
      />
      <div className={loadingDetailList}>
        {LOCKER_DETAIL_SKELETON_ROWS.map((rowKey) => (
          <div key={rowKey} className={loadingDetailRow}>
            <Skeleton
              width={24}
              height={24}
              borderRadius={6}
              style={skeletonSurfaceStyle}
            />
            <div className={loadingTextStack}>
              <Skeleton
                width="70%"
                height={15}
                borderRadius={6}
                style={skeletonSurfaceStyle}
              />
              <Skeleton
                width="48%"
                height={13}
                borderRadius={6}
                style={skeletonSurfaceStyle}
              />
            </div>
          </div>
        ))}
      </div>
      <Skeleton
        width="100%"
        height={160}
        borderRadius={6}
        style={skeletonSurfaceStyle}
      />
      <div className={loadingActionRow}>
        <Skeleton
          width={56}
          height={40}
          borderRadius={8}
          style={skeletonSurfaceStyle}
        />
        <Skeleton
          width="100%"
          height={40}
          borderRadius={8}
          style={skeletonSurfaceStyle}
        />
      </div>
    </output>
  );
}

function LockerDetailErrorContent({
  onBack,
  onRetry,
}: {
  onBack: () => void;
  onRetry?: () => void;
}) {
  return (
    <div className={contentStack}>
      <div className={detailHeader}>
        <DetailBackButton onBack={onBack} />
      </div>
      <SearchAsyncFeedback variant="result-error" onRetry={onRetry} />
    </div>
  );
}

function FullDetailContent({
  locker,
  images,
  detailHelpText,
  onClose,
  onMoreActionsOpen,
  moreActionsButtonRef,
  onNavigate,
  snapStage,
  isRealtimeCardVisible,
  isScrollEnabled,
  contentRef,
}: {
  locker: LockerDetailItem;
  images: string[];
  detailHelpText: string;
  onClose: () => void;
  onMoreActionsOpen: () => void;
  moreActionsButtonRef: RefObject<HTMLButtonElement | null>;
  onNavigate: () => void;
  snapStage: LockerDetailSheetSnapStage;
  isRealtimeCardVisible: boolean;
  isScrollEnabled: boolean;
  contentRef?: (element: HTMLDivElement | null) => void;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRootRef = useRef<HTMLDivElement | null>(null);
  const realtimeAvailability = locker.realtimeAvailability;
  const isRealtimeAvailable = realtimeAvailability?.isAvailable === true;

  const handleOpenImagePreview = (
    index: number,
    trigger: HTMLButtonElement,
  ) => {
    previewTriggerRef.current = trigger;
    setPreviewIndex(index);
  };

  const handleCloseImagePreview = () => {
    const trigger = previewTriggerRef.current;
    previewTriggerRef.current = null;
    setPreviewIndex(null);

    // 미리보기를 연 사진 버튼으로 포커스를 돌려 준다.
    if (trigger?.isConnected) {
      trigger.focus();
      return;
    }

    /**
     * 그 사진이 깨졌거나 시트가 리마운트돼 버튼이 사라졌을 수 있다. 분리된 노드에
     * focus() 해도 포커스는 body 로 빠지므로, 남아 있는 첫 사진으로 옮기고
     * 사진이 하나도 없으면 시트에 항상 있는 더보기 버튼으로 되돌린다.
     */
    const fallback = contentRootRef.current?.querySelector<HTMLButtonElement>(
      "[data-image-index] button",
    );
    (fallback ?? moreActionsButtonRef.current)?.focus();
  };

  return (
    <div
      ref={contentRootRef}
      className={[
        fullContentScroll,
        isScrollEnabled ? fullContentScrollEnabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-scroll-enabled={isScrollEnabled ? "true" : "false"}
    >
      <div ref={contentRef} className={contentStack}>
        <SummarySection
          locker={locker}
          onClose={onClose}
          onMoreActionsOpen={onMoreActionsOpen}
          moreActionsButtonRef={moreActionsButtonRef}
          snapStage={snapStage}
          canExpandTitle={isScrollEnabled}
        />
        {/* data 속성은 높이 보정이 REALTIME_CARD_MEASURE_SELECTOR 로 찾는 표식이다. */}
        {isRealtimeAvailable && isRealtimeCardVisible ? (
          <div data-realtime-status-card="">
            <LockerRealtimeStatusCard
              availability={realtimeAvailability}
              variant="inline"
            />
          </div>
        ) : null}
        <hr className={realtimeAvailabilityDivider} />
        <div className={fullDetailList}>
          <DetailInfoRow
            icon={<IconLockerDetailMapPin24 />}
            title={locker.address}
            description={locker.floorLabel}
            titleClassName={detailTitleMultiline}
          />
          <DetailInfoRow
            icon={<IconLockerDetailWallet24 />}
            title={m.locker_detail_price_section()}
            description={locker.priceLabel ?? formatLockerPriceLabel()}
            iconTone="neutral"
          />
          {locker.sizeLabel ? (
            <DetailInfoRow
              icon={<IconLockerDetailCapacity24 />}
              title={m.locker_detail_size_section()}
              description={locker.sizeLabel}
              iconTone="neutral"
            />
          ) : null}
          <DetailInfoRow
            icon={<IconCaution24 />}
            title={m.locker_detail_info_section()}
            description={detailHelpText}
            iconTone="neutral"
            descriptionClassName={detailDescriptionMultiline}
          />
        </div>
        <LockerDetailImageStrip
          images={images}
          onOpenPreview={handleOpenImagePreview}
        />
        {/*
          @deprecated 정확성 vote UI는 상세 화면 개편에서 노출을 중단했다.
          롤백 시 features/vote의 훅·모델·API를 다시 연결하고,
          이 위치에 기존 액션 영역을 복원한다.
        */}
        <div className={actionSection}>
          <div className={actionDivider} />
          <ActionRow isFull onNavigate={onNavigate} />
        </div>
      </div>
      {previewIndex === null ? null : (
        <OriginalImagePreview
          images={images}
          initialIndex={previewIndex}
          navigationLabels={{
            previous: m.locker_detail_image_previous(),
            next: m.locker_detail_image_next(),
          }}
          loadFailedLabel={m.locker_detail_image_load_failed()}
          alt={m.report_section_photo()}
          closeLabel={m.search_close_aria()}
          onClose={handleCloseImagePreview}
        />
      )}
    </div>
  );
}

function DetailBackButton({ onBack }: { onBack: () => void }) {
  return (
    <Button
      variant="ghost"
      intent="neutral"
      size="S"
      className={backButton}
      onPress={onBack}
      aria-label={m.locker_detail_back_aria()}
    >
      <IconChevronLeft13 className={backIcon} />
    </Button>
  );
}

function SummarySection({
  locker,
  onClose,
  onMoreActionsOpen,
  moreActionsButtonRef,
  snapStage,
  canExpandTitle,
}: {
  locker: LockerDetailItem;
  onClose: () => void;
  onMoreActionsOpen: () => void;
  moreActionsButtonRef: RefObject<HTMLButtonElement | null>;
  snapStage: LockerDetailSheetSnapStage;
  canExpandTitle: boolean;
}) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  const titleText = locker.title;
  const isMiniSnapStage = snapStage === "mini";
  const summaryTrailingText = isMiniSnapStage
    ? locker.address
    : locker.updatedLabel || locker.address;
  const summaryTrailingNode = isMiniSnapStage ? (
    <span className={metaTruncatedText}>{summaryTrailingText}</span>
  ) : (
    summaryTrailingText
  );
  const distanceText =
    locker.distanceLabel.trim() || m.locker_detail_distance_not_provided();
  const operatingHoursText =
    locker.operatingHoursLabel ?? formatLockerOperatingHoursLabel();
  const canShowTitleExpandButton =
    canExpandTitle && (isTitleOverflowing || isTitleExpanded);

  const handleTitleOverflowChange = useCallback(
    (nextIsOverflowing: boolean) => {
      setIsTitleOverflowing(nextIsOverflowing);
    },
    [],
  );

  const handleTitleExpandToggle = () => {
    setIsTitleExpanded((current) => !current);
  };

  useEffect(() => {
    if (titleText.length > 0) {
      setIsTitleExpanded(false);
      setIsTitleOverflowing(false);
    }
  }, [titleText]);

  useEffect(() => {
    if (!canExpandTitle) {
      setIsTitleExpanded(false);
    }
  }, [canExpandTitle]);

  return (
    <section
      className={summarySection}
      aria-label={m.locker_detail_summary_aria()}
    >
      <div className={summaryRow}>
        <div className={summaryTextColumn}>
          <div className={titleControlRow}>
            <h2
              className={[
                lockerTitle,
                isTitleExpanded ? lockerTitleExpanded : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isTitleExpanded ? (
                titleText
              ) : (
                <OverflowMarqueeText
                  text={titleText}
                  title={titleText}
                  onOverflowChange={handleTitleOverflowChange}
                />
              )}
            </h2>
            {canShowTitleExpandButton ? (
              <button
                type="button"
                className={titleExpandButton}
                onClick={handleTitleExpandToggle}
                aria-expanded={isTitleExpanded}
                aria-label={
                  isTitleExpanded
                    ? m.locker_detail_title_collapse_aria()
                    : m.locker_detail_title_expand_aria()
                }
              >
                <IconChevronLeft13
                  className={[
                    titleExpandIcon,
                    isTitleExpanded ? titleExpandIconExpanded : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              </button>
            ) : null}
          </div>
          <InlineMeta
            className={distanceRow}
            left={
              <span className={metaIconText}>
                <IconDistanceRoute24 className={metaIcon} />
                {distanceText}
              </span>
            }
            right={
              <span className={metaIconText}>
                <IconNavigationClock24 className={metaIcon} />
                {operatingHoursText}
              </span>
            }
          />
          <InlineMeta left={locker.categoryLabel} right={summaryTrailingNode} />
        </div>

        <div className={summaryActions}>
          <button
            ref={moreActionsButtonRef}
            type="button"
            className={summaryIconButton}
            onClick={onMoreActionsOpen}
            aria-label={m.locker_detail_more_actions_open_aria()}
          >
            <IconMore24 />
          </button>
          <button
            type="button"
            className={summaryIconButton}
            onClick={onClose}
            aria-label={m.search_close_aria()}
          >
            <IconX24 />
          </button>
        </div>
      </div>
    </section>
  );
}

function DetailInfoRow({
  icon,
  title,
  description,
  trailing,
  iconTone = "brand",
  titleClassName,
  descriptionClassName,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  trailing?: [string, string];
  iconTone?: "brand" | "neutral";
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  const iconClassName = [
    detailIcon,
    iconTone === "neutral" ? detailIconNeutral : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={detailItem}>
      <div className={detailItemContent}>
        <div className={detailLeading}>
          <span className={iconClassName} aria-hidden="true">
            {icon}
          </span>
          <div className={detailTextColumn}>
            <span
              className={[detailTitle, titleClassName]
                .filter(Boolean)
                .join(" ")}
            >
              {title}
            </span>
            {description ? (
              <span
                className={[detailDescription, descriptionClassName]
                  .filter(Boolean)
                  .join(" ")}
              >
                {description}
              </span>
            ) : null}
          </div>
        </div>
        {trailing ? (
          <div className={detailTrailing} aria-hidden="true">
            <span>{trailing[0]}</span>
            <span>{trailing[1]}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ActionRow({
  isFull = false,
  onNavigate,
}: {
  isFull?: boolean;
  onNavigate: () => void;
}) {
  return (
    <div className={isFull ? fullActionRow : actionRow}>
      <Button
        variant="filled"
        intent="primary"
        size={isFull ? "L" : "S"}
        className={[
          primaryActionButton,
          isFull ? fullPrimaryActionButton : "",
        ].join(" ")}
        onPress={onNavigate}
      >
        {m.locker_detail_navigate()}
      </Button>
    </div>
  );
}

function InlineMeta({
  left,
  right,
  className,
}: {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}) {
  const hasLeft =
    typeof left === "string" ? left.trim().length > 0 : left != null;
  const hasRight =
    typeof right === "string" ? right.trim().length > 0 : right != null;

  return (
    <div className={[metaRow, className].filter(Boolean).join(" ")}>
      {hasLeft ? left : null}
      {hasLeft && hasRight ? (
        <span className={metaDot} aria-hidden="true" />
      ) : null}
      {right}
    </div>
  );
}
