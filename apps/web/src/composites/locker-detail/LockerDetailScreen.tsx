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
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { LockerDetailItem } from "#/entities/locker/model/locker-detail";
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
import {
  formatLockerOperatingHoursLabel,
  formatLockerPriceLabel,
  formatLockerSizeLabel,
} from "#/shared/lib/locker-detail-labels";
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
/** full 콘텐츠 측정 시 실시간 카드가 DOM 에 들어 있는지 확인하는 표식 */
/**
 * 액션 영역이 아직 안 재졌을 때 쓰는 높이.
 *
 * 화면의 치수라 여기서 정한다. 표면도 첫 스냅 계산에 같은 값을 쓴다.
 */
export const DETAIL_ACTION_FOOTER_HEIGHT = 79;

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

/**
 * 보관함 상세 화면. 무엇을 담고 있는지만 안다.
 *
 * 어떤 표면에 얹히는지 — 바텀시트인지, 넓은 화면의 패널인지 — 는 모른다. 경로 라우트
 * 전환(#215)에서 화면은 Outlet 의 자식이 되고 표면은 레이아웃이 고른다. 화면이 표면을
 * 직접 렌더하면 그 선택이 라우트에 박혀, 표면을 바꿀 때 라우트를 다시 뜯게 된다.
 *
 * 앞선 두 시트(#224 #225)보다 통로가 넓다. 표면이 자리를 정하려면 콘텐츠 높이만이
 * 아니라 액션 영역 높이도 알아야 하고, 화면은 지금 자기가 어디까지 보이는지를 알아야
 * 스크롤과 액션 영역을 켜고 끈다.
 */
export interface LockerDetailScreenMetrics {
  /** 콘텐츠 전체 높이. 아직 잴 수 없으면 null 이다. */
  contentHeightPx: number | null;
  /** 액션 영역 높이. 화면에서 빠져 있는 동안에도 마지막 값을 유지한다. */
  actionFooterHeightPx: number;
}

export interface LockerDetailScreenProps {
  locker: LockerDetailItem;
  loadState?: "loading" | "error" | "ready";
  onRetry?: () => void;
  onBack?: () => void;
  onShare?: (locker: LockerDetailItem) => void;
  onNavigate?: (locker: LockerDetailItem) => void;
  onFavoriteChange?: (locker: LockerDetailItem, next: boolean) => void;
  onReport?: (item: LockerDetailItem) => void;
  onCorrectionSubmit?: (
    item: LockerDetailItem,
    request: LockerCorrectionRequest,
  ) => void | Promise<void>;
  isFavoriteActionVisible?: boolean;
  shouldOpenTimer?: boolean;
  onTimerAutoOpenHandled?: () => void;
  /** 화면이 잰 자리. 표면이 스냅 지점을 정하는 데 쓴다. */
  onMetricsChange?: (metrics: LockerDetailScreenMetrics) => void;
  /** 액션 영역을 놓을 자리가 있는가. 자리가 없는 표면은 false 를 준다. */
  isActionFooterVisible?: boolean;
  /** 요약만 보이는 좁은 자리인가. 늘 다 보이는 표면은 기본값 false 를 그대로 둔다. */
  isSummaryOnly?: boolean;
  /** 콘텐츠가 자기 안에서 스크롤해도 되는가. */
  isScrollEnabled?: boolean;
  /** 실시간 카드를 콘텐츠 안에 넣을 것인가. 표면이 밖에 띄우는 동안에는 false 다. */
  isRealtimeCardVisible?: boolean;
}

export function LockerDetailScreen({
  locker,
  loadState = "ready",
  onRetry,
  onBack,
  onShare,
  onNavigate,
  onFavoriteChange,
  onReport,
  onCorrectionSubmit,
  isFavoriteActionVisible = false,
  shouldOpenTimer = false,
  onTimerAutoOpenHandled,
  onMetricsChange,
  isActionFooterVisible = true,
  isSummaryOnly = false,
  isScrollEnabled = true,
  isRealtimeCardVisible = true,
}: LockerDetailScreenProps) {
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
  const fullContentMeasureRef = useRef<HTMLDivElement | null>(null);
  const actionFooterMeasureRef = useRef<HTMLDivElement | null>(null);
  /**
   * 마지막으로 잰 액션 영역 높이.
   *
   * 미니에서는 이 영역이 DOM 에서 빠지는데, 그때 0 으로 재면 full 스냅이 그만큼
   * 낮아진다. 실시간 카드와 같은 이유로 마지막 값을 들고 있는다.
   */
  const actionFooterHeightRef = useRef(DETAIL_ACTION_FOOTER_HEIGHT);
  const moreActionsButtonRef = useRef<HTMLButtonElement | null>(null);
  /*
   * 잰 값은 부모에게 올려보낸다. 콜백을 의존성에 넣으면 부모가 매 렌더 새 함수를
   * 주는 순간 측정이 매번 다시 붙으므로 최신 참조만 들고 있는다.
   */
  const metricsChangeRef = useRef(onMetricsChange);
  metricsChangeRef.current = onMetricsChange;
  const realtimeAvailability = locker.realtimeAvailability;
  const isRealtimeAvailable = realtimeAvailability?.isAvailable === true;
  const updateFullContentHeight = useCallback(() => {
    const element = fullContentMeasureRef.current;

    if (!element) {
      metricsChangeRef.current?.({
        contentHeightPx: null,
        actionFooterHeightPx: actionFooterHeightRef.current,
      });
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
    }
    const footerHeight = actionFooterHeightRef.current;

    /*
     * 시트가 콘텐츠 위에 두는 자리는 더하지 않는다. 그건 표면의 치수라, 화면이
     * 함께 더하면 특정 표면을 아는 셈이 된다. 표면이 자기 자리를 더한다.
     */
    metricsChangeRef.current?.({
      contentHeightPx: Math.ceil(
        element.scrollHeight + footerHeight + missingRealtimeCardHeight,
      ),
      actionFooterHeightPx: footerHeight,
    });
  }, [isRealtimeAvailable]);
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
    /*
     * 정정 요청·더보기·주소 복사도 함께 접는다.
     *
     * 특히 정정 요청은 열린 채로 두면 제출 콜백이 지금 보고 있는 보관함을 쓴다.
     * A 에서 연 모달이 B 의 정정 요청으로 나갈 수 있다.
     */
    setIsCorrectionOpen(false);
    setIsMoreActionsOpen(false);
    setIsAddressCopied(false);
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
      metricsChangeRef.current?.({
        contentHeightPx: null,
        actionFooterHeightPx: actionFooterHeightRef.current,
      });
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

  return (
    <>
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
            isActionFooterVisible={isActionFooterVisible}
            isSummaryOnly={isSummaryOnly}
            isRealtimeCardVisible={isRealtimeCardVisible}
            isScrollEnabled={isScrollEnabled}
            contentRef={handleFullContentMeasureRef}
            footerRef={handleActionFooterMeasureRef}
          />
        )}
      </div>
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
  isActionFooterVisible,
  isSummaryOnly,
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
  isActionFooterVisible: boolean;
  isSummaryOnly: boolean;
  isRealtimeCardVisible: boolean;
  isScrollEnabled: boolean;
  contentRef?: (element: HTMLDivElement | null) => void;
  footerRef?: (element: HTMLDivElement | null) => void;
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
            isSummaryOnly={isSummaryOnly}
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
  isSummaryOnly,
  canExpandTitle,
}: {
  locker: LockerDetailItem;
  isTimerRunning: boolean;
  onClose: () => void;
  onMoreActionsOpen: () => void;
  moreActionsButtonRef: RefObject<HTMLButtonElement | null>;
  isSummaryOnly: boolean;
  canExpandTitle: boolean;
}) {
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  const titleText = locker.title;
  const isMiniSnapStage = isSummaryOnly;
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
