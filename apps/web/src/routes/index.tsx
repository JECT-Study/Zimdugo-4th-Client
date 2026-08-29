import { languageTag, m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import {
  IconCircleboxClose32,
  IconNavigationCrosshair24,
  IconNavigationRefresh24,
} from "@repo/ui/tokens/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HomeHeader } from "#/composites/home/HomeHeader";
import {
  LOCKER_DETAIL_FULL_TOP_OFFSET,
  LockerDetailBottomSheet,
  type LockerDetailSheetLiveOffsetState,
  type LockerDetailSheetSnapStage,
  resolveDetailSheetVisibleHeight,
} from "#/composites/locker-detail/LockerDetailBottomSheet";
import { HomeSearchBar } from "#/composites/search/HomeSearchBar";
import { NavigationPlatformPopup } from "#/composites/search/NavigationPlatformPopup";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
  SearchFilterBottomSheet,
} from "#/composites/search/SearchFilterBottomSheet";
import {
  resolveSearchListStageVisibleHeight,
  SearchListBottomSheet,
  type SearchListSheetSnapStage,
} from "#/composites/search/SearchListBottomSheet";
import { SearchOverlay } from "#/composites/search/SearchOverlay";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import {
  createLockerDetailFromAutocompleteItem,
  createLockerDetailFromHistoryEntry,
  createLockerDetailFromPin,
  createLockerDetailFromSearchItem,
  createLockerDetailPlaceholder,
} from "#/entities/locker/lib/create-locker-detail";
import { toLockerDetailItem } from "#/entities/locker/lib/locker-detail-adapters";
import type {
  LockerDetailItem,
  LockerDetailLoadState,
} from "#/entities/locker/model/locker-detail";
import {
  MapControlsSkeleton,
  NaverMapCanvas,
  NaverMapProvider,
  resolveMapBootstrapViewport,
  subscribeMapIdle,
  useMapViewportStore,
  useNaverMapSdk,
} from "#/entities/map";
import { focusNaverMapOnCoordinates } from "#/entities/map/model/current-location";
import {
  clearHomeLocationRequestedInSession,
  hasRequestedHomeLocationInSession,
  markHomeLocationRequestedInSession,
} from "#/entities/map/model/home-location-request-session";
import { postLocationDiagnostic } from "#/entities/map/model/location-diagnostics";
import { resolveLocationRequestSettlement } from "#/entities/map/model/location-request-settlement";
import {
  fitNaverMapToBounds,
  focusNaverMapOnClusterBounds,
} from "#/entities/map/model/map-bounds";
import {
  getPinId,
  type LockerMarkerOffset,
} from "#/entities/map/model/map-marker";
import { useHasRequestedHomeLocationInSession } from "#/entities/map/model/useHomeLocationRequestSession";
import {
  type LocationData,
  type LocationRequestOutcome,
  useLocationTracking,
} from "#/entities/map/model/useLocationTracking";
import {
  LOCKER_PINS_QUERY_KEY,
  useLockerMarkers,
} from "#/entities/map/model/useLockerMarkers";
import { useSearchResultMarkers } from "#/entities/map/model/useSearchResultMarkers";
import { MyLocationMarker } from "#/entities/map/ui/MyLocationMarker";
import {
  MAP_CONTROL_FALLBACK_BOTTOM_PX,
  MAP_CONTROL_SHEET_GAP_PX,
  MAP_CONTROL_TOP_RESERVED_PX,
} from "#/entities/map/ui/map-control-stack-fallback";
import type { SearchAutocompleteItemData } from "#/entities/search";
import { useUser } from "#/entities/user/hooks/useUser";
import {
  postLockerIssueReport,
  toLockerIssueReportRequest,
} from "#/features/locker-correction/api/create-locker-issue-report";
import type { LockerCorrectionRequest } from "#/features/locker-correction/model/locker-correction-types";
import { LockerTimerMapControl } from "#/features/locker-timer/ui/LockerTimerMapControl";
import { useFavoriteLockerSession } from "#/features/search/hooks/useFavoriteLockerSession";
import {
  LOCKER_DETAIL_QUERY_KEY,
  useLockerDetail,
} from "#/features/search/hooks/useLockerDetail";
import {
  useLockerSearch,
  usePlaceLockers,
} from "#/features/search/hooks/useSearch";
import { useSearchHistory } from "#/features/search/hooks/useSearchHistory";
import {
  applyFavoriteOverlayToLockerDetail,
  applyFavoriteOverlayToLockerItems,
  applyFavoriteOverlayToSearchResultItems,
} from "#/features/search/lib/apply-favorite-overlay";
import {
  createLockerCanonicalUrl,
  createLockerDeepLinkSlug,
  createLockerDeepLinkUrl,
  createLockerPinAt,
  createLockerShareText,
  type LockerDetailSnap,
  parseOpenLockerDeepLinkSearch,
} from "#/features/search/lib/open-locker-deep-link";
import {
  getSearchQueryIssue,
  getValidatedSearchQuery,
  resolveSearchQuerySubmitAttempt,
  trimSearchQueryDraft,
} from "#/features/search/lib/sanitize-search-query";
import {
  searchLockerItemsToPins,
  searchLockerItemToPin,
  searchResultItemsToPins,
} from "#/features/search/lib/search-result-pins";
import {
  toLockerSearchFilterParams,
  toPlaceLockersFilterParams,
} from "#/features/search/lib/to-locker-search-filter-params";
import {
  mergeDisplayLockerDetailWithPreviousDistance,
  mergeStoredLockerDetailWithPreviousDistance,
} from "#/features/search/model/locker-detail-display";
import { resolveMapMarkerLayer } from "#/features/search/model/map-marker-layer-policy";
import {
  readRestoredSessionForTabReturn,
  writeMapSheetSessionSnapshot,
} from "#/features/search/model/map-sheet-session-storage";
import {
  getDetailFocusBottomInsetPx,
  getSearchBoundsBottomPadding,
} from "#/features/search/model/map-viewport-policy";
import {
  clearSearchFiltersFromSession,
  loadSearchFiltersFromSession,
  saveSearchFiltersToSession,
} from "#/features/search/model/search-filter-session";
import {
  resolveSearchHistorySelectionQuery,
  type SearchHistoryEntry,
} from "#/features/search/model/search-history";
import {
  applyLockerSearchDraft,
  createKeywordSearchSelection,
  createPlaceSearchSelection,
  type SearchSelectionState,
} from "#/features/search/model/search-selection";
import {
  readSearchPlaceIdParam,
  readSearchQueryParam,
  type SearchUrlParams,
  withLockerDetailParam,
  withoutSearchContextParams,
  withSearchPlaceIdParam,
  withSearchQueryParam,
} from "#/features/search/model/search-url-state";
import {
  type AppMapContext,
  createKeywordDetailBackTarget,
  createPlaceDetailBackTarget,
  createSearchDetailBackTarget,
  isRenderableSheetSession,
  type MapDetailBack,
  type OverlayReturnContext,
  resolveActivePlaceId,
  resolveOverlayReturnContext,
  resolveSearchBarBackAction,
  type SearchDetailBackTarget,
  type SearchListKind,
  type SheetModeForContext,
  shouldFetchKeywordSearch,
  shouldFetchPlaceLockers,
  shouldRestoreSearchListFromUrl,
  shouldShowSearchListLoading,
} from "#/features/search/model/sheet-session";
import { useSheetSnapRequest } from "#/features/search/model/useSheetSnapRequest";
import {
  createAlternateLinksForPathname,
  createLocalizedUrl,
  getSeoLocale,
  getSeoPathname,
} from "#/features/seo/model/localized-seo-head";
import type { LockerPinSearchParams } from "#/shared/api/lockers";
import {
  getLockerDetail,
  type LockerBoundsRaw,
  type LockerPinItemResponse,
} from "#/shared/api/lockers";
import { useDeviceOrientation } from "#/shared/hooks/useDeviceOrientation";
import { useLocationPermissionPopup } from "#/shared/hooks/useLocationPermissionPopup";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import { useAuthStore } from "#/shared/store/authStore";
import { useSearchStore } from "#/shared/store/search";
import {
  locationButton,
  locationControlStack,
  locationLoadingBadge,
  locationRecoveryNotice,
  locationRecoveryNoticeAction,
  locationRecoveryNoticeClose,
  locationRecoveryNoticeMessage,
  locationRecoveryNoticePositioner,
  myLocationIcon,
  pageWrapper,
  refreshButtonDisabled,
  refreshCooldownBadge,
  refreshIconSpinning,
} from "./-index.css";
import {
  resolveMapControlBottomPx,
  resolveVisibleSheetKind,
  shouldShowHomeHeader,
  shouldShowHomeSearchBar,
  shouldShowMapControls,
} from "./-map-control-visibility";

export const DETAIL_FOCUS_ZOOM = 17;
/**
 * 서버·프리렌더에서 뷰포트 높이를 알 수 없을 때 쓰는 값.
 * 클라이언트 첫 렌더도 이 값으로 시작해야 하이드레이션이 어긋나지 않는다.
 */
const SSR_WINDOW_HEIGHT_PX = 800;
/**
 * 시트가 없을 때 라이브 오프셋에 넣는 값.
 *
 * 어떤 뷰포트에서도 "시트가 차지하는 높이 0" 보다 아래를 가리켜, 컨트롤 위치
 * 식이 늘 기본 자리(clamp 하한)로 평가되게 한다. 뷰포트 높이를 쓰면 그 값이
 * 실제 화면보다 작을 때(측정 전 가정값 등) 컨트롤이 잠깐 떠오른다.
 */
const SHEET_OFFSET_NONE_PX = 1_000_000;

const DETAIL_FOCUS_MORPH_DURATION_MS = 800;
const DETAIL_SHEET_OPEN_AFTER_MORPH_DELAY_MS =
  DETAIL_FOCUS_MORPH_DURATION_MS + 40;

const parseLockerSearchParam = (raw: unknown): number | undefined => {
  if (raw === undefined || raw === null) return undefined;
  const str = String(raw).trim();
  if (!/^\d+(?:-.*)?$/.test(str)) return undefined;
  const parsed = parseInt(str, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const DEFAULT_SEARCH_COORDINATES = { lat: 37.498095, lng: 127.02761 };

const reloadForLocationRecovery = () => {
  window.location.reload();
};

type SeoHeadLocationContext = {
  location?: {
    publicHref?: string;
  };
};

/** 홈 라우트가 다루는 검색 파라미터. validateSearch 가 이 모양으로 정규화한다. */
export interface HomeSearchParams {
  locker?: string;
  openLockerId?: number;
  detailSnap?: LockerDetailSnap;
  focusLat?: number;
  focusLng?: number;
  q?: string;
  searchPlaceId?: number;
}

/** 보관함 딥링크 파라미터만 걷어 낸다. 열고 나면 주소에 남길 이유가 없다. */
const withoutLockerParam = ({ locker: _locker, ...rest }: HomeSearchParams) =>
  rest;

/** openLockerId 계열 딥링크 파라미터를 걷어 낸다. */
const withoutOpenLockerParams = ({
  openLockerId: _openLockerId,
  detailSnap: _detailSnap,
  focusLat: _focusLat,
  focusLng: _focusLng,
  ...rest
}: HomeSearchParams) => rest;

export const Route = createFileRoute("/")({
  validateSearch: (
    search: Record<string, unknown> | undefined,
  ): HomeSearchParams => {
    const safeSearch = search || {};
    const parsed = parseOpenLockerDeepLinkSearch(safeSearch);
    const lockerNum = parseLockerSearchParam(safeSearch.locker);
    const locker =
      lockerNum !== undefined ? String(safeSearch.locker).trim() : undefined;
    const q = readSearchQueryParam(safeSearch.q);
    const searchPlaceId = readSearchPlaceIdParam(safeSearch.searchPlaceId);
    return {
      ...parsed,
      locker,
      q,
      searchPlaceId,
    };
  },
  /**
   * 공개 데이터만 다룬다. 딥링크로 들어온 보관함의 메타 태그를 서버에서 만들기
   * 위한 로더이고, 여기서 가져오는 값은 누구에게나 같다.
   *
   * ⚠️ 사용자별 데이터(즐겨찾기 여부, 알림 개수 등)를 여기에 넣으면 안 된다.
   * 서버는 요청자가 누구인지 모른다 — 액세스 토큰은 쿠키에 저장되지 않고,
   * 서버 가드가 읽는 `auth-storage` 는 클라이언트가 쓰는 위조 가능한 쿠키다.
   * 게다가 홈은 프리렌더 대상이라 개인화 값이 정적 파일에 굳어 모든 방문자에게
   * 서빙된다. 개인화가 필요하면 클라이언트에서 채우고, SSR 로 다뤄야 한다면
   * 서버가 신원을 확인할 수단을 먼저 만들어야 한다.
   */
  // biome-ignore lint/suspicious/noExplicitAny: TanStack 의 LoaderFnContext 에는
  // search 가 없다. 이 로더는 타입에 없는 필드를 읽고 있는데, 제대로 고치려면
  // loaderDeps 로 옮겨야 해서 별도로 다룬다.
  loader: async ({ search }: any) => {
    const lockerParam = search?.locker;
    const lockerId = parseLockerSearchParam(lockerParam);
    if (lockerId !== undefined) {
      try {
        const rawDetail = await getLockerDetail({
          lockerId,
          lat: DEFAULT_SEARCH_COORDINATES.lat,
          lng: DEFAULT_SEARCH_COORDINATES.lng,
        });
        const detail = toLockerDetailItem(rawDetail);
        return { detail };
      } catch (error) {
        console.error(
          `Failed to load locker ${lockerId} in root loader:`,
          error,
        );
        return { detail: null };
      }
    }
    return { detail: null };
  },
  head: (context) => {
    const { loaderData, match } = context;
    const publicHref = (context as SeoHeadLocationContext).location?.publicHref;
    const pathname = getSeoPathname({
      publicHref,
      pathname: match.pathname,
    });
    const locale = getSeoLocale({
      publicHref,
      pathname: match.pathname,
      runtimeLocale: languageTag(),
    });
    const detail = loaderData?.detail;
    if (detail) {
      const name = detail.title || "물품보관함";
      const address = detail.address || "";
      const minPrice = detail.minPrice;

      const priceText =
        minPrice != null
          ? m.seo_locker_detail_price_text(
              { price: minPrice.toLocaleString() },
              { locale },
            )
          : m.seo_locker_detail_price_unknown({}, { locale });
      const title = m.seo_locker_detail_title({ name }, { locale });
      const description = m.seo_locker_detail_description(
        {
          name,
          address,
          priceText,
        },
        { locale },
      );
      const canonicalUrl = createLockerCanonicalUrl({
        lockerId: detail.lockerId,
        title: detail.title ?? undefined,
        locale,
      });

      return {
        meta: [
          {
            title,
          },
          {
            name: "description",
            content: description,
          },
          {
            property: "og:title",
            content: title,
          },
          {
            property: "og:description",
            content: description,
          },
          {
            property: "og:url",
            content: canonicalUrl,
          },
          {
            name: "twitter:title",
            content: title,
          },
          {
            name: "twitter:description",
            content: description,
          },
        ],
        links: [
          {
            rel: "canonical",
            href: canonicalUrl,
          },
        ],
      };
    }

    const title = m.seo_global_title({}, { locale });
    const description = m.seo_global_description({}, { locale });
    const canonicalUrl = createLocalizedUrl({ pathname, locale });

    return {
      meta: [
        {
          title,
        },
        {
          name: "description",
          content: description,
        },
        {
          property: "og:title",
          content: title,
        },
        {
          property: "og:description",
          content: description,
        },
        {
          property: "og:url",
          content: canonicalUrl,
        },
        {
          name: "twitter:title",
          content: title,
        },
        {
          name: "twitter:description",
          content: description,
        },
      ],
      links: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
        ...createAlternateLinksForPathname(pathname),
      ],
    };
  },
  component: IndexPage,
});

interface RefreshButtonProps {
  isRefreshing: boolean;
  isMapReady: boolean;
  /** 다른 컨트롤이 동작 중이면 같이 잠근다 */
  isOtherControlBusy: boolean;
  isRefreshSpinning: boolean;
  refreshCooldownRemaining: number;
  onRefresh: () => void;
}

const RefreshButton = memo(function RefreshButton({
  isRefreshing,
  isMapReady,
  isOtherControlBusy,
  isRefreshSpinning,
  refreshCooldownRemaining,
  onRefresh,
}: RefreshButtonProps) {
  const isDisabled = isRefreshing || !isMapReady || isOtherControlBusy;
  return (
    <button
      type="button"
      className={[locationButton, isDisabled ? refreshButtonDisabled : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={onRefresh}
      aria-label={m.home_map_refresh_aria()}
      disabled={isDisabled}
    >
      <IconNavigationRefresh24
        state={isDisabled ? "refresh" : "refreshActive"}
        className={isRefreshSpinning ? refreshIconSpinning : ""}
      />
      {isRefreshing && !isRefreshSpinning && refreshCooldownRemaining > 0 && (
        <div className={refreshCooldownBadge}>{refreshCooldownRemaining}</div>
      )}
    </button>
  );
});

interface MyLocationButtonProps {
  permission: PermissionState;
  /** 다른 컨트롤이 동작 중이면 같이 잠근다 */
  isOtherControlBusy: boolean;
  isCameraCentered: boolean;
  isLocating: boolean;
  isOrientationTracking: boolean;
  onMyLocation: () => void;
}

const MyLocationButton = memo(function MyLocationButton({
  permission,
  isOtherControlBusy,
  isCameraCentered,
  isLocating,
  isOrientationTracking,
  onMyLocation,
}: MyLocationButtonProps) {
  return (
    <button
      type="button"
      className={locationButton}
      onClick={onMyLocation}
      disabled={isLocating || isOtherControlBusy}
      aria-busy={isLocating}
      aria-label={
        isLocating ? m.location_loading_aria() : m.home_my_location_aria()
      }
    >
      <IconNavigationCrosshair24
        className={myLocationIcon}
        state={
          permission === "denied"
            ? "denied"
            : isCameraCentered || isOrientationTracking
              ? "active"
              : "default"
        }
      />
      {isLocating ? (
        <span className={locationLoadingBadge} aria-hidden="true" />
      ) : null}
    </button>
  );
});

export function IndexPage() {
  const navigate = useNavigate();
  const search = (useSearch({ strict: false }) || {}) as HomeSearchParams;
  const loaderData = Route.useLoaderData();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: user } = useUser(isAuthenticated);

  const lockerIdFromQuery = parseLockerSearchParam(search.locker);
  const openLockerId = lockerIdFromQuery ?? search.openLockerId;
  const hasExplicitLockerEntry = openLockerId != null;
  const restoredSession = useMemo(
    () => (hasExplicitLockerEntry ? null : readRestoredSessionForTabReturn()),
    [hasExplicitLockerEntry],
  );
  const { detailSnap, focusLat, focusLng } = search;
  const searchQueryFromUrl =
    typeof search.q === "string" ? search.q : undefined;
  const searchPlaceIdFromUrl = readSearchPlaceIdParam(search.searchPlaceId);
  const hasSearchPlaceEntry =
    searchPlaceIdFromUrl !== undefined && !hasExplicitLockerEntry;
  const hasSearchQueryEntry =
    (searchQueryFromUrl !== undefined || hasSearchPlaceEntry) &&
    !hasExplicitLockerEntry;
  const handledOpenLockerIdRef = useRef<number | null>(null);
  const pinSelectedInAppRef = useRef(false);
  const pendingDeepLinkFocusPinRef = useRef<LockerPinItemResponse | null>(null);
  const deepLinkMapCenterRef = useRef<{ lat: number; lng: number } | null>(
    null,
  );
  const [mapRemountKey, setMapRemountKey] = useState(0);
  const [lockerDetailOpensFull, setLockerDetailOpensFull] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [lockerDetailAnimatesOnMount, setLockerDetailAnimatesOnMount] =
    useState(false);
  const [lockerDetailQueryOrigin, setLockerDetailQueryOrigin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const queryClient = useQueryClient();
  const favoriteSession = useFavoriteLockerSession();
  const flushFavoriteChangesRef = useRef(favoriteSession.flush);
  flushFavoriteChangesRef.current = favoriteSession.flush;

  const flushInFlightRef = useRef<Promise<void> | null>(null);

  const flushLockerSheetMutations = useCallback(async () => {
    if (flushInFlightRef.current) {
      return flushInFlightRef.current;
    }

    const flushPromise = Promise.allSettled([
      flushFavoriteChangesRef.current(),
    ]).then(() => undefined);

    flushInFlightRef.current = flushPromise.finally(() => {
      flushInFlightRef.current = null;
    });

    return flushInFlightRef.current;
  }, []);
  const isSearchOpen = useSearchStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useSearchStore((state) => state.setIsSearchOpen);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const effectiveSearchQuery =
    searchQueryFromUrl ?? (hasSearchPlaceEntry ? "" : searchQuery);
  const syncSearchQueryUrl = useCallback(
    (
      query: string | null | undefined,
      options: { replace?: boolean; searchPlaceId?: number | null } = {},
    ) => {
      const nextQuery = readSearchQueryParam(query);
      const currentQuery = searchQueryFromUrl;
      const nextSearchPlaceId = options.searchPlaceId ?? null;
      const currentSearchPlaceId = searchPlaceIdFromUrl ?? null;

      if (
        nextQuery === currentQuery &&
        nextSearchPlaceId === currentSearchPlaceId
      ) {
        return;
      }

      void navigate({
        to: ".",
        search: (prev: SearchUrlParams) =>
          withSearchPlaceIdParam(
            withSearchQueryParam(prev, nextQuery),
            nextSearchPlaceId,
          ),
        replace: options.replace,
      });
    },
    [navigate, searchPlaceIdFromUrl, searchQueryFromUrl],
  );
  const syncSearchFilterSession = useCallback(
    (filters: SearchFilterAppliedState) => {
      saveSearchFiltersToSession(filters);
    },
    [],
  );
  const setConfirmedSearchQuery = useCallback(
    (
      query: string,
      options: { replace?: boolean; searchPlaceId?: number | null } = {},
    ) => {
      setSearchQuery(query);
      syncSearchQueryUrl(query, options);
    },
    [setSearchQuery, syncSearchQueryUrl],
  );
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const isCameraCenteredRef = useRef(false);
  const didApplyInitialGpsCenterRef = useRef(false);
  const hasUserMovedMapBeforeInitialGpsRef = useRef(false);
  const lastFocusedLockerIdRef = useRef<number | null>(null);
  const shouldIgnoreNextMapPressRef = useRef(false);
  const mapPressSuppressionTimerRef = useRef<number | undefined>(undefined);

  // 방향 트래킹 pending 처리용 refs
  // GPS 첫 위치 수신 후 자동으로 방향 트래킹을 시작해야 할 때 사용
  const pendingOrientationStartRef = useRef(false);
  const hasPendingOneTimeLocationCenterRef = useRef(false);
  const hasPendingMyLocationRequestRef = useRef(false);
  const requestOrientationPermissionRef = useRef<() => Promise<boolean>>(
    async () => false,
  );
  const startOrientationTrackingRef = useRef<() => void>(() => {});
  // handleFirstLocation(deps [])에서 최신값을 읽기 위한 ref
  const isOrientationSupportedRef = useRef<boolean | null>(null);
  const isPendingFocusRef = useRef<boolean>(false);
  const [mapInstance, setMapInstance] = useState<naver.maps.Map | null>(null);
  // 지도 SDK 로딩 상태(NaverMapCanvas에서 끌어올림).
  // 로딩 중에는 실제 컨트롤 대신 같은 위치/계층의 스켈레톤을 보여준다.
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [hasMapError, setHasMapError] = useState(false);
  /**
   * 첫 렌더는 서버와 같은 값으로 시작한다.
   *
   * 예전에는 클라이언트에서 곧바로 window.innerHeight 로 초기화했는데, 이 값이
   * 렌더 결과에 들어가는 순간(스켈레톤 위치처럼) 서버 HTML 과 어긋나 하이드레이션
   * 불일치가 된다. 실제 높이는 마운트 직후 리사이즈 핸들러가 한 번 채운다.
   */
  const [windowHeight, setWindowHeight] = useState(SSR_WINDOW_HEIGHT_PX);
  /**
   * 실제 뷰포트 높이를 재기 전인지.
   *
   * 재기 전의 windowHeight 는 가정값이라 그 값으로 컨트롤을 시트만큼 밀어 올리면
   * 위치가 틀린다. 낮은 화면에서는 시트 뒤나 화면 밖에 놓이기까지 한다. 측정
   * 전에는 밀어 올리지 않고 기본 위치에 둔다. 서버와 첫 클라이언트 렌더가 같은
   * 값을 내므로 하이드레이션도 어긋나지 않는다.
   */
  const [hasMeasuredViewport, setHasMeasuredViewport] = useState(false);
  /**
   * 시트 윗변의 라이브 위치. 프레임마다 바뀌므로 state 가 아니라 motion value 다.
   *
   * state 로 두면 지도까지 들고 있는 이 컴포넌트가 드래그 내내 초당 60번 리렌더된다.
   * 시트가 없을 때는 SHEET_OFFSET_NONE_PX 를 넣어 "차지하는 높이 0" 으로 만든다.
   */
  const sheetLiveOffset = useMotionValue(SHEET_OFFSET_NONE_PX);
  /**
   * 시트가 마운트 슬라이드로 올라오는 동안의 진행도. 0 이면 아직 화면 밖이다.
   *
   * 라이브 오프셋만 보면 시트가 열리는 첫 프레임부터 최종 스냅 값이 들어와,
   * 컨트롤이 최종 높이로 먼저 뛰어오른 뒤 시트가 뒤따라 올라온다. 그동안
   * 버튼이 허공에 떠 보인다. 시트가 실제로 차지한 높이에 이 비율을 곱한다.
   */
  const sheetMountProgress = useMotionValue(1);
  /**
   * 시트가 목표 스냅에 닿았는지. 프레임마다 바뀌는 값이 아니라 제스처당 두 번만
   * 뒤집히므로 state 로 둔다.
   */
  const [isSheetSettled, setIsSheetSettled] = useState(true);
  /**
   * 지금 화면에 떠 있는 시트 인스턴스의 식별자.
   *
   * 시트 콜백은 렌더 밖에서 도착하므로 클로저에 갇힌 값 대신 이 ref 를 본다.
   * 값은 아래에서 시트가 정해진 직후 렌더 중에 갱신한다.
   */
  const visibleSheetTokenRef = useRef<string | null>(null);
  /**
   * 밀어 올린 컨트롤의 위치. 시트가 자기 높이를 잡는 방식과 같은 100dvh 기준이라
   * 모바일에서 URL 바가 접혀도 시트 윗변에 붙는다. 상·하한은 CSS 가 매 프레임
   * 계산하므로 React 렌더가 필요 없다.
   */
  const mapControlRaisedBottom = useMotionTemplate`clamp(${MAP_CONTROL_FALLBACK_BOTTOM_PX}px, calc((100dvh - ${sheetLiveOffset}px) * ${sheetMountProgress} + ${MAP_CONTROL_SHEET_GAP_PX}px), calc(100dvh - ${MAP_CONTROL_TOP_RESERVED_PX}px))`;
  /**
   * 시트가 보고한 프레임을 컨트롤 위치에 반영한다.
   *
   * 어느 시트 인스턴스가 보낸 프레임인지 함께 받는다. 목록과 상세는 같은 처리를
   * 쓰는데, 시트가 바뀌는 동안에는 나가는 시트의 마지막 프레임이 새 시트가 자리를
   * 잡은 뒤에 도착할 수 있다. 그 값이 반영되면 컨트롤이 엉뚱한 높이로 튄다.
   *
   * 종류만 대조해서는 부족하다. 다른 보관함을 열거나 목록이 바뀌면 시트는 새로
   * 마운트되지만 종류는 그대로다. 화면에 시트가 없을 때(null) 도착한 프레임도
   * 같은 이유로 버린다.
   */
  const applySheetLiveOffset = useCallback(
    (
      token: string,
      { offsetPx, mountProgress, isSettled }: LockerDetailSheetLiveOffsetState,
    ) => {
      if (visibleSheetTokenRef.current !== token) {
        return;
      }

      sheetLiveOffset.set(offsetPx);
      sheetMountProgress.set(mountProgress);
      setIsSheetSettled(isSettled);
    },
    [sheetLiveOffset, sheetMountProgress],
  );

  const pendingLockerDetailOpenTimerRef = useRef<number | undefined>(undefined);
  /** 지도 타이머 컨트롤로 연 보관함. 시트가 타이머 모달까지 열면 비운다. */
  const [timerAutoOpenLockerId, setTimerAutoOpenLockerId] = useState<
    number | null
  >(null);
  const hasRequestedHomeLocation = useHasRequestedHomeLocationInSession();
  const didRequestHomeLocationRef = useRef(false);
  const didLogHomeLocationSessionSkipRef = useRef(false);

  // 리프레시 버튼 타이머 클린업 레퍼런스
  const refreshTimersRef = useRef<{
    spinning?: number;
    interval?: number;
  }>({});

  const [searchFilters, setSearchFilters] = useState<SearchFilterAppliedState>(
    loadSearchFiltersFromSession,
  );
  const [sheetMode, setSheetMode] = useState<SheetModeForContext>(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail) return "detail";
    if (hasSearchQueryEntry) return "list";
    return "idle";
  });
  const [activeLockerId, setActiveLockerId] = useState<number | null>(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail)
      return lockerIdFromQuery;
    return null;
  });
  const [listSheetSnapStage, setListSheetSnapStage] =
    useState<SearchListSheetSnapStage>("half");
  /**
   * 목록 시트가 지금 단계에서 실제로 차지하는 높이. 시트가 올려 준다.
   *
   * full 은 최소 상단 여백까지 올라가므로 단계 상수로는 알 수 없다. 상세 시트와
   * 같은 규칙을 따라야 컨트롤 배치가 두 시트에서 갈리지 않는다.
   */
  const [listSheetVisibleHeight, setListSheetVisibleHeight] = useState<
    number | null
  >(() => resolveSearchListStageVisibleHeight("half", SSR_WINDOW_HEIGHT_PX));
  const {
    snapRequest: listSheetSnapRequest,
    requestSnap: requestListSheetSnap,
    clearSnapRequest: clearListSheetSnapRequest,
  } = useSheetSnapRequest<SearchListSheetSnapStage>();
  const [detailSheetSnapStage, setDetailSheetSnapStage] =
    useState<LockerDetailSheetSnapStage>("half");
  /**
   * 상세 시트가 지금 단계에서 실제로 차지하는 높이. 시트가 올려 준다.
   *
   * full 은 콘텐츠 높이에 따라 자리가 달라져 단계 상수로는 알 수 없다. 실시간
   * 카드가 있는 보관함은 시트가 더 높이 올라가고, 없는 보관함은 위에 지도가
   * 남는다. 그 차이를 컨트롤 배치에 반영하려면 실측값이 필요하다.
   */
  const [detailSheetVisibleHeight, setDetailSheetVisibleHeight] = useState<
    number | null
  >(() => resolveDetailSheetVisibleHeight("half"));
  const {
    snapRequest: detailSheetSnapRequest,
    requestSnap: requestDetailSheetSnap,
    clearSnapRequest: clearDetailSheetSnapRequest,
  } = useSheetSnapRequest<LockerDetailSheetSnapStage>();
  const [selectedLockerDetail, setSelectedLockerDetail] =
    useState<LockerDetailItem | null>(() => {
      if (lockerIdFromQuery !== undefined) {
        return loaderData?.detail ?? null;
      }
      return null;
    });
  const [selectedMapPin, setSelectedMapPin] =
    useState<LockerPinItemResponse | null>(() => {
      if (lockerIdFromQuery !== undefined) {
        if (loaderData?.detail) {
          return {
            pinType: "LOCKER",
            lockerId: lockerIdFromQuery,
            placeId: null,
            latitude:
              loaderData.detail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
            longitude:
              loaderData.detail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
            isFavorite: null,
            lockerCount: null,
            pinCount: null,
            bounds: null,
          };
        }
        return null;
      }
      return null;
    });
  const [selectedMapPinOffset, setSelectedMapPinOffset] =
    useState<LockerMarkerOffset | null>(null);
  const [context, setContext] = useState<AppMapContext>(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail) return "map";
    if (hasSearchQueryEntry) return "search";
    return "idle";
  });
  const [overlayReturnContext, setOverlayReturnContext] =
    useState<OverlayReturnContext>("idle");
  const [listKind, setListKind] = useState<SearchListKind | null>(() =>
    hasSearchPlaceEntry
      ? "place"
      : hasSearchQueryEntry
        ? "keyword"
        : (restoredSession?.listKind ?? null),
  );
  const [searchPlaceId, setSearchPlaceId] = useState<number | null>(() =>
    hasSearchPlaceEntry
      ? (searchPlaceIdFromUrl ?? null)
      : (restoredSession?.searchPlaceId ?? null),
  );
  const [mapPlaceId, setMapPlaceId] = useState<number | null>(
    () => restoredSession?.mapPlaceId ?? null,
  );
  const [searchDetailBack, setSearchDetailBack] =
    useState<SearchDetailBackTarget | null>(
      () => restoredSession?.searchDetailBack ?? null,
    );
  const [mapDetailBack, setMapDetailBack] = useState<MapDetailBack | null>(
    () =>
      lockerIdFromQuery !== undefined && loaderData?.detail
        ? "idle"
        : (restoredSession?.mapDetailBack ?? null),
  );
  const [searchDraft, setSearchDraft] = useState(
    () => searchQueryFromUrl ?? "",
  );
  const {
    entries: searchHistoryEntries,
    record: recordSearchHistory,
    remove: removeSearchHistory,
    clear: clearSearchHistory,
  } = useSearchHistory();
  const [isNavigationPopupOpen, setIsNavigationPopupOpen] = useState(false);

  // 위치 및 방향 트래킹 — 위치 관련 훅과 콜백은 side effect보다 먼저 선언한다.
  const [isCameraCentered, setIsCameraCentered] = useState(false);
  const [isLocationErrorPopupOpen, setIsLocationErrorPopupOpen] =
    useState(false);
  // isLocating 은 GPS 수신 중에만 true 라, 방향 권한 프롬프트를 기다리는 동안은
  // false 다. 그 틈에 새로고침이 눌리지 않도록 버튼을 누른 즉시 잠근다.
  const [isMyLocationPending, setIsMyLocationPending] = useState(false);
  const [isLocationRequestInterrupted, setIsLocationRequestInterrupted] =
    useState(false);
  const [
    isLocationRecoveryNoticeDismissed,
    setIsLocationRecoveryNoticeDismissed,
  ] = useState(false);

  // onFirstLocation을 useCallback으로 메모이즈
  // → 매 렌더마다 새 함수 레퍼런스가 생성되면 useLocationTracking 내부
  //   useEffect([isTracking, onFirstLocation])이 불필요하게 재실행되어 watchPosition이
  //   재등록되는 무한 루프가 발생함
  // setIsCameraCentered는 useState dispatch로 stable하므로 deps [] 안전
  // requestOrientationPermissionRef / startOrientationTrackingRef는
  // render마다 갱신되는 ref이므로 deps []가 안전하다.
  const handleFirstLocation = useCallback((firstLocation: LocationData) => {
    // 버튼 클릭 시 GPS가 꺼진 상태였다면 첫 위치 수신 후 방향 트래킹을 시작한다.
    // requestOrientationPermissionRef / startOrientationTrackingRef는 안정적인 ref로
    // 항상 최신 함수를 참조하므로 deps []가 안전하다.
    if (pendingOrientationStartRef.current) {
      pendingOrientationStartRef.current = false;
      setIsCameraCentered(true);
      // 권한은 handleMyLocation(사용자 제스처 컨텍스트)에서 이미 획득됨
      startOrientationTrackingRef.current();
      return;
    }

    if (hasPendingOneTimeLocationCenterRef.current && mapInstanceRef.current) {
      hasPendingOneTimeLocationCenterRef.current = false;
      focusNaverMapOnCoordinates({
        map: mapInstanceRef.current,
        coordinates: firstLocation,
      });
    }
  }, []);

  const handleLocationRequestSettled = useCallback(
    (outcome: LocationRequestOutcome) => {
      const settlement = resolveLocationRequestSettlement({
        outcome,
        isUserInitiated: hasPendingMyLocationRequestRef.current,
      });

      if (outcome === "success") {
        hasPendingMyLocationRequestRef.current = false;
      }

      if (outcome === "interrupted") {
        setIsLocationRequestInterrupted(true);
        setIsLocationRecoveryNoticeDismissed(false);
      }

      if (settlement.isPendingIntentClearRequired) {
        hasPendingMyLocationRequestRef.current = false;
        pendingOrientationStartRef.current = false;
        hasPendingOneTimeLocationCenterRef.current = false;
      }

      if (settlement.isCameraCenterResetRequired) {
        setIsCameraCentered(false);
      }

      if (settlement.isErrorPopupRequired) {
        setIsLocationErrorPopupOpen(true);
      }

      if (outcome === "permission-denied" || outcome === "unsupported") {
        markHomeLocationRequestedInSession();
        return;
      }

      if (outcome === "cancelled") return;

      clearHomeLocationRequestedInSession();
    },
    [],
  );

  // isCameraCentered는 handleFirstLocation 위에서 선언됨
  isCameraCenteredRef.current = isCameraCentered;

  const {
    permission,
    isTracking,
    isLocating,
    location,
    error,
    locationRequestStatus,
    startTracking,
  } = useLocationTracking({
    onFirstLocation: handleFirstLocation,
    onRequestSettled: handleLocationRequestSettled,
  });

  const shouldPreferHomeLocation =
    lockerIdFromQuery === undefined && focusLat == null && focusLng == null;
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const rawSearchQueryFromUrl = urlParams.get("q") ?? undefined;
    const rawSearchPlaceIdFromUrl = urlParams.get("searchPlaceId") ?? undefined;
    const normalizedSearchPlaceIdFromUrl =
      searchPlaceIdFromUrl !== undefined
        ? String(searchPlaceIdFromUrl)
        : undefined;
    const hasLegacyFilterParams =
      urlParams.has("filterSizes") ||
      urlParams.has("filterIndoorOutdoor") ||
      urlParams.has("filterPlaceTypes");

    if (
      (rawSearchQueryFromUrl !== undefined &&
        rawSearchQueryFromUrl !== searchQueryFromUrl) ||
      (rawSearchPlaceIdFromUrl !== undefined &&
        rawSearchPlaceIdFromUrl !== normalizedSearchPlaceIdFromUrl) ||
      hasLegacyFilterParams
    ) {
      void navigate({
        to: ".",
        search: (prev: SearchUrlParams) => {
          const next = withSearchPlaceIdParam(
            withSearchQueryParam(prev, searchQueryFromUrl),
            searchPlaceIdFromUrl,
          );
          delete next.filterSizes;
          delete next.filterIndoorOutdoor;
          delete next.filterPlaceTypes;
          return next;
        },
        replace: true,
      });
    }
  }, [navigate, searchPlaceIdFromUrl, searchQueryFromUrl]);

  useEffect(() => {
    const nextSearchQuery = searchQueryFromUrl ?? "";

    if (useSearchStore.getState().searchQuery !== nextSearchQuery) {
      setSearchQuery(nextSearchQuery);
    }

    setSearchDraft((previousDraft) =>
      previousDraft === nextSearchQuery ? previousDraft : nextSearchQuery,
    );
  }, [searchQueryFromUrl, setSearchQuery]);

  useEffect(() => {
    if (hasExplicitLockerEntry) return;

    if (searchPlaceIdFromUrl !== undefined) {
      setListKind((previousListKind) =>
        previousListKind === "place" ? previousListKind : "place",
      );
      setSearchPlaceId((previousPlaceId) =>
        previousPlaceId === searchPlaceIdFromUrl
          ? previousPlaceId
          : searchPlaceIdFromUrl,
      );
      return;
    }

    if (searchQueryFromUrl !== undefined) {
      setListKind((previousListKind) =>
        previousListKind === "keyword" ? previousListKind : "keyword",
      );
      setSearchPlaceId((previousPlaceId) =>
        previousPlaceId === null ? previousPlaceId : null,
      );
      return;
    }

    setListKind((previousListKind) =>
      previousListKind === null ? previousListKind : null,
    );
    setSearchPlaceId((previousPlaceId) =>
      previousPlaceId === null ? previousPlaceId : null,
    );
  }, [hasExplicitLockerEntry, searchPlaceIdFromUrl, searchQueryFromUrl]);

  useEffect(() => {
    if (
      !shouldRestoreSearchListFromUrl({
        hasExplicitLockerEntry,
        searchQueryFromUrl,
        searchPlaceIdFromUrl,
      })
    ) {
      return;
    }

    window.clearTimeout(pendingLockerDetailOpenTimerRef.current);
    pendingLockerDetailOpenTimerRef.current = undefined;
    setContext("search");
    setSheetMode("list");
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setSelectedMapPinOffset(null);
    setSearchDetailBack(null);
    setMapDetailBack(null);
    setIsNavigationPopupOpen(false);
    setIsSearchOpen(false);
  }, [
    hasExplicitLockerEntry,
    searchPlaceIdFromUrl,
    searchQueryFromUrl,
    setIsSearchOpen,
  ]);

  useEffect(() => {
    if (activeLockerId === null) {
      lastFocusedLockerIdRef.current = null;
      isPendingFocusRef.current = false;
    }
  }, [activeLockerId]);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    // 하이드레이션이 끝난 뒤 실제 뷰포트 높이로 교정한다.
    handleResize();
    setHasMeasuredViewport(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const hasRequestedHomeLocationInCurrentSession =
      hasRequestedHomeLocationInSession();
    const canStartAutoLocationRequest =
      shouldPreferHomeLocation &&
      location == null &&
      permission !== "denied" &&
      !isTracking &&
      !isLocating &&
      error == null &&
      !hasRequestedHomeLocation &&
      !didRequestHomeLocationRef.current &&
      !hasRequestedHomeLocationInCurrentSession &&
      !isLocationRequestInterrupted;
    const shouldLogHomeLocationSessionSkip =
      shouldPreferHomeLocation &&
      location == null &&
      permission === "prompt" &&
      (hasRequestedHomeLocation || hasRequestedHomeLocationInCurrentSession) &&
      !isLocating &&
      !isTracking &&
      !didLogHomeLocationSessionSkipRef.current;

    if (!canStartAutoLocationRequest) {
      if (shouldLogHomeLocationSessionSkip) {
        didLogHomeLocationSessionSkipRef.current = true;
        postLocationDiagnostic("home_auto_request_skipped_session", {
          hasSessionRequestMarker: true,
          isLocating,
          isTracking,
          permission,
        });
      }
      return;
    }

    didRequestHomeLocationRef.current = true;
    postLocationDiagnostic("home_auto_request_started", {
      hasSessionRequestMarker: false,
      isLocating: true,
      isTracking: true,
      permission,
    });
    markHomeLocationRequestedInSession();
    startTracking();
  }, [
    error,
    hasRequestedHomeLocation,
    isLocating,
    isTracking,
    isLocationRequestInterrupted,
    location,
    permission,
    shouldPreferHomeLocation,
    startTracking,
  ]);

  // mapRemountKey 는 본문에서 읽지 않는다. 지도를 다시 마운트할 때 초기
  // 카메라를 새로 계산하려고 넣은 트리거다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mapRemountKey 는 재계산 트리거다
  const mapBootstrap = useMemo(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail) {
      return {
        center: {
          lat: loaderData.detail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
          lng: loaderData.detail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
        },
        zoom: DETAIL_FOCUS_ZOOM,
      };
    }

    const deepLinkCenter =
      focusLat != null && focusLng != null
        ? { lat: focusLat, lng: focusLng }
        : deepLinkMapCenterRef.current;

    return resolveMapBootstrapViewport({
      deepLinkCenter,
      cache: shouldPreferHomeLocation
        ? null
        : useMapViewportStore.getState().cache,
      permission,
      gps: permission === "granted" && location ? location : null,
    });
  }, [
    focusLat,
    focusLng,
    mapRemountKey,
    permission,
    location,
    lockerIdFromQuery,
    loaderData,
    shouldPreferHomeLocation,
  ]);

  useEffect(() => {
    if (
      didApplyInitialGpsCenterRef.current ||
      hasUserMovedMapBeforeInitialGpsRef.current ||
      permission !== "granted" ||
      !location ||
      !mapInstance ||
      lockerIdFromQuery !== undefined ||
      focusLat != null ||
      focusLng != null ||
      context !== "idle" ||
      sheetMode !== "idle"
    ) {
      return;
    }

    if (
      Math.abs(mapBootstrap.center.lat - location.lat) > 0.000001 ||
      Math.abs(mapBootstrap.center.lng - location.lng) > 0.000001
    ) {
      return;
    }

    didApplyInitialGpsCenterRef.current = true;
    focusNaverMapOnCoordinates({
      map: mapInstance,
      coordinates: location,
      zoom: mapBootstrap.zoom,
    });
  }, [
    context,
    focusLat,
    focusLng,
    lockerIdFromQuery,
    location,
    mapBootstrap,
    mapInstance,
    permission,
    sheetMode,
  ]);

  const {
    heading: deviceHeading,
    isTracking: isOrientationTracking,
    isSupported: isOrientationSupported,
    requestPermission: requestOrientationPermission,
    startTracking: startOrientationTracking,
    stopTracking: stopOrientationTracking,
  } = useDeviceOrientation();

  // 방향 트래킹 함수/값을 ref로 최신 참조 유지 (handleFirstLocation deps [] 유지 목적)
  requestOrientationPermissionRef.current = requestOrientationPermission;
  startOrientationTrackingRef.current = startOrientationTracking;
  isOrientationSupportedRef.current = isOrientationSupported;
  const {
    isOpen: isLocationPopupOpen,
    openPopup: openLocationPopup,
    closePopup: closeLocationPopup,
  } = useLocationPermissionPopup();

  const [isOrientationDeniedPopupOpen, setIsOrientationDeniedPopupOpen] =
    useState(false);

  // 방향 센서 미지원 확정 시 진행 중인 방향 트래킹 정리
  // isCameraCentered는 건드리지 않아 카메라 추적(2단계)은 유지된다.
  useEffect(() => {
    if (isOrientationSupported !== false) return;
    if (!isOrientationTracking) return;
    stopOrientationTracking();
  }, [isOrientationSupported, isOrientationTracking, stopOrientationTracking]);

  // 위치 권한 거부 시 카메라 추적을 해제하고 설정 안내를 연다.
  useEffect(() => {
    if (permission === "denied") {
      setIsCameraCentered(false);

      if (
        locationRequestStatus === "permission-denied" ||
        locationRequestStatus === "unsupported"
      ) {
        openLocationPopup();
      }
    }
  }, [locationRequestStatus, permission, openLocationPopup]);

  // 리프레시 버튼 관련 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCooldownRemaining, setRefreshCooldownRemaining] = useState(0);
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);
  const handleRefreshMap = useCallback(() => {
    if (!mapInstanceRef.current || isRefreshing) return;

    useMapViewportStore.getState().saveFromMap(mapInstanceRef.current);

    setIsRefreshing(true);
    setRefreshCooldownRemaining(5);
    setIsRefreshSpinning(true);

    refreshTimersRef.current.spinning = window.setTimeout(
      () => setIsRefreshSpinning(false),
      500,
    );

    setMapRemountKey((key) => key + 1);
    void queryClient.invalidateQueries({
      queryKey: [LOCKER_PINS_QUERY_KEY],
      refetchType: "active",
    });

    refreshTimersRef.current.interval = window.setInterval(() => {
      setRefreshCooldownRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(refreshTimersRef.current.interval);
          setIsRefreshing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRefreshing, queryClient]);

  const persistMapViewport = useCallback((map: naver.maps.Map) => {
    useMapViewportStore.getState().saveFromMap(map);
  }, []);

  const saveMapViewport = useCallback(() => {
    const map = mapInstanceRef.current;
    if (map) {
      persistMapViewport(map);
    }
  }, [persistMapViewport]);

  const clearPendingLockerDetailOpen = useCallback(() => {
    window.clearTimeout(pendingLockerDetailOpenTimerRef.current);
    pendingLockerDetailOpenTimerRef.current = undefined;
  }, []);

  // 언마운트 시 리프레시 타이머 클린업
  useEffect(() => {
    return () => {
      window.clearTimeout(refreshTimersRef.current.spinning);
      window.clearInterval(refreshTimersRef.current.interval);
      window.clearTimeout(pendingLockerDetailOpenTimerRef.current);
    };
  }, []);

  // 탭 전환·백그라운드 이탈 직전 viewport 저장
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveMapViewport();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", saveMapViewport);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", saveMapViewport);
    };
  }, [saveMapViewport]);

  useEffect(() => {
    if (!mapInstance) return;

    const maps = window.naver?.maps;
    if (!maps) return;

    return subscribeMapIdle({
      map: mapInstance,
      maps,
      onSettle: saveMapViewport,
    });
  }, [mapInstance, saveMapViewport]);

  const handleMyLocation = useCallback(async () => {
    setIsMyLocationPending(true);
    try {
      setIsLocationErrorPopupOpen(false);

      if (isLocationRequestInterrupted) {
        reloadForLocationRecovery();
        return;
      }

      hasPendingMyLocationRequestRef.current = false;
      pendingOrientationStartRef.current = false;
      hasPendingOneTimeLocationCenterRef.current = false;

      if (permission === "denied") {
        hasPendingMyLocationRequestRef.current = true;
        hasPendingOneTimeLocationCenterRef.current = true;
        startTracking();
        return;
      }

      // 홈 화면 idle 컨텍스트 여부 판단
      // 검색 중이거나 핀/시트가 활성화된 상황에서는 단순 위치 이동만 수행한다.
      const isHomeContext =
        context === "idle" && sheetMode === "idle" && !isSearchOpen;

      if (!isHomeContext) {
        // 비홈 컨텍스트: isCameraCentered 변경 없이 단순 위치 이동만 수행
        if (location && mapInstanceRef.current) {
          focusNaverMapOnCoordinates({
            map: mapInstanceRef.current,
            coordinates: location,
          });
        } else if (!isTracking) {
          // GPS가 꺼진 경우: 켜고 첫 위치 수신 후 이동 (단순 이동, 상태 변경 없음)
          hasPendingMyLocationRequestRef.current = true;
          hasPendingOneTimeLocationCenterRef.current = true;
          startTracking();
        }
        return;
      }

      // ── 홈 idle 컨텍스트 전용 로직 ──────────────────────────────

      // 방향 센서가 확정적으로 없는 환경(데스크톱 등): 단순 panTo만 제공
      // isCameraCentered를 세팅하지 않아 카메라 추적 상태로 진입하지 않는다.
      if (isOrientationSupported === false) {
        if (location && mapInstanceRef.current) {
          focusNaverMapOnCoordinates({
            map: mapInstanceRef.current,
            coordinates: location,
          });
        } else if (!isTracking) {
          hasPendingMyLocationRequestRef.current = true;
          hasPendingOneTimeLocationCenterRef.current = true;
          startTracking();
        }
        return;
      }

      // 상태 2(방향 트래킹 활성) → 상태 0으로 복귀
      if (isOrientationTracking) {
        setIsCameraCentered(false);
        stopOrientationTracking();
        return;
      }

      // isOrientationSupported === false 케이스는 위 guard에서 early return 처리됨
      // 이 시점에서 isOrientationSupported는 true(지원) 또는 null(미확정, 시도)이므로
      // 방향 트래킹을 항상 시도한다.

      if (!isTracking) {
        // GPS가 꺼진 경우: 켜고 첫 위치 수신 후 방향 트래킹 시작
        // iOS 13+는 DeviceOrientationEvent.requestPermission이 사용자 제스처 컨텍스트에서만
        // 동작하므로 GPS 콜백(handleFirstLocation) 시점이 아닌 지금 요청해야 한다.
        const granted = await requestOrientationPermission();
        if (!granted) {
          setIsOrientationDeniedPopupOpen(true);
          return;
        }
        hasPendingMyLocationRequestRef.current = true;
        pendingOrientationStartRef.current = true;
        startTracking();
        // 권한은 이미 위에서 획득 — handleFirstLocation에서 startOrientationTracking 직접 호출
      } else {
        if (!location) {
          const granted = await requestOrientationPermission();
          if (!granted) {
            setIsOrientationDeniedPopupOpen(true);
            return;
          }
          hasPendingMyLocationRequestRef.current = true;
          pendingOrientationStartRef.current = true;
          return;
        }

        // GPS 이미 켜진 경우: 즉시 방향 트래킹 시작 (지원 환경)
        // → 중간 단계(카메라 고정만) 없이 바로 방향 트래킹까지 진입
        if (location && mapInstanceRef.current) {
          focusNaverMapOnCoordinates({
            map: mapInstanceRef.current,
            coordinates: location,
          });
        }
        setIsCameraCentered(true);
        const granted = await requestOrientationPermission();
        if (granted) {
          startOrientationTracking();
        } else {
          setIsOrientationDeniedPopupOpen(true);
        }
      }
    } finally {
      setIsMyLocationPending(false);
    }
  }, [
    permission,
    isLocationRequestInterrupted,
    context,
    sheetMode,
    isSearchOpen,
    location,
    isTracking,
    isOrientationTracking,
    isOrientationSupported,
    startTracking,
    requestOrientationPermission,
    startOrientationTracking,
    stopOrientationTracking,
  ]);

  const handleDismissLocationRecoveryNotice = useCallback(() => {
    setIsLocationRecoveryNoticeDismissed(true);
  }, []);

  const handleMapLoad = useCallback(
    (map: naver.maps.Map | null) => {
      mapInstanceRef.current = map;
      setMapInstance(map);

      if (map && lockerIdFromQuery !== undefined && loaderData?.detail) {
        focusNaverMapOnCoordinates({
          map,
          coordinates: {
            lat: loaderData.detail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
            lng: loaderData.detail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
          },
          bottomInsetPx: getDetailFocusBottomInsetPx(),
          zoom: DETAIL_FOCUS_ZOOM,
        });
        return;
      }

      const pin = pendingDeepLinkFocusPinRef.current;
      if (!map || !pin) {
        return;
      }

      focusNaverMapOnCoordinates({
        map,
        coordinates: { lat: pin.latitude, lng: pin.longitude },
        bottomInsetPx: getDetailFocusBottomInsetPx(),
        zoom: DETAIL_FOCUS_ZOOM,
      });
      pendingDeepLinkFocusPinRef.current = null;
    },
    [lockerIdFromQuery, loaderData],
  );

  const resetMapContext = useCallback(() => {
    clearPendingLockerDetailOpen();
    void flushLockerSheetMutations();
    // 보맨 컨텍스트로 복귀 시 컨텍스트 전환에 따른 카메라 고정 해제
    setIsCameraCentered(false);
    setMapPlaceId(null);
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setSelectedMapPinOffset(null);
    pinSelectedInAppRef.current = false;
    setMapDetailBack(null);
    setSearchFilters(createDefaultSearchFilters());
    clearSearchFiltersFromSession();
    setIsNavigationPopupOpen(false);
    setSheetMode("idle");
    setContext("idle");
    writeMapSheetSessionSnapshot(null);
  }, [clearPendingLockerDetailOpen, flushLockerSheetMutations]);

  const resetSearchContext = useCallback(() => {
    clearPendingLockerDetailOpen();
    void flushLockerSheetMutations();
    // 보맨 컨텍스트로 복귀 시 컨텍스트 전환에 따른 카메라 고정 해제
    setIsCameraCentered(false);
    setSearchQuery("");
    void navigate({
      to: ".",
      search: (prev: SearchUrlParams) => {
        const next = withoutSearchContextParams(prev);
        delete next.locker;
        delete next.openLockerId;
        delete next.detailSnap;
        delete next.focusLat;
        delete next.focusLng;
        return next;
      },
    });
    setSearchDraft("");
    setSearchFilters(createDefaultSearchFilters());
    clearSearchFiltersFromSession();
    setListKind(null);
    setSearchPlaceId(null);
    setSearchDetailBack(null);
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setSelectedMapPinOffset(null);
    setIsNavigationPopupOpen(false);
    setSheetMode("idle");
    setContext("idle");
    setIsSearchOpen(false);
    writeMapSheetSessionSnapshot(null);
  }, [
    clearPendingLockerDetailOpen,
    flushLockerSheetMutations,
    navigate,
    setIsSearchOpen,
    setSearchQuery,
  ]);

  const handleOpenSearch = useCallback(() => {
    clearPendingLockerDetailOpen();
    const returnContext = resolveOverlayReturnContext(context);

    if (context === "map") {
      resetMapContext();
    }

    // 검색 오버레이 진입 시 카메라 고정 해제:
    // isSearchOpen이 false로 바뀔 때 카메라 추적 effect가 재발동해
    // 지도가 강제로 현재 위치로 이동하는 버그를 방지한다.
    setIsCameraCentered(false);
    setOverlayReturnContext(returnContext);
    setIsSearchOpen(true);
  }, [clearPendingLockerDetailOpen, context, resetMapContext, setIsSearchOpen]);

  const handleCloseSearch = useCallback(
    (draft?: string) => {
      if (draft !== undefined) {
        setSearchDraft(draft.trim());
      }
      setIsSearchOpen(false);
      // overlayReturnContext === "search" → 시트·query 유지 (state 변경 없음)
      void overlayReturnContext;
    },
    [overlayReturnContext, setIsSearchOpen],
  );

  const handleExitSearchContext = resetSearchContext;

  const searchCoordinates = useMemo(() => {
    const round4 = (n: number) => Math.round(n * 10000) / 10000;

    if (location) {
      return { lat: round4(location.lat), lng: round4(location.lng) };
    }

    if (mapInstance) {
      const center = mapInstance.getCenter();
      return { lat: round4(center.lat()), lng: round4(center.lng()) };
    }

    return DEFAULT_SEARCH_COORDINATES;
  }, [location, mapInstance]);

  const activePlaceId = useMemo(
    () =>
      resolveActivePlaceId({
        context,
        listKind,
        searchPlaceId,
        mapPlaceId,
      }),
    [context, listKind, mapPlaceId, searchPlaceId],
  );

  const shouldFetchKeywordList = shouldFetchKeywordSearch({
    context,
    listKind,
    sheetMode,
    searchDetailBack,
    searchQuery: effectiveSearchQuery,
  });

  const shouldFetchPlaceList = shouldFetchPlaceLockers({
    context,
    listKind,
    sheetMode,
    searchDetailBack,
    mapDetailBack,
    activePlaceId,
  });

  const keywordSearchParams = useMemo(() => {
    if (!shouldFetchKeywordList) {
      return null;
    }

    const keyword = getValidatedSearchQuery(effectiveSearchQuery);
    if (!keyword) {
      return null;
    }

    return {
      keyword,
      lat: searchCoordinates.lat,
      lng: searchCoordinates.lng,
      ...toLockerSearchFilterParams(searchFilters),
    };
  }, [
    searchCoordinates.lat,
    searchCoordinates.lng,
    searchFilters,
    effectiveSearchQuery,
    shouldFetchKeywordList,
  ]);

  const placeLockersParams = useMemo(() => {
    if (!shouldFetchPlaceList || activePlaceId == null) {
      return null;
    }

    return {
      placeId: activePlaceId,
      lat: searchCoordinates.lat,
      lng: searchCoordinates.lng,
      ...toPlaceLockersFilterParams(searchFilters),
    };
  }, [
    activePlaceId,
    searchCoordinates.lat,
    searchCoordinates.lng,
    searchFilters,
    shouldFetchPlaceList,
  ]);

  const {
    data: keywordSearchResults,
    isPending: isKeywordSearchPending,
    isError: isKeywordSearchError,
    refetch: refetchKeywordSearch,
  } = useLockerSearch(keywordSearchParams);

  const {
    data: placeLockersResults,
    isPending: isPlaceLockersPending,
    isError: isPlaceLockersError,
    refetch: refetchPlaceLockers,
  } = usePlaceLockers(placeLockersParams);

  const lockerDetailParams = useMemo(() => {
    if (activeLockerId == null) {
      return null;
    }

    const origin = lockerDetailQueryOrigin ?? searchCoordinates;

    return {
      lockerId: activeLockerId,
      lat: origin.lat,
      lng: origin.lng,
    };
  }, [activeLockerId, lockerDetailQueryOrigin, searchCoordinates]);

  const {
    data: lockerDetail,
    isError: isLockerDetailError,
    isPending: isLockerDetailPending,
    isFetching: isLockerDetailFetching,
    refetch: refetchLockerDetail,
  } = useLockerDetail(lockerDetailParams);

  const lockerDetailLoadState = useMemo((): LockerDetailLoadState => {
    if (sheetMode !== "detail" || activeLockerId == null) {
      return "ready";
    }

    if (isLockerDetailError) {
      return "error";
    }

    if ((isLockerDetailPending || isLockerDetailFetching) && !lockerDetail) {
      return "loading";
    }

    return "ready";
  }, [
    activeLockerId,
    isLockerDetailError,
    isLockerDetailFetching,
    isLockerDetailPending,
    lockerDetail,
    sheetMode,
  ]);

  const lastValidPlaceLockersRef = useRef<{
    placeId: number;
    pins: LockerPinItemResponse[];
    placeName: string | null;
  } | null>(null);

  const lastValidSpreadCenterRef = useRef<{
    placeId: number;
    latitude: number;
    longitude: number;
  } | null>(null);

  if (
    placeLockersResults &&
    activePlaceId != null &&
    placeLockersResults.placeId === activePlaceId
  ) {
    lastValidPlaceLockersRef.current = {
      placeId: activePlaceId,
      pins: searchLockerItemsToPins(placeLockersResults.lockers),
      placeName: placeLockersResults.placeName || null,
    };
    lastValidSpreadCenterRef.current = {
      placeId: activePlaceId,
      latitude: placeLockersResults.latitude,
      longitude: placeLockersResults.longitude,
    };
  }

  useEffect(() => {
    if (activePlaceId == null) {
      lastValidPlaceLockersRef.current = null;
      lastValidSpreadCenterRef.current = null;
    } else {
      if (
        lastValidPlaceLockersRef.current &&
        lastValidPlaceLockersRef.current.placeId !== activePlaceId
      ) {
        lastValidPlaceLockersRef.current = null;
      }
      if (
        lastValidSpreadCenterRef.current &&
        lastValidSpreadCenterRef.current.placeId !== activePlaceId
      ) {
        lastValidSpreadCenterRef.current = null;
      }
    }
  }, [activePlaceId]);

  // 아래 세 memo 는 lastValidPlaceLockersRef 를 읽는다. ref 는 변경이
  // 감지되지 않으므로, 그 ref 를 채우는 placeLockersResults 를 트리거로 넣어야
  // 새 결과가 반영된다. 빼면 이전 장소의 핀이 그대로 남는다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: placeLockersResults 는 ref 갱신 트리거다
  const searchResultPins = useMemo(() => {
    if (context === "search" && listKind === "place") {
      if (activePlaceId == null) return [];
      return lastValidPlaceLockersRef.current?.placeId === activePlaceId
        ? lastValidPlaceLockersRef.current.pins
        : [];
    }

    return searchResultItemsToPins(keywordSearchResults?.items ?? []);
  }, [
    context,
    keywordSearchResults?.items,
    listKind,
    activePlaceId,
    placeLockersResults,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: placeLockersResults 는 ref 갱신 트리거다
  const mapPlacePins = useMemo(() => {
    if (activePlaceId == null) return [];
    return lastValidPlaceLockersRef.current?.placeId === activePlaceId
      ? lastValidPlaceLockersRef.current.pins
      : [];
  }, [activePlaceId, placeLockersResults]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: placeLockersResults 는 ref 갱신 트리거다
  const activePlaceName = useMemo(() => {
    if (context === "map" || listKind === "place") {
      return lastValidPlaceLockersRef.current?.placeId === activePlaceId
        ? lastValidPlaceLockersRef.current.placeName
        : null;
    }
    return null;
  }, [context, listKind, activePlaceId, placeLockersResults]);

  const applySearchSelection = useCallback(
    (selection: SearchSelectionState) => {
      setSearchDraft(selection.searchDraft);
      setConfirmedSearchQuery(selection.searchQuery);
    },
    [setConfirmedSearchQuery],
  );

  const syncLockerDetailUrl = useCallback(
    (
      lockerId: number,
      title?: string,
      options?: {
        replace?: boolean;
      },
    ) => {
      const lockerSlug = createLockerDeepLinkSlug({ lockerId, title });

      void navigate({
        to: ".",
        search: (prev: SearchUrlParams) =>
          String(prev.locker ?? "") === lockerSlug
            ? prev
            : withLockerDetailParam(prev, lockerSlug),
        replace: options?.replace,
      });
    },
    [navigate],
  );

  const clearLockerDetailUrl = useCallback(() => {
    void navigate({
      to: ".",
      search: (prev: SearchUrlParams) => {
        const next = { ...prev };
        delete next.locker;
        delete next.openLockerId;
        delete next.detailSnap;
        delete next.focusLat;
        delete next.focusLng;
        return next;
      },
    });
  }, [navigate]);

  const openLockerDetailById = useCallback(
    async (
      lockerId: number,
      optimisticDetail?: LockerDetailItem,
      options?: {
        detailSnap?: LockerDetailSnap;
        animateOnMount?: boolean;
        searchDetailBack?: SearchDetailBackTarget | null;
        syncUrl?: boolean;
      },
    ) => {
      clearPendingLockerDetailOpen();
      handledOpenLockerIdRef.current = lockerId;
      setLockerDetailQueryOrigin({
        lat: searchCoordinates.lat,
        lng: searchCoordinates.lng,
      });
      await flushLockerSheetMutations();

      // URL에 보관함 상세 주소를 연동합니다 (쿼리 파라미터 슬러그 반영).
      if (options?.syncUrl !== false) {
        syncLockerDetailUrl(lockerId, optimisticDetail?.title);
      }

      // 상태 변경 및 UI 언마운트를 다음 이벤트 루프로 연기하여 클릭 액션 소실 방지
      pendingLockerDetailOpenTimerRef.current = window.setTimeout(() => {
        pendingLockerDetailOpenTimerRef.current = undefined;
        setSelectedLockerDetail(
          optimisticDetail ?? createLockerDetailPlaceholder(lockerId),
        );
        setActiveLockerId(lockerId);
        setIsNavigationPopupOpen(false);
        setIsSearchOpen(false);
        if (options?.searchDetailBack !== undefined) {
          setSearchDetailBack(options.searchDetailBack);
        }
        setLockerDetailOpensFull(options?.detailSnap === "full");
        setLockerDetailAnimatesOnMount(options?.animateOnMount ?? true);
        setSheetMode("detail");

        isPendingFocusRef.current = true;

        if (
          optimisticDetail?.latitude !== undefined &&
          optimisticDetail?.longitude !== undefined
        ) {
          isPendingFocusRef.current = false;

          if (
            lastFocusedLockerIdRef.current !== lockerId &&
            mapInstanceRef.current
          ) {
            lastFocusedLockerIdRef.current = lockerId;
            focusNaverMapOnCoordinates({
              map: mapInstanceRef.current,
              coordinates: {
                lat: optimisticDetail.latitude,
                lng: optimisticDetail.longitude,
              },
              bottomInsetPx: getDetailFocusBottomInsetPx(),
              zoom: DETAIL_FOCUS_ZOOM,
            });
          }
        }
      }, 0);
    },
    [
      flushLockerSheetMutations,
      clearPendingLockerDetailOpen,
      setIsSearchOpen,
      searchCoordinates.lat,
      searchCoordinates.lng,
      syncLockerDetailUrl,
    ],
  );

  /**
   * 지도의 타이머 컨트롤을 눌렀을 때. 해당 보관함 상세를 열고 타이머 모달까지
   * 이어서 띄운다.
   *
   * 요청은 시트가 처리한 뒤 곧바로 지운다. 남겨 두면 나중에 같은 보관함을 마커로
   * 열 때도 모달이 따라 열린다.
   */
  const handleTimerControlSelect = useCallback(
    (lockerId: number) => {
      setTimerAutoOpenLockerId(lockerId);
      void openLockerDetailById(lockerId);
    },
    [openLockerDetailById],
  );

  const handleTimerAutoOpenHandled = useCallback(() => {
    setTimerAutoOpenLockerId(null);
  }, []);

  const openSearchPlaceList = useCallback(
    (
      placeId: number,
      options: {
        applySelection?: boolean;
        draft?: string;
        placeName?: string;
      } = {},
    ) => {
      clearPendingLockerDetailOpen();

      if (options.applySelection && options.placeName) {
        const selection = createPlaceSearchSelection(
          options.draft ?? searchDraft,
          options.placeName,
        );
        setSearchDraft(selection.searchDraft);
        setConfirmedSearchQuery(selection.searchQuery, {
          searchPlaceId: placeId,
        });
      }

      setContext("search");
      setListKind("place");
      setSearchPlaceId(placeId);
      setSearchDetailBack(null);
      setActiveLockerId(null);
      setSelectedLockerDetail(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [
      clearPendingLockerDetailOpen,
      searchDraft,
      setConfirmedSearchQuery,
      setIsSearchOpen,
    ],
  );

  const openMapPlaceList = useCallback(
    (placeId: number) => {
      clearPendingLockerDetailOpen();
      // 맨 컨텍스트로 전환 시 카메라 고정 해제
      setIsCameraCentered(false);
      setContext("map");
      setMapPlaceId(placeId);
      setMapDetailBack(null);
      setActiveLockerId(null);
      setSelectedLockerDetail(null);
      setSelectedMapPin(null);
      setSelectedMapPinOffset(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [clearPendingLockerDetailOpen, setIsSearchOpen],
  );

  const handleSelectSearch = useCallback(
    (query: string) => {
      const attempt = resolveSearchQuerySubmitAttempt(query);

      if (!attempt.ok) {
        return;
      }

      clearPendingLockerDetailOpen();
      recordSearchHistory({ kind: "keyword", query: attempt.query });
      applySearchSelection(createKeywordSearchSelection(attempt.query));
      setContext("search");
      setListKind("keyword");
      setSearchPlaceId(null);
      setSearchDetailBack(null);
      setActiveLockerId(null);
      setSelectedLockerDetail(null);
      setSelectedMapPin(null);
      setSelectedMapPinOffset(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [
      applySearchSelection,
      clearPendingLockerDetailOpen,
      recordSearchHistory,
      setIsSearchOpen,
    ],
  );

  const handleSelectSearchAutocomplete = useCallback(
    (item: SearchAutocompleteItemData, sourceQuery: string) => {
      if (item.itemType === "LOCKER") {
        recordSearchHistory({
          kind: "locker",
          lockerId: item.lockerId,
          title: item.title,
          searchDraft: sourceQuery,
        });
        setContext("search");
        setListKind("keyword");
        setSearchPlaceId(null);
        const lockerSearchSelection = applyLockerSearchDraft(sourceQuery);
        setSearchDraft(lockerSearchSelection.searchDraft);
        setConfirmedSearchQuery(lockerSearchSelection.searchQuery);
        setSearchDetailBack(createKeywordDetailBackTarget());
        openLockerDetailById(
          item.lockerId,
          createLockerDetailFromAutocompleteItem(item),
          { searchDetailBack: createKeywordDetailBackTarget() },
        );
        return;
      }

      recordSearchHistory({
        kind: "place",
        placeId: item.placeId,
        title: item.title,
        searchDraft: sourceQuery,
      });
      openSearchPlaceList(item.placeId, {
        applySelection: true,
        draft: sourceQuery,
        placeName: item.title,
      });
    },
    [
      openLockerDetailById,
      openSearchPlaceList,
      recordSearchHistory,
      setConfirmedSearchQuery,
    ],
  );

  const handleSelectSearchHistory = useCallback(
    (entry: SearchHistoryEntry) => {
      if (entry.kind === "keyword") {
        handleSelectSearch(entry.query);
        return;
      }

      if (entry.kind === "locker") {
        const sourceQuery = resolveSearchHistorySelectionQuery(entry);
        recordSearchHistory({
          kind: "locker",
          lockerId: entry.lockerId,
          title: entry.title,
          searchDraft: sourceQuery,
        });
        setContext("search");
        setListKind("keyword");
        setSearchPlaceId(null);
        const lockerSearchSelection = applyLockerSearchDraft(sourceQuery);
        setSearchDraft(lockerSearchSelection.searchDraft);
        setConfirmedSearchQuery(lockerSearchSelection.searchQuery);
        setSearchDetailBack(createKeywordDetailBackTarget());
        openLockerDetailById(
          entry.lockerId,
          createLockerDetailFromHistoryEntry(entry),
          { searchDetailBack: createKeywordDetailBackTarget() },
        );
        void queryClient.invalidateQueries({
          queryKey: [LOCKER_DETAIL_QUERY_KEY, entry.lockerId],
        });
        return;
      }

      const sourceQuery = resolveSearchHistorySelectionQuery(entry);
      recordSearchHistory({
        kind: "place",
        placeId: entry.placeId,
        title: entry.title,
        searchDraft: sourceQuery,
      });
      openSearchPlaceList(entry.placeId, {
        applySelection: true,
        draft: sourceQuery,
        placeName: entry.title,
      });
    },
    [
      handleSelectSearch,
      openLockerDetailById,
      openSearchPlaceList,
      queryClient,
      recordSearchHistory,
      setConfirmedSearchQuery,
    ],
  );

  const focusMapOnLockerPin = useCallback(
    (pin?: LockerPinItemResponse, zoom?: number) => {
      if (!pin || !mapInstanceRef.current) {
        return;
      }

      if (pin.pinType === "LOCKER") {
        lastFocusedLockerIdRef.current = pin.lockerId;
      }

      focusNaverMapOnCoordinates({
        map: mapInstanceRef.current,
        coordinates: { lat: pin.latitude, lng: pin.longitude },
        bottomInsetPx: getDetailFocusBottomInsetPx(),
        zoom,
      });
    },
    [],
  );

  const handleOpenLockerDetail = useCallback(
    (item: SearchLockerResultItem) => {
      const pin = searchLockerItemToPin(item);

      if (context === "map") {
        setMapDetailBack("placeList");
      } else if (context === "search") {
        setSearchDetailBack(
          listKind === "place" && searchPlaceId != null
            ? createPlaceDetailBackTarget(searchPlaceId)
            : createKeywordDetailBackTarget(),
        );
      }

      setSelectedMapPin(pin);
      setSelectedMapPinOffset(null);
      if (pin) {
        setLockerDetailQueryOrigin({
          lat: searchCoordinates.lat,
          lng: searchCoordinates.lng,
        });
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
      }

      openLockerDetailById(
        item.lockerId,
        createLockerDetailFromSearchItem(item),
        {
          searchDetailBack:
            context === "search"
              ? listKind === "place" && searchPlaceId != null
                ? createPlaceDetailBackTarget(searchPlaceId)
                : createKeywordDetailBackTarget()
              : undefined,
        },
      );
    },
    [
      context,
      focusMapOnLockerPin,
      listKind,
      openLockerDetailById,
      searchCoordinates.lat,
      searchCoordinates.lng,
      searchPlaceId,
    ],
  );

  const openLockerDetailAfterPinFocus = useCallback(
    (
      lockerId: number,
      detail: LockerDetailItem | undefined,
      shouldDelay: boolean,
      options?: { searchDetailBack?: SearchDetailBackTarget | null },
    ) => {
      clearPendingLockerDetailOpen();
      syncLockerDetailUrl(lockerId, detail?.title);

      if (!shouldDelay) {
        openLockerDetailById(lockerId, detail, {
          animateOnMount: true,
          searchDetailBack: options?.searchDetailBack,
          syncUrl: false,
        });
        return;
      }

      pendingLockerDetailOpenTimerRef.current = window.setTimeout(() => {
        pendingLockerDetailOpenTimerRef.current = undefined;
        openLockerDetailById(lockerId, detail, {
          animateOnMount: true,
          searchDetailBack: options?.searchDetailBack,
          syncUrl: false,
        });
      }, DETAIL_SHEET_OPEN_AFTER_MORPH_DELAY_MS);
    },
    [clearPendingLockerDetailOpen, openLockerDetailById, syncLockerDetailUrl],
  );

  const handleListSheetSnapStageChange = useCallback(
    (nextStage: SearchListSheetSnapStage, visibleHeightPx: number | null) => {
      setListSheetSnapStage(nextStage);
      setListSheetVisibleHeight(visibleHeightPx);
    },
    [],
  );

  const handleDetailSheetSnapStageChange = useCallback(
    (nextStage: LockerDetailSheetSnapStage, visibleHeightPx: number | null) => {
      setDetailSheetSnapStage(nextStage);
      setDetailSheetVisibleHeight(visibleHeightPx);
    },
    [],
  );

  const selectedPinId = useMemo(() => {
    if (selectedMapPin) {
      return getPinId(selectedMapPin);
    }
    if (activeLockerId != null) {
      return `LOCKER-${activeLockerId}`;
    }
    if (sheetMode === "detail" && openLockerId != null) {
      return `LOCKER-${openLockerId}`;
    }
    return null;
  }, [selectedMapPin, activeLockerId, openLockerId, sheetMode]);

  const shouldRaiseSelectedPinFromMini = useCallback(
    (pin: LockerPinItemResponse | undefined) =>
      sheetMode === "detail" &&
      detailSheetSnapStage === "mini" &&
      pin?.pinType === "LOCKER" &&
      selectedPinId === getPinId(pin),
    [detailSheetSnapStage, selectedPinId, sheetMode],
  );

  const clearNextMapPressSuppression = useCallback(() => {
    if (mapPressSuppressionTimerRef.current !== undefined) {
      window.clearTimeout(mapPressSuppressionTimerRef.current);
      mapPressSuppressionTimerRef.current = undefined;
    }

    shouldIgnoreNextMapPressRef.current = false;
  }, []);

  const suppressNextMapPressForMarkerInteraction = useCallback(() => {
    clearNextMapPressSuppression();
    shouldIgnoreNextMapPressRef.current = true;
    mapPressSuppressionTimerRef.current = window.setTimeout(() => {
      mapPressSuppressionTimerRef.current = undefined;
      shouldIgnoreNextMapPressRef.current = false;
    }, 120);
  }, [clearNextMapPressSuppression]);

  useEffect(
    () => () => {
      clearNextMapPressSuppression();
    },
    [clearNextMapPressSuppression],
  );

  const raiseSelectedPinFromMini = useCallback(
    (pin: LockerPinItemResponse | undefined, offset?: LockerMarkerOffset) => {
      setSelectedMapPin(pin ?? null);
      setSelectedMapPinOffset(offset ?? null);

      if (sheetMode === "detail") {
        requestDetailSheetSnap("half");
        return;
      }

      requestListSheetSnap("half");
    },
    [requestDetailSheetSnap, requestListSheetSnap, sheetMode],
  );

  const openLockerFromDeepLink = useCallback(
    async (
      lockerId: number,
      options: {
        detailSnap?: LockerDetailSnap;
        focus?: { lat: number; lng: number };
      },
    ) => {
      const pin =
        options.focus != null
          ? createLockerPinAt(lockerId, options.focus.lat, options.focus.lng)
          : undefined;

      setContext("map");
      setMapDetailBack("idle");
      pinSelectedInAppRef.current = false;

      if (pin) {
        deepLinkMapCenterRef.current = {
          lat: pin.latitude,
          lng: pin.longitude,
        };
        setSelectedMapPin(pin);
        setSelectedMapPinOffset(null);
        setLockerDetailQueryOrigin({
          lat: pin.latitude,
          lng: pin.longitude,
        });

        if (mapInstanceRef.current) {
          focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        } else {
          pendingDeepLinkFocusPinRef.current = pin;
        }
      }

      await openLockerDetailById(
        lockerId,
        pin?.pinType === "LOCKER" ? createLockerDetailFromPin(pin) : undefined,
        { detailSnap: options.detailSnap ?? "half" },
      );
    },
    [focusMapOnLockerPin, openLockerDetailById],
  );

  useEffect(() => {
    if (openLockerId == null) {
      handledOpenLockerIdRef.current = null;
      return;
    }

    if (handledOpenLockerIdRef.current === openLockerId) {
      return;
    }

    handledOpenLockerIdRef.current = openLockerId;

    const focus =
      focusLat != null && focusLng != null
        ? { lat: focusLat, lng: focusLng }
        : undefined;

    openLockerFromDeepLink(openLockerId, { detailSnap, focus })
      .then(() => {
        void navigate({
          to: ".",
          search: (prev: HomeSearchParams) => {
            const rest = withoutOpenLockerParams(prev);
            return rest.locker
              ? rest
              : { ...rest, locker: String(openLockerId) };
          },
          replace: true,
        });
      })
      .catch((error) => {
        console.error("Failed to open locker detail from deep link:", error);
        handledOpenLockerIdRef.current = null;
        setLockerDetailQueryOrigin(null);
        void navigate({
          to: ".",
          search: withoutOpenLockerParams,
          replace: true,
        });
      });
  }, [
    detailSnap,
    focusLat,
    focusLng,
    navigate,
    openLockerFromDeepLink,
    openLockerId,
  ]);

  useEffect(() => {
    const pin = pendingDeepLinkFocusPinRef.current;
    if (!pin || !mapInstance) {
      return;
    }

    pendingDeepLinkFocusPinRef.current = null;
    focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
  }, [focusMapOnLockerPin, mapInstance]);

  useEffect(() => {
    if (sheetMode === "detail" && activeLockerId != null) {
      return;
    }

    setLockerDetailQueryOrigin(null);
    deepLinkMapCenterRef.current = null;
  }, [activeLockerId, sheetMode]);

  const handleIdlePinSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin?: LockerPinItemResponse,
      offset?: LockerMarkerOffset,
    ) => {
      const canSelectHomeMapPin =
        context === "idle" ||
        (context === "map" &&
          sheetMode === "detail" &&
          mapDetailBack === "idle");

      if (!canSelectHomeMapPin) {
        return;
      }

      suppressNextMapPressForMarkerInteraction();

      if (pinType === "PLACE") {
        clearLockerDetailUrl();
        setSelectedMapPin(null);
        setSelectedMapPinOffset(null);
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        openMapPlaceList(id);
        return;
      }

      setSelectedMapPin(pin ?? null);
      setSelectedMapPinOffset(offset ?? null);
      pinSelectedInAppRef.current = pin != null;
      // 맵 컨텍스트로 진입 시 카메라 고정 해제 (GPS 업데이트에 의한 강제 이동 방지)
      setIsCameraCentered(false);
      setContext("map");
      setMapDetailBack("idle");
      const detail =
        pin?.pinType === "LOCKER" ? createLockerDetailFromPin(pin) : undefined;
      const shouldDelayDetailOpen =
        pin != null &&
        mapInstanceRef.current != null &&
        (mapInstanceRef.current.getZoom?.() ?? DETAIL_FOCUS_ZOOM) <
          DETAIL_FOCUS_ZOOM;
      focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
      openLockerDetailAfterPinFocus(id, detail, shouldDelayDetailOpen);
    },
    [
      clearLockerDetailUrl,
      context,
      focusMapOnLockerPin,
      mapDetailBack,
      openLockerDetailAfterPinFocus,
      openMapPlaceList,
      sheetMode,
      suppressNextMapPressForMarkerInteraction,
    ],
  );

  const handleMapPlaceMarkerSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin?: LockerPinItemResponse,
      offset?: LockerMarkerOffset,
    ) => {
      if (context !== "map") {
        return;
      }

      suppressNextMapPressForMarkerInteraction();

      if (pinType === "PLACE") {
        clearLockerDetailUrl();
        setSelectedMapPinOffset(null);
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        openMapPlaceList(id);
        return;
      }

      if (shouldRaiseSelectedPinFromMini(pin)) {
        raiseSelectedPinFromMini(pin, offset);
        return;
      }

      setSelectedMapPin(pin ?? null);
      setSelectedMapPinOffset(offset ?? null);
      setMapDetailBack("placeList");
      const detail =
        pin?.pinType === "LOCKER" ? createLockerDetailFromPin(pin) : undefined;
      const shouldDelayDetailOpen =
        pin != null &&
        mapInstanceRef.current != null &&
        (mapInstanceRef.current.getZoom?.() ?? DETAIL_FOCUS_ZOOM) <
          DETAIL_FOCUS_ZOOM;
      focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
      openLockerDetailAfterPinFocus(id, detail, shouldDelayDetailOpen);
    },
    [
      clearLockerDetailUrl,
      context,
      focusMapOnLockerPin,
      openLockerDetailAfterPinFocus,
      openMapPlaceList,
      raiseSelectedPinFromMini,
      shouldRaiseSelectedPinFromMini,
      suppressNextMapPressForMarkerInteraction,
    ],
  );

  const handleSearchMarkerSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin?: LockerPinItemResponse,
      offset?: LockerMarkerOffset,
    ) => {
      if (context !== "search") {
        return;
      }

      suppressNextMapPressForMarkerInteraction();

      if (pinType === "PLACE") {
        setListKind("place");
        setSearchPlaceId(id);
        void navigate({
          to: ".",
          search: (prev: SearchUrlParams) => withSearchPlaceIdParam(prev, id),
        });
        setActiveLockerId(null);
        setSearchDetailBack(null);
        setSelectedLockerDetail(null);
        setSelectedMapPin(null);
        setSelectedMapPinOffset(null);
        setSheetMode("list");
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        return;
      }

      if (shouldRaiseSelectedPinFromMini(pin)) {
        raiseSelectedPinFromMini(pin, offset);
        return;
      }

      const nextSearchDetailBack = createSearchDetailBackTarget({
        listKind: listKind ?? "keyword",
        placeId: listKind === "place" ? searchPlaceId : null,
      });
      setSearchDetailBack(nextSearchDetailBack);
      const detail =
        pin?.pinType === "LOCKER" ? createLockerDetailFromPin(pin) : undefined;
      setSelectedMapPin(pin ?? null);
      setSelectedMapPinOffset(offset ?? null);
      pinSelectedInAppRef.current = pin != null;
      setLockerDetailQueryOrigin({
        lat: searchCoordinates.lat,
        lng: searchCoordinates.lng,
      });
      const shouldDelayDetailOpen =
        pin != null &&
        mapInstanceRef.current != null &&
        (mapInstanceRef.current.getZoom?.() ?? DETAIL_FOCUS_ZOOM) <
          DETAIL_FOCUS_ZOOM;
      focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
      openLockerDetailAfterPinFocus(id, detail, shouldDelayDetailOpen, {
        searchDetailBack: nextSearchDetailBack,
      });
    },
    [
      context,
      focusMapOnLockerPin,
      listKind,
      navigate,
      openLockerDetailAfterPinFocus,
      raiseSelectedPinFromMini,
      searchCoordinates.lat,
      searchCoordinates.lng,
      searchPlaceId,
      shouldRaiseSelectedPinFromMini,
      suppressNextMapPressForMarkerInteraction,
    ],
  );

  const handleOpenPlaceResult = useCallback(
    (item: SearchPlaceResultItem) => {
      const pin = searchResultItemsToPins([item])[0];

      if (context === "map") {
        handleMapPlaceMarkerSelect("PLACE", item.placeId, pin);
        return;
      }

      handleSearchMarkerSelect("PLACE", item.placeId, pin);
    },
    [context, handleMapPlaceMarkerSelect, handleSearchMarkerSelect],
  );

  const handleSelectedMapDetailMarkerSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      _id: number,
      pin?: LockerPinItemResponse,
      offset?: LockerMarkerOffset,
    ) => {
      suppressNextMapPressForMarkerInteraction();

      if (pinType === "LOCKER" && shouldRaiseSelectedPinFromMini(pin)) {
        raiseSelectedPinFromMini(pin, offset);
      }
    },
    [
      raiseSelectedPinFromMini,
      shouldRaiseSelectedPinFromMini,
      suppressNextMapPressForMarkerInteraction,
    ],
  );

  const handleOpenNavigationPopup = useCallback(() => {
    setIsNavigationPopupOpen(true);
  }, []);

  const handleCorrectionSubmit = useCallback(
    async (item: LockerDetailItem, request: LockerCorrectionRequest) => {
      await postLockerIssueReport(
        item.lockerId,
        toLockerIssueReportRequest(request),
      );
    },
    [],
  );

  const handleShareLockerDetail = useCallback((item: LockerDetailItem) => {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = createLockerDeepLinkUrl({
      origin: window.location.origin,
      lockerId: item.lockerId,
      title: item.title,
    });
    const shareLocale = normalizeLocale(languageTag()) ?? BASE_LOCALE;
    const shareText = createLockerShareText({
      locale: shareLocale,
      url: shareUrl,
      title: item.title,
      address: item.address,
    });

    const copyShareUrlToClipboard = () => {
      if (!navigator.clipboard) {
        console.error(
          "Failed to copy locker detail: Clipboard API is not supported",
        );
        return;
      }

      void navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          setShareCopied(true);
        })
        .catch((error) => {
          console.error("Failed to copy locker detail:", error);
        });
    };

    if (navigator.share) {
      void navigator
        .share({
          title: item.title,
          text: shareText,
        })
        .catch((error) => {
          if (error instanceof Error && error.name === "AbortError") {
            return;
          }

          console.error("Failed to share locker detail:", error);
        });
      return;
    }

    copyShareUrlToClipboard();
  }, []);

  const navigationKnownLocation = useMemo(
    () => (permission === "granted" && location ? location : null),
    [permission, location],
  );

  const handleNavigationPopupOpenChange = useCallback((isOpen: boolean) => {
    setIsNavigationPopupOpen(isOpen);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    const willResetMapContext = context === "map" && mapDetailBack === "idle";

    if (!willResetMapContext) {
      void flushLockerSheetMutations();
    }

    setLockerDetailOpensFull(false);
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setSelectedMapPinOffset(null);
    setIsNavigationPopupOpen(false);

    if (context === "map") {
      if (mapDetailBack === "idle") {
        resetMapContext();
        if (search.locker) {
          void navigate({
            to: ".",
            search: withoutLockerParam,
          });
        }
        return;
      }

      setSheetMode("list");
      if (search.locker) {
        void navigate({
          to: ".",
          search: withoutLockerParam,
        });
      }
      return;
    }

    if (searchDetailBack) {
      setListKind(searchDetailBack.listKind);
      setSearchPlaceId(searchDetailBack.placeId);
    }

    setSheetMode("list");
    if (search.locker) {
      void navigate({
        to: ".",
        search: withoutLockerParam,
      });
    }
  }, [
    context,
    flushLockerSheetMutations,
    mapDetailBack,
    resetMapContext,
    searchDetailBack,
    search.locker,
    navigate,
  ]);

  const handleBackFromMapPlaceSheet = useCallback(() => {
    resetMapContext();
  }, [resetMapContext]);

  const handleBackToKeywordList = useCallback(() => {
    void flushLockerSheetMutations();
    if (getSearchQueryIssue(searchDraft) === null) {
      setConfirmedSearchQuery(trimSearchQueryDraft(searchDraft));
    } else {
      setConfirmedSearchQuery("");
    }
    setListKind("keyword");
    setSearchPlaceId(null);
    setSheetMode("list");
  }, [flushLockerSheetMutations, searchDraft, setConfirmedSearchQuery]);

  const handleBackFromSearchFilter = useCallback(() => {
    setSheetMode("list");
  }, []);

  const handleOpenSearchFilter = useCallback(() => {
    setSheetMode("filter");
  }, []);

  const handleResetSearchFilter = useCallback(() => {
    const defaultFilters = createDefaultSearchFilters();
    setSearchFilters(defaultFilters);
    clearSearchFiltersFromSession();
  }, []);

  const handleApplySearchFilter = useCallback(
    (filters: SearchFilterAppliedState) => {
      setSearchFilters(filters);
      syncSearchFilterSession(filters);
      setSheetMode("list");
    },
    [syncSearchFilterSession],
  );

  const searchBarBackAction = resolveSearchBarBackAction({
    context,
    listKind,
    sheetMode,
    searchDetailBack,
  });
  const searchBarBackPress =
    searchBarBackAction === "mapPlaceList"
      ? handleBackFromMapPlaceSheet
      : searchBarBackAction === "searchDetail"
        ? handleBackFromDetail
        : searchBarBackAction === "searchFilter"
          ? handleBackFromSearchFilter
          : searchBarBackAction === "searchPlaceList"
            ? handleBackToKeywordList
            : searchBarBackAction === "searchKeywordList"
              ? resetSearchContext
              : undefined;
  const listSheetDismissPress =
    searchBarBackAction === "mapPlaceList"
      ? handleBackFromMapPlaceSheet
      : searchBarBackAction === "searchPlaceList"
        ? handleBackToKeywordList
        : resetSearchContext;

  useEffect(() => {
    if (sheetMode !== "detail" || !lockerDetail) {
      return;
    }

    if (lockerDetail.lockerId !== activeLockerId) {
      return;
    }

    setSelectedLockerDetail((previousDetail) =>
      mergeStoredLockerDetailWithPreviousDistance(lockerDetail, previousDetail),
    );

    // API 응답을 받아 보관함 이름이 확보되면 URL을 슬러그 형태로 정규화하여 업데이트함
    syncLockerDetailUrl(lockerDetail.lockerId, lockerDetail.title, {
      replace: true,
    });

    if (
      isPendingFocusRef.current &&
      mapInstance &&
      lockerDetail.latitude !== undefined &&
      lockerDetail.longitude !== undefined
    ) {
      isPendingFocusRef.current = false;
      lastFocusedLockerIdRef.current = lockerDetail.lockerId;
      focusNaverMapOnCoordinates({
        map: mapInstance,
        coordinates: {
          lat: lockerDetail.latitude,
          lng: lockerDetail.longitude,
        },
        bottomInsetPx: getDetailFocusBottomInsetPx(),
      });
    }
  }, [
    lockerDetail,
    mapInstance,
    syncLockerDetailUrl,
    sheetMode,
    activeLockerId,
  ]);

  useEffect(() => {
    if (sheetMode === "idle") {
      writeMapSheetSessionSnapshot(null);
      return;
    }

    writeMapSheetSessionSnapshot({
      sheetMode,
      context,
      activeLockerId,
      selectedLockerDetail,
      selectedMapPin,
      mapPlaceId,
      mapDetailBack,
      listKind,
      searchPlaceId,
      searchDetailBack,
    });
  }, [
    activeLockerId,
    context,
    listKind,
    mapDetailBack,
    mapPlaceId,
    searchDetailBack,
    searchPlaceId,
    selectedLockerDetail,
    selectedMapPin,
    sheetMode,
  ]);

  useEffect(() => {
    if (sheetMode === "idle") {
      return;
    }

    if (openLockerId != null) {
      return;
    }

    if (
      isRenderableSheetSession({
        sheetMode,
        selectedLockerDetail,
        shouldFetchKeywordList,
        shouldFetchPlaceList,
      })
    ) {
      return;
    }

    if (context === "search") {
      resetSearchContext();
      return;
    }

    resetMapContext();
  }, [
    context,
    resetMapContext,
    resetSearchContext,
    selectedLockerDetail,
    sheetMode,
    shouldFetchKeywordList,
    shouldFetchPlaceList,
    openLockerId,
  ]);

  // 카메라 고정(트래킹) 중일 때 위치가 갱신되면 지도 중심 이동.
  // 홈 idle 컨텍스트에서만 동작: 핀 선택·검색 등 비홈 컨텍스트에서는
  // isCameraCentered가 남아있어도 강제 이동하지 않는다 (버그 방지).
  useEffect(() => {
    if (
      isCameraCentered &&
      location &&
      mapInstance &&
      context === "idle" &&
      sheetMode === "idle" &&
      !isSearchOpen
    ) {
      focusNaverMapOnCoordinates({ map: mapInstance, coordinates: location });
    }
  }, [
    isCameraCentered,
    location,
    mapInstance,
    context,
    sheetMode,
    isSearchOpen,
  ]);

  useEffect(() => {
    if (sheetMode !== "list" && sheetMode !== "filter") {
      return;
    }

    if (context === "map") {
      return;
    }

    const bounds = activePlaceId
      ? placeLockersResults?.bounds
      : keywordSearchResults?.bounds;

    if (!bounds) {
      return;
    }

    const bottomPadding = getSearchBoundsBottomPadding({
      sheetMode,
      windowHeight,
    });

    fitNaverMapToBounds({
      map: mapInstance,
      bounds,
      bottomPadding,
    });
  }, [
    keywordSearchResults?.bounds,
    mapInstance,
    placeLockersResults?.bounds,
    activePlaceId,
    sheetMode,
    windowHeight,
    context,
  ]);

  const shouldRenderMapControls = shouldShowMapControls({
    isMapLoading,
    hasMapError,
    hasMapInstance: !!mapInstance,
  });
  const shouldRenderHomeSearchBar = shouldShowHomeSearchBar({ hasMapError });
  const shouldRenderHomeHeader = shouldShowHomeHeader({
    isSearchContextActive: context === "search",
    hasMapError,
  });
  const isSearchFilterActive =
    searchFilters.regionActive ||
    searchFilters.sizeActive ||
    searchFilters.placeTypeActive;
  const isPlaceListScope = activePlaceId != null;
  const searchBottomSheetItems = isPlaceListScope
    ? (placeLockersResults?.lockers ?? [])
    : (keywordSearchResults?.items ?? []);

  const searchBottomSheetDisplayItems = useMemo((): SearchResultItem[] => {
    if (isPlaceListScope) {
      return applyFavoriteOverlayToLockerItems(
        searchBottomSheetItems as SearchLockerResultItem[],
        favoriteSession.getEffectiveIsFavorite,
      );
    }

    return applyFavoriteOverlayToSearchResultItems(
      searchBottomSheetItems as SearchResultItem[],
      favoriteSession.getEffectiveIsFavorite,
    );
  }, [
    favoriteSession.getEffectiveIsFavorite,
    isPlaceListScope,
    searchBottomSheetItems,
  ]);

  const displayedLockerDetail = useMemo(() => {
    const detailBase = lockerDetail
      ? mergeDisplayLockerDetailWithPreviousDistance(
          lockerDetail,
          selectedLockerDetail,
        )
      : selectedLockerDetail;

    if (!detailBase) {
      return null;
    }

    const withFavorite = applyFavoriteOverlayToLockerDetail(
      detailBase,
      favoriteSession.getEffectiveIsFavorite,
    );

    return withFavorite;
  }, [
    favoriteSession.getEffectiveIsFavorite,
    lockerDetail,
    selectedLockerDetail,
  ]);

  /**
   * 지금 화면에 실제로 떠 있는 시트. 시트 렌더 조건과 같은 함수를 쓴다.
   *
   * sheetMode 만 보면 검색 오버레이가 덮거나 상세에 그릴 내용이 없어 시트가
   * 사라진 동안에도 컨트롤이 없는 시트 윗변에 그대로 떠 있었다.
   */
  const visibleSheetKind = resolveVisibleSheetKind({
    sheetMode,
    isMapLoading,
    isSearchOpen,
    hasDetailContent: displayedLockerDetail !== null,
  });
  // 스켈레톤은 하이드레이션 전에도 그려지므로 라이브 오프셋을 쓸 수 없다.
  // 시트가 아직 없는 단계라 정적 계산이 맞고, 실제 컨트롤로 넘어갈 때는 이미
  // 시트가 자리를 잡아 두 값이 같은 위치를 가리킨다.
  const sheetVisibleHeight = !hasMeasuredViewport
    ? null
    : visibleSheetKind === "detail"
      ? detailSheetVisibleHeight
      : visibleSheetKind === "list"
        ? listSheetVisibleHeight
        : null;
  const mapControlBottom = resolveMapControlBottomPx({
    baseBottomPx: MAP_CONTROL_FALLBACK_BOTTOM_PX,
    sheetVisibleHeightPx: sheetVisibleHeight,
    windowHeightPx: windowHeight,
  });

  /**
   * 컨트롤을 시트 위로 밀어 올릴 단계인지. 단계가 바뀔 때만 정하고 프레임마다 다시
   * 계산하지 않는다. 라이브 오프셋으로 판정하면 드래그 중 컨트롤이 깜빡인다.
   *
   * full 도 자리가 있으면 밀어 올린다. 상세 시트의 full 은 콘텐츠가 짧으면 화면을
   * 다 덮지 못해 위에 지도가 남는데, 거기서도 새로고침·내 위치를 쓸 수 있어야 한다.
   * 자리가 없으면 resolveMapControlBottomPx 가 null 을 줘 숨겨진다.
   * dismiss 와 filter 시트는 시트 쪽이 null 을 준다.
   */
  const isMapControlRaised = sheetVisibleHeight !== null;
  /**
   * 시트 윗변을 따라갈지. 밀어 올릴 단계가 아니어도 시트가 아직 움직이는 중이면
   * 계속 따라간다.
   *
   * 시트는 스프링을 시작하자마자 단계를 바꾼다. 단계만 보면 하프에서 full 로
   * 스냅할 때 컨트롤이 손을 떼는 순간 기본 위치로 툭 떨어지고, 시트는 그 뒤에
   * 300ms 동안 올라온다. 안착한 뒤에 넘기면 그 구간이 없다.
   *
   * 시트가 아예 없는 동안은 따라갈 대상이 없다. 애니메이션 도중에 시트가
   * 사라져 isSettled 가 false 로 굳는 경우도 여기서 걸러진다.
   */
  const shouldTrackSheet =
    visibleSheetKind !== null && (isMapControlRaised || !isSheetSettled);

  /**
   * 시트가 사라진 뒤에도 오프셋이 과거 값에 멈춰 있으면 컨트롤이 없는 시트 위에
   * 떠 있게 된다. 밀어 올릴 단계가 아니면 "차지하는 높이 0" 으로 되돌린다.
   *
   * 안착 여부도 함께 되돌린다. 시트가 애니메이션 도중에 사라지면 마지막으로 받은
   * false 가 그대로 굳어, 다음에 시트가 없는 동안에도 추적이 켜진 것으로 남는다.
   */
  useEffect(() => {
    if (!shouldTrackSheet) {
      sheetLiveOffset.set(SHEET_OFFSET_NONE_PX);
      sheetMountProgress.set(1);
      setIsSheetSettled(true);
    }
  }, [shouldTrackSheet, sheetLiveOffset, sheetMountProgress]);

  /**
   * 시트가 사라지면 실측 높이도 시트와 함께 버린다.
   *
   * 이 값은 시트가 콜백으로 올려 주는 것이라 시트가 없는 동안에는 갱신될 길이
   * 없다. 남겨 두면 다음에 시트가 뜰 때 지난 단계의 높이로 컨트롤이 먼저
   * 뛰어오른다. 마운트 첫 프레임에 기본 위치로 튀지 않도록 null 이 아니라 각
   * 시트의 하프 높이로 되돌린다.
   */
  useEffect(() => {
    if (visibleSheetKind !== null) {
      return;
    }

    setListSheetVisibleHeight(
      resolveSearchListStageVisibleHeight("half", windowHeight),
    );
    setDetailSheetVisibleHeight(resolveDetailSheetVisibleHeight("half"));
  }, [visibleSheetKind, windowHeight]);

  const isSearchListLoading = shouldShowSearchListLoading({
    isPlaceListScope,
    shouldFetchPlaceList,
    shouldFetchKeywordList,
    isPlaceLockersPending,
    isKeywordSearchPending,
  });
  const isSearchListError = isPlaceListScope
    ? isPlaceLockersError
    : isKeywordSearchError;
  const refetchSearchList = isPlaceListScope
    ? refetchPlaceLockers
    : refetchKeywordSearch;
  const selectedMapDetailPins = useMemo(() => {
    if (context !== "map" || sheetMode !== "detail") {
      return [];
    }

    if (selectedMapPin) {
      return [
        selectedMapPin.pinType === "LOCKER" && selectedMapPin.lockerId != null
          ? {
              ...selectedMapPin,
              isFavorite: favoriteSession.getEffectiveIsFavorite(
                selectedMapPin.lockerId,
                displayedLockerDetail?.lockerId === selectedMapPin.lockerId
                  ? displayedLockerDetail.isFavorite
                  : (selectedMapPin.isFavorite ?? undefined),
              ),
            }
          : selectedMapPin,
      ];
    }

    if (
      selectedLockerDetail?.lockerId == null ||
      selectedLockerDetail.latitude === undefined ||
      selectedLockerDetail.longitude === undefined
    ) {
      return [];
    }

    return [
      {
        pinType: "LOCKER" as const,
        lockerId: selectedLockerDetail.lockerId,
        placeId: null,
        latitude: selectedLockerDetail.latitude,
        longitude: selectedLockerDetail.longitude,
        isFavorite:
          displayedLockerDetail?.lockerId === selectedLockerDetail.lockerId
            ? (displayedLockerDetail.isFavorite ?? null)
            : (selectedLockerDetail.isFavorite ?? null),
        lockerCount: null,
        pinCount: null,
        bounds: null,
      },
    ];
  }, [
    context,
    displayedLockerDetail,
    favoriteSession.getEffectiveIsFavorite,
    selectedLockerDetail,
    selectedMapPin,
    sheetMode,
  ]);
  const markerLayer = resolveMapMarkerLayer({
    context,
    sheetMode,
    isSearchOpen,
    searchDetailBack,
    mapDetailBack,
    hasSelectedMapPin: selectedMapPin !== null,
    selectedMapDetailPinCount: selectedMapDetailPins.length,
  });
  const searchMarkerListKind =
    sheetMode === "detail" ? searchDetailBack?.listKind : listKind;
  const shouldUseKeywordSearchPinLayer =
    markerLayer === "search" &&
    searchMarkerListKind === "keyword" &&
    keywordSearchParams !== null;
  const selectedPinPreservedOffsets = useMemo(() => {
    if (!selectedPinId || !selectedMapPinOffset) {
      return undefined;
    }

    return new Map([[selectedPinId, selectedMapPinOffset]]);
  }, [selectedPinId, selectedMapPinOffset]);
  const searchListSheetKey =
    context === "search" && listKind === "keyword"
      ? `search-keyword-${effectiveSearchQuery}`
      : `${context}-${listKind ?? "none"}-${activePlaceId ?? "none"}`;
  /**
   * 지금 떠 있는 시트 인스턴스의 식별자. 목록은 리마운트 키를, 상세는 보관함
   * id 를 쓴다. 시트가 새로 마운트되는 기준과 같아야 이전 인스턴스의 프레임을
   * 가려낼 수 있다.
   */
  const visibleSheetToken =
    visibleSheetKind === "list"
      ? `list:${searchListSheetKey}`
      : visibleSheetKind === "detail" && displayedLockerDetail
        ? `detail:${displayedLockerDetail.lockerId}`
        : null;
  visibleSheetTokenRef.current = visibleSheetToken;
  const handleListSheetLiveOffsetChange = useCallback(
    (state: LockerDetailSheetLiveOffsetState) =>
      applySheetLiveOffset(`list:${searchListSheetKey}`, state),
    [applySheetLiveOffset, searchListSheetKey],
  );
  const detailSheetToken = displayedLockerDetail
    ? `detail:${displayedLockerDetail.lockerId}`
    : null;
  const handleDetailSheetLiveOffsetChange = useCallback(
    (state: LockerDetailSheetLiveOffsetState) => {
      if (detailSheetToken === null) {
        return;
      }

      applySheetLiveOffset(detailSheetToken, state);
    },
    [applySheetLiveOffset, detailSheetToken],
  );
  // searchListSheetKey 는 본문에서 읽지 않는다. 다른 목록으로 바뀌면 스냅
  // 단계를 하프로 되돌리려고 넣은 트리거다. 빼면 직전 목록의 단계가 남는다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: searchListSheetKey 는 초기화 트리거다
  useEffect(() => {
    if (sheetMode === "list") {
      setListSheetSnapStage("half");
      clearListSheetSnapRequest();
    }
  }, [clearListSheetSnapRequest, searchListSheetKey, sheetMode]);

  // activeLockerId 는 본문에서 읽지 않는다. 다른 보관함을 열면 스냅 단계를
  // 다시 정하려고 넣은 트리거다. 빼면 직전 보관함의 단계로 열린다(#157).
  // biome-ignore lint/correctness/useExhaustiveDependencies: activeLockerId 는 초기화 트리거다
  useEffect(() => {
    if (sheetMode === "detail") {
      setDetailSheetSnapStage(lockerDetailOpensFull ? "full" : "half");
      clearDetailSheetSnapRequest();
    }
  }, [
    activeLockerId,
    clearDetailSheetSnapRequest,
    lockerDetailOpensFull,
    sheetMode,
  ]);

  const handleMapPress = useCallback(() => {
    setTimeout(() => {
      if (shouldIgnoreNextMapPressRef.current) {
        clearNextMapPressSuppression();
        return;
      }

      if (
        (context === "search" || context === "map") &&
        sheetMode === "list" &&
        !isSearchOpen &&
        listSheetSnapStage === "half"
      ) {
        requestListSheetSnap("mini");
        return;
      }

      if (
        (context === "search" || context === "map") &&
        sheetMode === "detail" &&
        !isSearchOpen &&
        detailSheetSnapStage === "half"
      ) {
        requestDetailSheetSnap("mini");
      }
    }, 20);
  }, [
    context,
    clearNextMapPressSuppression,
    detailSheetSnapStage,
    isSearchOpen,
    listSheetSnapStage,
    requestDetailSheetSnap,
    requestListSheetSnap,
    sheetMode,
  ]);

  const handleMapPressRef = useRef(handleMapPress);
  handleMapPressRef.current = handleMapPress;

  // 지도 드래그 시 카메라 고정 해제 (GPS 유지), 바텀시트 snap 다운
  // 방향 트래킹은 드래그 후에도 유지된다 (Q1 결정 사항: 아이콘 방향 표시 유지).
  useEffect(() => {
    const maps = typeof window !== "undefined" ? window.naver?.maps : null;

    if (!mapInstance || !maps?.Event) return;

    const listener = maps.Event.addListener(mapInstance, "dragstart", () => {
      hasUserMovedMapBeforeInitialGpsRef.current = true;
      setIsCameraCentered(false); // 카메라 고정 해제 (위치 추적 중단)
      // stopOrientationTracking()은 호출하지 않음 → 방향 트래킹 유지
      isPendingFocusRef.current = false;
      mapInstance.setCenter(mapInstance.getCenter());
      handleMapPressRef.current();
    });

    return () => {
      maps.Event.removeListener(listener);
    };
  }, [mapInstance]);
  const handleClusterClick = useCallback(
    (bounds: LockerBoundsRaw) => {
      suppressNextMapPressForMarkerInteraction();
      focusNaverMapOnClusterBounds({
        map: mapInstance,
        bounds,
      });
    },
    [mapInstance, suppressNextMapPressForMarkerInteraction],
  );

  return (
    <main className={pageWrapper}>
      {shouldRenderHomeHeader ? (
        <HomeHeader
          profileImageUrl={user?.profileImageUrl ?? ""}
          onProfilePress={() => navigate({ to: "/settings" })}
        />
      ) : null}
      {shouldRenderHomeSearchBar ? (
        <HomeSearchBar
          onOpenSearch={handleOpenSearch}
          onBackPress={searchBarBackPress}
          onCloseSearchContext={handleExitSearchContext}
          searchQuery={effectiveSearchQuery}
          showBackButton={searchBarBackPress !== undefined}
          isSearchContextActive={context === "search"}
        />
      ) : null}

      <NaverMapProvider language={languageTag()}>
        <NaverMapCanvas
          key={mapRemountKey}
          onLoad={handleMapLoad}
          onWillDestroy={persistMapViewport}
          onLoadingChange={setIsMapLoading}
          onErrorChange={setHasMapError}
          onMapPress={handleMapPress}
          initialCenter={mapBootstrap.center}
          initialZoom={mapBootstrap.zoom}
        />
        <MyLocationMarker
          map={mapInstance}
          location={location}
          deviceHeading={deviceHeading}
          isOrientationTracking={isOrientationTracking}
        />
        {!isMapLoading && markerLayer === "idle" && (
          <LockerMarkersLayer
            map={mapInstance}
            selectedPinId={selectedPinId}
            selectedPin={selectedMapPin}
            onSelectPin={handleIdlePinSelect}
            onClusterClick={handleClusterClick}
          />
        )}
        {!isMapLoading && shouldUseKeywordSearchPinLayer && (
          <LockerMarkersLayer
            map={mapInstance}
            searchParams={keywordSearchParams}
            selectedPinId={selectedPinId}
            selectedPin={selectedMapPin}
            onSelectPin={handleSearchMarkerSelect}
            onClusterClick={handleClusterClick}
          />
        )}
        {!isMapLoading &&
          !shouldUseKeywordSearchPinLayer &&
          (markerLayer === "search" ||
            markerLayer === "mapPlace" ||
            markerLayer === "selectedMapDetail") && (
            <SearchResultMarkersLayer
              map={mapInstance}
              pins={
                markerLayer === "search"
                  ? searchResultPins
                  : markerLayer === "mapPlace"
                    ? mapPlacePins
                    : selectedMapDetailPins
              }
              selectedPinId={selectedPinId}
              onSelectLocker={
                markerLayer === "search"
                  ? handleSearchMarkerSelect
                  : markerLayer === "mapPlace"
                    ? handleMapPlaceMarkerSelect
                    : handleSelectedMapDetailMarkerSelect
              }
              spreadCenter={
                (markerLayer === "mapPlace" ||
                  (markerLayer === "search" && listKind === "place")) &&
                lastValidSpreadCenterRef.current?.placeId === activePlaceId
                  ? {
                      lat: lastValidSpreadCenterRef.current.latitude,
                      lng: lastValidSpreadCenterRef.current.longitude,
                    }
                  : undefined
              }
              preservedOffsets={
                markerLayer === "selectedMapDetail"
                  ? selectedPinPreservedOffsets
                  : undefined
              }
            />
          )}
      </NaverMapProvider>
      {/*
        배치 불가(null)면 스켈레톤도 내보내지 않는다. 실제 컨트롤은 바로 아래
        분기에서 숨겨지므로, 스켈레톤만 남기면 지도가 준비되는 순간 버튼이 사라진다.
      */}
      {isMapLoading &&
      !hasMapError &&
      !isRefreshing &&
      mapControlBottom !== null ? (
        <MapControlsSkeleton bottomPx={mapControlBottom} />
      ) : (shouldRenderMapControls || isRefreshing) &&
        mapControlBottom !== null ? (
        <motion.div
          className={locationControlStack}
          // E2E 가 위치를 재는 앵커. 스켈레톤과 구분되도록 실제 컨트롤에만 둔다.
          data-map-control-stack=""
          initial={false}
          /*
            바닥 위치는 늘 같은 모션 값이 쥔다. 시트가 없으면 그 값이 기본 자리를
            가리키므로 따로 갈아끼울 필요가 없다.

            모션 값과 정적 값을 오가게 두면, 전환하는 순간 DOM 에 남은 인라인
            스타일이 갱신되지 않고 굳는 경우가 있었다. 시트가 사라졌는데 컨트롤만
            시트 윗변에 남는 화면이 그것이다. 한쪽만 쓰면 그 틈이 없다.
          */
          style={{ bottom: mapControlRaisedBottom }}
        >
          <LockerTimerMapControl
            buttonClassName={locationButton}
            onSelect={handleTimerControlSelect}
          />
          <RefreshButton
            isRefreshing={isRefreshing}
            isMapReady={!!mapInstance}
            isOtherControlBusy={isLocating || isMyLocationPending}
            isRefreshSpinning={isRefreshSpinning}
            refreshCooldownRemaining={refreshCooldownRemaining}
            onRefresh={handleRefreshMap}
          />
          <MyLocationButton
            permission={permission}
            isOtherControlBusy={isRefreshing}
            isCameraCentered={isCameraCentered}
            isLocating={isLocating || isMyLocationPending}
            isOrientationTracking={isOrientationTracking}
            onMyLocation={handleMyLocation}
          />
        </motion.div>
      ) : null}

      {isLocationRequestInterrupted && !isLocationRecoveryNoticeDismissed ? (
        <div className={locationRecoveryNoticePositioner}>
          <div className={locationRecoveryNotice} aria-live="polite">
            <span className={locationRecoveryNoticeMessage}>
              {m.home_location_interrupted_notice()}
            </span>
            <button
              type="button"
              className={locationRecoveryNoticeAction}
              onClick={reloadForLocationRecovery}
            >
              {m.home_location_interrupted_notice_action()}
            </button>
            <button
              type="button"
              className={locationRecoveryNoticeClose}
              aria-label={m.home_location_interrupted_notice_close_aria()}
              onClick={handleDismissLocationRecoveryNotice}
            >
              <IconCircleboxClose32 />
            </button>
          </div>
        </div>
      ) : null}

      <Popup
        isOpen={isLocationPopupOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeLocationPopup();
        }}
        titleText={m.home_location_permission_title()}
        helperText={m.home_location_permission_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: closeLocationPopup,
        }}
      />

      <Popup
        isOpen={isLocationErrorPopupOpen}
        onOpenChange={setIsLocationErrorPopupOpen}
        titleText={m.home_location_error_title()}
        helperText={m.home_location_error_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setIsLocationErrorPopupOpen(false),
        }}
      />

      <Popup
        isOpen={isOrientationDeniedPopupOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) setIsOrientationDeniedPopupOpen(false);
        }}
        titleText={m.home_orientation_permission_title()}
        helperText={m.home_orientation_permission_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setIsOrientationDeniedPopupOpen(false),
        }}
      />

      {visibleSheetKind === "list" ? (
        <SearchListBottomSheet
          key={searchListSheetKey}
          searchQuery={effectiveSearchQuery}
          items={searchBottomSheetDisplayItems}
          placeName={activePlaceName}
          appLanguage={normalizeLocale(languageTag()) ?? BASE_LOCALE}
          isFilterActive={isSearchFilterActive}
          isLoading={isSearchListLoading}
          isError={isSearchListError}
          onRetry={() => void refetchSearchList()}
          onOpenFilter={handleOpenSearchFilter}
          onResetFilter={handleResetSearchFilter}
          onLockerPress={handleOpenLockerDetail}
          onPlacePress={handleOpenPlaceResult}
          onFavoriteChange={favoriteSession.handleSearchFavoriteChange}
          animateOnMount
          onDismiss={listSheetDismissPress}
          snapRequest={listSheetSnapRequest}
          onSnapStageChange={handleListSheetSnapStageChange}
          onLiveOffsetChange={handleListSheetLiveOffsetChange}
        />
      ) : null}

      {visibleSheetKind === "detail" && displayedLockerDetail ? (
        <LockerDetailBottomSheet
          locker={displayedLockerDetail}
          loadState={lockerDetailLoadState}
          onRetry={() => void refetchLockerDetail()}
          onFavoriteChange={
            lockerDetail
              ? (item, next) =>
                  favoriteSession.handleDetailFavoriteChange(
                    item,
                    next,
                    lockerDetail.isFavorite,
                  )
              : undefined
          }
          onBack={handleBackFromDetail}
          onShare={handleShareLockerDetail}
          onNavigate={handleOpenNavigationPopup}
          onCorrectionSubmit={handleCorrectionSubmit}
          isFavoriteActionVisible={isAuthenticated}
          initialSnapPoint={
            lockerDetailOpensFull ? LOCKER_DETAIL_FULL_TOP_OFFSET : undefined
          }
          animateOnMount={lockerDetailAnimatesOnMount}
          snapRequest={detailSheetSnapRequest}
          onSnapStageChange={handleDetailSheetSnapStageChange}
          onLiveOffsetChange={handleDetailSheetLiveOffsetChange}
          shouldOpenTimer={
            timerAutoOpenLockerId === displayedLockerDetail.lockerId
          }
          onTimerAutoOpenHandled={handleTimerAutoOpenHandled}
        />
      ) : null}

      <NavigationPlatformPopup
        isOpen={isNavigationPopupOpen}
        locker={displayedLockerDetail}
        knownLocation={navigationKnownLocation}
        onOpenChange={handleNavigationPopupOpenChange}
      />

      {!isMapLoading && sheetMode === "filter" && !isSearchOpen ? (
        <SearchFilterBottomSheet
          initialFilters={searchFilters}
          onCollapseToResults={() => setSheetMode("list")}
          onReset={handleResetSearchFilter}
          onApply={handleApplySearchFilter}
          animateOnMount
        />
      ) : null}

      {isSearchOpen ? (
        <SearchOverlay
          initialQuery={searchDraft}
          searchCoordinates={searchCoordinates}
          recentEntries={searchHistoryEntries}
          onClose={handleCloseSearch}
          onSelect={handleSelectSearch}
          onSelectAutocomplete={handleSelectSearchAutocomplete}
          onSelectHistory={handleSelectSearchHistory}
          onRemoveRecent={removeSearchHistory}
          onClearRecent={clearSearchHistory}
        />
      ) : null}

      <Popup
        isOpen={shareCopied}
        onOpenChange={(isOpen) => {
          if (!isOpen) setShareCopied(false);
        }}
        titleText={m.locker_detail_share_copied()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setShareCopied(false),
        }}
      />
    </main>
  );
}

function LockerMarkersLayer({
  map,
  searchParams,
  selectedPinId,
  selectedPin,
  onSelectPin,
  onClusterClick,
  spreadCenter,
}: {
  map: naver.maps.Map | null;
  searchParams?: LockerPinSearchParams | null;
  selectedPinId?: string | null;
  selectedPin?: LockerPinItemResponse | null;
  onSelectPin?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
    offset: LockerMarkerOffset,
  ) => void;
  onClusterClick?: (
    bounds: import("#/shared/api/lockers").LockerBoundsRaw,
  ) => void;
  spreadCenter?: { lat: number; lng: number } | null;
}) {
  const { maps } = useNaverMapSdk();

  useLockerMarkers({
    map,
    maps,
    searchParams,
    selectedPinId,
    selectedPin,
    onSelectLocker: onSelectPin,
    onClusterClick,
    spreadCenter,
  });

  return null;
}

function SearchResultMarkersLayer({
  map,
  pins,
  selectedPinId,
  onSelectLocker,
  spreadCenter,
  preservedOffsets,
}: {
  map: naver.maps.Map | null;
  pins: ReturnType<typeof searchResultItemsToPins>;
  selectedPinId?: string | null;
  onSelectLocker: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
    offset: LockerMarkerOffset,
  ) => void;
  spreadCenter?: { lat: number; lng: number } | null;
  preservedOffsets?: ReadonlyMap<string, LockerMarkerOffset>;
}) {
  const { maps } = useNaverMapSdk();

  useSearchResultMarkers({
    map,
    maps,
    pins,
    selectedPinId,
    onSelectLocker,
    spreadCenter,
    preservedOffsets,
  });

  return null;
}
