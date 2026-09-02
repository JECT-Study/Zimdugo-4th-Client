import { m } from "@repo/i18n";
import {
  IconCaution24,
  IconChevronLeft13,
  IconCopy16,
  IconDistanceRoute24,
  IconLockerDetailCapacity24,
  IconLockerDetailMapPin24,
  IconLockerDetailWallet24,
  IconMore24,
  IconNavigationClock24,
  IconRoute20,
  IconTimerStart20,
  IconX24,
} from "@repo/ui/assets/icons";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { Popup } from "@repo/ui/components/popup";
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
import { getRemainingTimeParts } from "#/features/locker-timer/model/locker-timer-format";
import {
  describeFailure,
  titleForFailure,
  useLockerTimerSession,
} from "#/features/locker-timer/model/useLockerTimerSession";
import { LockerTimerModal } from "#/features/locker-timer/ui/LockerTimerModal";
import { SearchAsyncFeedback } from "#/features/search/ui/search-async-feedback/SearchAsyncFeedback";
import { useSafeAreaInsetTop } from "#/shared/hooks/useSafeAreaInsetTop";
import {
  resolveSheetFullSnapPoint,
  resolveSheetTopLimitPx,
} from "#/shared/lib/app-chrome-layout";
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
  formatLockerSizeLabel,
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
  actionFooter,
  actionIcon,
  actionRow,
  backButton,
  backIcon,
  CONTENT_STACK_GAP_PX,
  contentStack,
  detailCopyButton,
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
  detailTitleRow,
  detailTrailing,
  distanceRow,
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
  timerActionButton,
  timerActionButtonRunning,
  timerInUseBadge,
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
const formatTimerEndTime = (endAt: number) => {
  const endTime = new Date(endAt);
  return `${String(endTime.getHours()).padStart(2, "0")}:${String(
    endTime.getMinutes(),
  ).padStart(2, "0")}`;
};

const formatRemainingTime = (remainingTimeInSeconds: number) => {
  const { hours, minutes } = getRemainingTimeParts(remainingTimeInSeconds);
  return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")}`;
};

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
const DETAIL_ACTION_FOOTER_HEIGHT = 79;

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
  const [windowHeight, setWindowHeight] = useState(812);
  const safeAreaInsetTop = useSafeAreaInsetTop();
  const [isMoreActionsOpen, setIsMoreActionsOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isTimerStartConfirmationOpen, setIsTimerStartConfirmationOpen] =
    useState(false);
  const [isPermissionNoticeOpen, setIsPermissionNoticeOpen] = useState(false);
  const [isTimerFinishedOpen, setIsTimerFinishedOpen] = useState(false);
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [timerHours, setTimerHours] = useState("00");
  const [timerMinutes, setTimerMinutes] = useState("00");
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const timerSession = useLockerTimerSession(locker.lockerId);
  const [fullContentHeight, setFullContentHeight] = useState<number | null>(
    null,
  );
  const fullContentMeasureRef = useRef<HTMLDivElement | null>(null);
  const actionFooterMeasureRef = useRef<HTMLDivElement | null>(null);
  /**
   * 마지막으로 잰 액션 영역 높이.
   *
   * 미니에서는 이 영역이 DOM 에서 빠지는데, 그때 0 으로 재면 full 스냅이 그만큼
   * 낮아진다. 실시간 카드와 같은 이유로 마지막 값을 들고 있는다.
   */
  const actionFooterHeightRef = useRef(DETAIL_ACTION_FOOTER_HEIGHT);
  const [actionFooterHeight, setActionFooterHeight] = useState(
    DETAIL_ACTION_FOOTER_HEIGHT,
  );
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

    /*
     * 액션 영역은 스크롤 밖에 있어 콘텐츠 높이에 잡히지 않는다. 빼고 재면 full
     * 스냅이 그 높이만큼 낮게 잡혀 버튼이 화면 밖으로 밀린다.
     */
    const measuredFooterHeight = actionFooterMeasureRef.current?.offsetHeight;
    if (measuredFooterHeight) {
      actionFooterHeightRef.current = measuredFooterHeight;
      setActionFooterHeight(measuredFooterHeight);
    }
    const footerHeight = actionFooterHeightRef.current;

    setFullContentHeight(
      Math.ceil(
        element.scrollHeight +
          footerHeight +
          missingRealtimeCardHeight +
          DETAIL_CONTENT_TOP_PADDING,
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
  const handleActionFooterMeasureRef = useCallback(
    (element: HTMLDivElement | null) => {
      actionFooterMeasureRef.current = element;
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
  const detailHelpText = locker.detailHelpText ?? m.locker_detail_detail_help();
  const canFavorite =
    isFavoriteActionVisible && typeof onFavoriteChange === "function";
  // 이펙트 의존성으로 쓰려면 객체가 아니라 값으로 꺼내 두어야 한다. 세션 객체는
  // 매 렌더 새로 만들어져 통째로 의존하면 이펙트가 매번 다시 돈다.
  const clearTimerFailure = timerSession.clearFailure;
  const timerEndAt = timerSession.endAt;
  const isStoppingTimer = timerSession.isStopping;
  const remainingTimeInSeconds = timerSession.endAt
    ? Math.max(0, Math.ceil((timerSession.endAt - timerNow) / 1000))
    : 0;
  const isTimerRunning =
    timerSession.endAt !== null && remainingTimeInSeconds > 0;
  const timerEndTimeLabel = timerSession.endAt
    ? formatTimerEndTime(timerSession.endAt)
    : "";

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

  const handleTimerDurationChange = (hours: string, minutes: string) => {
    setTimerHours(hours);
    setTimerMinutes(minutes);
  };

  const handleTimerStartRequest = () => {
    setIsTimerStartConfirmationOpen(true);
  };

  /**
   * 설정 모달을 열기 전에 이 브라우저에서 타이머를 쓸 수 있는지 본다.
   *
   * 쓸 수 없으면 모달 대신 안내를 띄운다. 타이머는 서버 리마인더와 푸시 구독에
   * 기대므로, 구독을 만들 수 없는 브라우저에서는 시간을 골라도 켜지지 않는다.
   * 끝까지 고르고 확인까지 누른 뒤에 "홈 화면에 추가하세요" 를 보여 주면 그
   * 과정이 통째로 헛일이 된다.
   */
  const handleTimerOpen = () => {
    if (!timerSession.ensureEnvironment()) return;

    // 서버 상태를 모르는 채 열면 이미 도는 타이머를 못 본 채 새로 켜게 된다.
    // 조회가 계속 실패하면 그 타이머를 끌 수도 없으므로, 없는 것처럼 다루지
    // 않고 그대로 알린다.
    if (timerSession.isReminderUnknown) {
      timerSession.reportReminderUnknown();
      return;
    }

    setIsTimerOpen(true);
  };

  /**
   * 주소를 클립보드에 담는다.
   *
   * 길찾기까지 가지 않고 주소만 다른 앱에 옮겨 적는 경우가 많다. 실패해도 조용히
   * 두면 눌렀는지조차 알 수 없어, 성공했을 때만 알림을 띄운다.
   */
  const handleAddressCopy = (address: string) => {
    if (!navigator.clipboard) {
      console.error("주소 복사 실패: Clipboard API 미지원");
      return;
    }

    void navigator.clipboard
      .writeText(address)
      .then(() => setIsAddressCopied(true))
      .catch((error) => {
        console.error("주소 복사 실패:", error);
      });
  };

  const startTimer = async () => {
    // 중복 실행은 세션이 시작 흐름 전체를 잠가 막는다. 여기서는 화면이 눌린
    // 상태를 더 만들지 않도록 일찍 접어 둔다.
    if (timerSession.isPending) return;

    const configuredTimeInSeconds =
      (Number(timerHours) * 60 + Number(timerMinutes)) * 60;
    if (configuredTimeInSeconds <= 0) return;

    const hasStarted = await timerSession.start(configuredTimeInSeconds);
    if (hasStarted) {
      setTimerNow(Date.now());
    }
  };

  /**
   * 브라우저 권한 팝업이 뜨기 전에 왜 필요한지 먼저 알린다.
   *
   * 맥락 없이 뜨는 권한 팝업은 반사적으로 거부당하기 쉽고, 한 번 거부되면
   * 사이트 설정에 들어가야 되돌릴 수 있다. 이미 정해진 권한(허용·거부)에는
   * 이 안내를 띄우지 않는다. 물어볼 것이 없다.
   */
  const handleTimerStartConfirm = () => {
    setIsTimerStartConfirmationOpen(false);

    const needsPermissionNotice =
      typeof Notification !== "undefined" &&
      Notification.permission === "default";

    if (needsPermissionNotice) {
      setIsPermissionNoticeOpen(true);
      return;
    }

    void startTimer();
  };

  /**
   * 안내를 확인한 뒤 실제로 시작한다.
   *
   * 브라우저는 사용자 제스처 안에서만 권한 팝업을 띄운다. 이 확인 버튼의 클릭이
   * 그 제스처라 여기서 곧바로 이어 불러야 한다.
   */
  const handlePermissionNoticeConfirm = () => {
    setIsPermissionNoticeOpen(false);
    void startTimer();
  };

  const handleTimerStop = async () => {
    const hasStopped = await timerSession.stop();
    if (!hasStopped) return;

    setTimerHours("00");
    setTimerMinutes("00");
    setIsTimerOpen(false);
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

  /*
   * 보관함이 바뀌면 고르던 시간과 열려 있던 모달을 지운다.
   *
   * 시트는 보관함마다 새로 마운트되지 않는다(스냅 위치를 지키려고 인스턴스를
   * 유지한다). 초기화하지 않으면 A 에서 고른 시간이 B 로 넘어가, 사용자가 확인만
   * 눌러도 의도하지 않은 리마인더가 만들어진다.
   *
   * 이펙트 안에서 lockerId 를 읽지는 않지만 그 값이 바뀌는 것이 곧 재실행 신호다.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: lockerId 는 읽지 않고 재실행 신호로만 쓴다
  useEffect(() => {
    setTimerNow(Date.now());
    setIsTimerOpen(false);
    setIsTimerStartConfirmationOpen(false);
    // 팝업도 함께 접는다. 남겨 두면 A 의 종료·실패 알림이 B 위에 뜬다.
    setIsPermissionNoticeOpen(false);
    setIsTimerFinishedOpen(false);
    clearTimerFailure();
    setTimerHours("00");
    setTimerMinutes("00");
  }, [locker.lockerId, clearTimerFailure]);

  useEffect(() => {
    if (timerSession.endAt === null) return;

    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, [timerSession.endAt]);

  /*
   * 화면을 보고 있는 사이에 타이머가 끝나면 알린다.
   *
   * 푸시는 앱이 닫혀 있을 때를 위한 것이라, 앱을 열어 둔 채 끝나는 경우를 덮지
   * 못한다. 게이지만 0 이 되고 아무 말이 없으면 끝난 것인지 멈춘 것인지 알 수
   * 없다.
   *
   * 사용자가 직접 끄면 endAt 이 null 이 되어 정리 함수가 예약을 지운다. 끄기와
   * 종료를 같은 팝업으로 알리지 않는 이유다. 이미 지난 타이머로 다시 진입한
   * 경우도 서버 목록에서 빠져 있어 여기까지 오지 않는다.
   */
  useEffect(() => {
    // 끄는 중에는 예약하지 않는다. 삭제 응답을 기다리는 사이에도 endAt 은 남아
    // 있어서, 종료 직전에 끄면 삭제가 성공해도 종료 팝업이 먼저 뜬다. 끄기가
    // 실패하면 isStopping 이 풀리며 남은 시간으로 다시 예약된다.
    if (timerEndAt === null || isStoppingTimer) return;

    const remainingMs = timerEndAt - Date.now();
    if (remainingMs <= 0) return;

    const timeoutId = window.setTimeout(
      () => setIsTimerFinishedOpen(true),
      remainingMs,
    );

    return () => window.clearTimeout(timeoutId);
  }, [timerEndAt, isStoppingTimer]);

  /*
   * 설정 화면의 종료 예정 시각은 현재 시각에 고른 길이를 더해 보여 준다. 모달을
   * 열어 둔 채 시간이 흐르면 그 값이 굳어, 실제로 시작할 때 계산되는 종료 시각과
   * 벌어진다. 열려 있는 동안 현재 시각을 따라가게 한다.
   */
  useEffect(() => {
    if (!isTimerOpen || timerSession.endAt !== null) return;

    const intervalId = window.setInterval(() => setTimerNow(Date.now()), 1000);

    return () => window.clearInterval(intervalId);
  }, [isTimerOpen, timerSession.endAt]);

  /*
   * 지도 컨트롤에서 넘어온 자동 열기. 여기는 환경을 보지 않는다. 이미 도는
   * 타이머를 보러 오는 길이라 구독이 만들어졌다는 뜻이고, 남은 시간을 확인하는
   * 것까지 막을 이유가 없다.
   */
  useEffect(() => {
    if (!shouldOpenTimer) return;

    setIsTimerOpen(true);
    onTimerAutoOpenHandled?.();
  }, [shouldOpenTimer, onTimerAutoOpenHandled]);

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
              onTimerOpen={handleTimerOpen}
              onAddressCopy={handleAddressCopy}
              isTimerRunning={isTimerRunning}
              timerEndTimeLabel={timerEndTimeLabel}
              snapStage={currentSnapStage}
              isRealtimeCardVisible={isSheetAtFullOffset}
              isScrollEnabled={currentSnapStage === "full"}
              contentRef={handleFullContentMeasureRef}
              footerRef={handleActionFooterMeasureRef}
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
      <LockerTimerModal
        isOpen={isTimerOpen}
        onOpenChange={setIsTimerOpen}
        {...(isTimerRunning
          ? {
              mode: "running" as const,
              remainingTimeLabel: formatRemainingTime(remainingTimeInSeconds),
              endTimeLabel: timerEndTimeLabel,
              remainingTimeInSeconds,
              configuredTimeInSeconds: timerSession.totalSeconds,
              onStop: handleTimerStop,
            }
          : {
              mode: "setup" as const,
              hours: timerHours,
              minutes: timerMinutes,
              currentTime: new Date(timerNow),
              onDurationChange: handleTimerDurationChange,
              onStart: handleTimerStartRequest,
            })}
      />
      {/*
       * 실패를 조용히 넘기지 않는다. 서버가 소스라 실패하면 타이머도 서지
       * 않는데, 그 사실을 화면이 말하지 않으면 눌러도 아무 일이 없는 것처럼
       * 보인다. 알 수 없는 실패는 서버 코드를 문구에 남겨 어디가 막혔는지
       * 화면만 보고 알 수 있게 한다.
       */}
      <Popup
        isOpen={timerSession.failure !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) timerSession.clearFailure();
        }}
        titleText={
          timerSession.failure
            ? titleForFailure(timerSession.failure)
            : m.locker_timer_error_title()
        }
        helperText={
          timerSession.failure
            ? describeFailure(timerSession.failure.reason)
            : undefined
        }
        primaryAction={{
          label: m.common_confirm(),
          onPress: timerSession.clearFailure,
        }}
      />
      <Popup
        isOpen={isPermissionNoticeOpen}
        onOpenChange={setIsPermissionNoticeOpen}
        titleText={m.locker_timer_permission_notice_title()}
        helperText={m.locker_timer_permission_notice_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: handlePermissionNoticeConfirm,
        }}
      />
      <Popup
        isOpen={isTimerFinishedOpen}
        onOpenChange={setIsTimerFinishedOpen}
        titleText={m.locker_timer_finished_title()}
        helperText={m.locker_timer_finished_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setIsTimerFinishedOpen(false),
        }}
      />
      <Popup
        isOpen={isTimerStartConfirmationOpen}
        onOpenChange={setIsTimerStartConfirmationOpen}
        titleText={m.locker_timer_start_confirm()}
        primaryAction={{
          label: m.common_yes(),
          onPress: handleTimerStartConfirm,
        }}
        secondaryAction={{
          label: m.common_no(),
          onPress: () => setIsTimerStartConfirmationOpen(false),
        }}
      />
      <Popup
        isOpen={isAddressCopied}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsAddressCopied(false);
        }}
        titleText={m.locker_detail_share_copied()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setIsAddressCopied(false),
        }}
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
  onTimerOpen,
  onAddressCopy,
  isTimerRunning,
  timerEndTimeLabel,
  snapStage,
  isRealtimeCardVisible,
  isScrollEnabled,
  contentRef,
  footerRef,
}: {
  locker: LockerDetailItem;
  images: string[];
  detailHelpText: string;
  onClose: () => void;
  onMoreActionsOpen: () => void;
  moreActionsButtonRef: RefObject<HTMLButtonElement | null>;
  onNavigate: () => void;
  onTimerOpen: () => void;
  onAddressCopy: (address: string) => void;
  isTimerRunning: boolean;
  timerEndTimeLabel: string;
  snapStage: LockerDetailSheetSnapStage;
  isRealtimeCardVisible: boolean;
  isScrollEnabled: boolean;
  contentRef?: (element: HTMLDivElement | null) => void;
  footerRef?: (element: HTMLDivElement | null) => void;
}) {
  const isActionFooterVisible = snapStage === "full" || snapStage === "half";
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
    <>
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
            isTimerRunning={isTimerRunning}
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
              titleAction={
                <button
                  type="button"
                  className={detailCopyButton}
                  onClick={() => onAddressCopy(locker.address)}
                  aria-label={m.locker_detail_address_copy_aria()}
                >
                  <IconCopy16 />
                </button>
              }
            />
            <DetailInfoRow
              icon={<IconLockerDetailWallet24 />}
              title={m.locker_detail_price_section()}
              description={locker.priceLabel ?? formatLockerPriceLabel()}
              iconTone="neutral"
            />
            <DetailInfoRow
              icon={<IconLockerDetailCapacity24 />}
              title={m.locker_detail_size_section()}
              description={formatLockerSizeLabel(locker.sizeLabel)}
              iconTone="neutral"
            />
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
        </div>
      </div>
      {/*
        액션 영역은 스크롤 밖에 둔다. 안에 두면 콘텐츠가 길 때 접힘 아래로 내려가
        길찾기 버튼이 보이지 않는다. 시트 아래 여백은 홈 인디케이터를 피한다.

        시트 높이가 곧 보이는 높이라 여기 두면 하프에서도 화면 안에 들어온다.
        미니(111px)에서는 요약만으로 자리가 차서 내린다.
      */}
      {isActionFooterVisible ? (
        <div ref={footerRef} className={actionFooter}>
          <div className={actionDivider} />
          <ActionRow
            onNavigate={onNavigate}
            onTimerOpen={onTimerOpen}
            isTimerRunning={isTimerRunning}
            timerEndTimeLabel={timerEndTimeLabel}
          />
        </div>
      ) : null}
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
    </>
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
  isTimerRunning,
  onClose,
  onMoreActionsOpen,
  moreActionsButtonRef,
  snapStage,
  canExpandTitle,
}: {
  locker: LockerDetailItem;
  isTimerRunning: boolean;
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
          {isTimerRunning ? (
            <span className={timerInUseBadge}>{m.locker_timer_in_use()}</span>
          ) : null}
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
  titleAction,
  iconTone = "brand",
  titleClassName,
  descriptionClassName,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  trailing?: [string, string];
  /** 제목 옆에 붙는 동작. 지금은 주소 복사 하나뿐이다. */
  titleAction?: ReactNode;
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
            <span className={detailTitleRow}>
              <span
                className={[detailTitle, titleClassName]
                  .filter(Boolean)
                  .join(" ")}
              >
                {title}
              </span>
              {titleAction}
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

/**
 * full 콘텐츠 맨 아래 액션 영역.
 *
 * 타이머와 길찾기를 나란히 놓는다. 세로로 쌓으면 두 버튼과 간격만 116px 이라
 * 하프 시트(191px)에서 요약을 밀어낸다.
 */
function ActionRow({
  onNavigate,
  onTimerOpen,
  isTimerRunning,
  timerEndTimeLabel,
}: {
  onNavigate: () => void;
  onTimerOpen: () => void;
  isTimerRunning: boolean;
  timerEndTimeLabel: string;
}) {
  return (
    <div className={actionRow}>
      <Button
        variant="outline"
        intent="primary"
        size="L"
        className={[
          timerActionButton,
          isTimerRunning ? timerActionButtonRunning : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onPress={onTimerOpen}
      >
        <IconTimerStart20 className={actionIcon} />
        {isTimerRunning
          ? m.locker_timer_end({ time: timerEndTimeLabel })
          : m.locker_timer_set()}
      </Button>
      <Button
        variant="filled"
        intent="primary"
        size="L"
        className={[primaryActionButton, fullPrimaryActionButton].join(" ")}
        onPress={onNavigate}
      >
        <IconRoute20 className={actionIcon} />
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
