import { languageTag, m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import {
  IconCircleboxCrosshair48,
  IconCircleboxRefresh48,
} from "@repo/ui/tokens/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HomeSearchBar } from "#/composites/search/HomeSearchBar";
import {
  createLockerDetailFromAutocompleteItem,
  createLockerDetailFromHistoryEntry,
  createLockerDetailFromPin,
  createLockerDetailFromSearchItem,
  createLockerDetailPlaceholder,
  LockerDetailBottomSheet,
  type LockerDetailItem,
  type LockerDetailLoadState,
} from "#/composites/search/LockerDetailBottomSheet";
import { NavigationPlatformPopup } from "#/composites/search/NavigationPlatformPopup";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
  SearchFilterBottomSheet,
} from "#/composites/search/SearchFilterBottomSheet";
import { SearchListBottomSheet } from "#/composites/search/SearchListBottomSheet";
import { SearchOverlay } from "#/composites/search/SearchOverlay";
import type {
  SearchLockerResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
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
  fitNaverMapToBounds,
  focusNaverMapOnClusterBounds,
} from "#/entities/map/model/map-bounds";
import {
  getPinId,
  type LockerMarkerOffset,
} from "#/entities/map/model/map-marker";
import { useLocationTracking } from "#/entities/map/model/useLocationTracking";
import {
  LOCKER_PINS_QUERY_KEY,
  useLockerMarkers,
} from "#/entities/map/model/useLockerMarkers";
import { useSearchResultMarkers } from "#/entities/map/model/useSearchResultMarkers";
import { MyLocationMarker } from "#/entities/map/ui/MyLocationMarker";
import { MapSkeleton } from "#/entities/map/ui/map-skeleton/MapSkeleton";
import type { SearchAutocompleteItemData } from "#/entities/search";
import { useFavoriteLockerSession } from "#/features/search/hooks/useFavoriteLockerSession";
import {
  LOCKER_DETAIL_QUERY_KEY,
  useLockerDetail,
} from "#/features/search/hooks/useLockerDetail";
import {
  useLockerKeywordSearch,
  usePlaceLockers,
} from "#/features/search/hooks/useSearch";
import { useSearchHistory } from "#/features/search/hooks/useSearchHistory";
import { useVoteLockerSession } from "#/features/search/hooks/useVoteLockerSession";
import {
  applyFavoriteOverlayToLockerDetail,
  applyFavoriteOverlayToLockerItems,
  applyFavoriteOverlayToSearchResultItems,
} from "#/features/search/lib/apply-favorite-overlay";
import { applyVoteOverlayToLockerDetail } from "#/features/search/lib/apply-vote-overlay";
import type { ResolveNavigationOriginResult } from "#/features/search/lib/navigation-platform-links";
import {
  createLockerPinAt,
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
  searchResultItemsToPins,
} from "#/features/search/lib/search-result-pins";
import {
  toLockerSearchFilterParams,
  toPlaceLockersFilterParams,
} from "#/features/search/lib/to-locker-search-filter-params";
import { resolveMapMarkerLayer } from "#/features/search/model/map-marker-layer-policy";
import {
  readMapSheetSessionSnapshot,
  writeMapSheetSessionSnapshot,
} from "#/features/search/model/map-sheet-session-storage";
import {
  getDetailFocusBottomInsetPx,
  getSearchBoundsBottomPadding,
} from "#/features/search/model/map-viewport-policy";
import type { SearchHistoryEntry } from "#/features/search/model/search-history";
import {
  applyLockerSearchDraft,
  createKeywordSearchSelection,
  createPlaceSearchSelection,
  type SearchSelectionState,
} from "#/features/search/model/search-selection";
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
  type SearchDetailBackTarget,
  type SearchListKind,
  type SheetModeForContext,
  shouldFetchKeywordSearch,
  shouldFetchPlaceLockers,
  shouldShowSearchListLoading,
} from "#/features/search/model/sheet-session";
import { toLockerDetailItem } from "#/shared/api/locker-adapters";
import {
  getLockerDetail,
  type LockerBoundsRaw,
  type LockerPinItemResponse,
} from "#/shared/api/lockers";
import { useDeviceOrientation } from "#/shared/hooks/useDeviceOrientation";
import { useLocationPermissionPopup } from "#/shared/hooks/useLocationPermissionPopup";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import { useSearchStore } from "#/shared/store/search";
import {
  locationButton,
  locationControlStack,
  pageWrapper,
  refreshButtonDisabled,
  refreshCooldownBadge,
  refreshIconSpinning,
  refreshLoadingBackdrop,
  refreshLoadingOverlay,
  refreshLoadingSpinner,
} from "./-index.css";
import {
  shouldShowHomeSearchBar,
  shouldShowMapControls,
} from "./-map-control-visibility";

export const DETAIL_FOCUS_ZOOM = 17;
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

export const Route = createFileRoute("/")({
  validateSearch: (
    search: Record<string, unknown> | undefined,
  ): {
    locker?: string;
    openLockerId?: number;
    detailSnap?: LockerDetailSnap;
    focusLat?: number;
    focusLng?: number;
  } => {
    const safeSearch = search || {};
    const parsed = parseOpenLockerDeepLinkSearch(safeSearch);
    const lockerNum = parseLockerSearchParam(safeSearch.locker);
    const locker =
      lockerNum !== undefined ? String(safeSearch.locker).trim() : undefined;
    return {
      ...parsed,
      locker,
    };
  },
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
      } catch (error: any) {
        console.error(
          `Failed to load locker ${lockerId} in root loader:`,
          error,
        );
        return { detail: null };
      }
    }
    return { detail: null };
  },
  head: ({ loaderData }) => {
    const detail = loaderData?.detail;
    if (detail) {
      const name = detail.title || "물품보관함";
      const address = detail.address || "";
      const minPrice = detail.minPrice;

      const priceText =
        minPrice != null
          ? m.seo_locker_detail_price_text({ price: minPrice.toLocaleString() })
          : m.seo_locker_detail_price_unknown();

      return {
        meta: [
          {
            title: m.seo_locker_detail_title({ name }),
          },
          {
            name: "description",
            content: m.seo_locker_detail_description({
              name,
              address,
              priceText,
            }),
          },
          {
            property: "og:title",
            content: m.seo_locker_detail_title({ name }),
          },
          {
            property: "og:description",
            content: m.seo_locker_detail_description({
              name,
              address,
              priceText,
            }),
          },
        ],
      };
    }

    return {
      meta: [
        {
          title: "Zimdugo",
        },
      ],
    };
  },
  component: IndexPage,
});

const readRestoredMapSheetSession = () => readMapSheetSessionSnapshot();

const mergeLockerDetailWithPreviousDistance = (
  detail: LockerDetailItem,
  previousDetail: LockerDetailItem | null,
): LockerDetailItem => {
  if (!previousDetail || previousDetail.lockerId !== detail.lockerId) {
    return detail;
  }

  return {
    ...detail,
    distanceLabel: detail.distanceLabel || previousDetail.distanceLabel,
    distanceMeters: detail.distanceMeters ?? previousDetail.distanceMeters,
  };
};

export function IndexPage() {
  const navigate = useNavigate();
  const search = (useSearch({ strict: false }) || {}) as Record<string, any>;
  const loaderData = Route.useLoaderData();

  const lockerIdFromQuery = parseLockerSearchParam(search.locker);
  const openLockerId = lockerIdFromQuery ?? search.openLockerId;
  const { detailSnap, focusLat, focusLng } = search;
  const handledOpenLockerIdRef = useRef<number | null>(null);
  const pendingDeepLinkFocusPinRef = useRef<LockerPinItemResponse | null>(null);
  const deepLinkMapCenterRef = useRef<{ lat: number; lng: number } | null>(
    null,
  );
  const [mapRemountKey, setMapRemountKey] = useState(0);
  const [lockerDetailOpensFull, setLockerDetailOpensFull] = useState(false);
  const [lockerDetailAnimatesOnMount, setLockerDetailAnimatesOnMount] =
    useState(false);
  const [lockerDetailQueryOrigin, setLockerDetailQueryOrigin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const queryClient = useQueryClient();
  const favoriteSession = useFavoriteLockerSession();
  const voteSession = useVoteLockerSession();
  const flushFavoriteChangesRef = useRef(favoriteSession.flush);
  flushFavoriteChangesRef.current = favoriteSession.flush;
  const flushVoteChangesRef = useRef(voteSession.flush);
  flushVoteChangesRef.current = voteSession.flush;

  const flushInFlightRef = useRef<Promise<void> | null>(null);

  const flushLockerSheetMutations = useCallback(async () => {
    if (flushInFlightRef.current) {
      return flushInFlightRef.current;
    }

    const flushPromise = Promise.allSettled([
      flushFavoriteChangesRef.current(),
      flushVoteChangesRef.current(),
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
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const isCameraCenteredRef = useRef(false);
  const didApplyInitialGpsCenterRef = useRef(false);
  const hasUserMovedMapBeforeInitialGpsRef = useRef(false);
  const lastFocusedLockerIdRef = useRef<number | null>(null);
  const isPendingFocusRef = useRef<boolean>(false);
  const [mapInstance, setMapInstance] = useState<naver.maps.Map | null>(null);
  // 지도 SDK 로딩 상태(NaverMapCanvas에서 끌어올림).
  // 로딩 중에는 실제 컨트롤 대신 같은 위치/계층의 스켈레톤을 보여준다.
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [hasMapError, setHasMapError] = useState(false);
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const locationLoadingTimerRef = useRef<number | undefined>(undefined);
  const pendingLockerDetailOpenTimerRef = useRef<number | undefined>(undefined);
  const hasPendingLocationRequestRef = useRef(false);

  // 리프레시 버튼 타이머 클린업 레퍼런스
  const refreshTimersRef = useRef<{
    spinning?: number;
    visual?: number;
    interval?: number;
  }>({});

  // 내 위치 버튼 지연 로딩 상태 (Hoisting)
  const [isLocationDelayedLoading, setIsLocationDelayedLoading] =
    useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterAppliedState>(
    createDefaultSearchFilters,
  );
  const [sheetMode, setSheetMode] = useState<SheetModeForContext>(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail) return "detail";
    return readRestoredMapSheetSession()?.sheetMode ?? "idle";
  });
  const [activeLockerId, setActiveLockerId] = useState<number | null>(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail)
      return lockerIdFromQuery;
    return readRestoredMapSheetSession()?.activeLockerId ?? null;
  });
  const [selectedLockerDetail, setSelectedLockerDetail] =
    useState<LockerDetailItem | null>(() => {
      if (lockerIdFromQuery !== undefined) {
        return loaderData?.detail ?? null;
      }
      return readRestoredMapSheetSession()?.selectedLockerDetail ?? null;
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
      return readRestoredMapSheetSession()?.selectedMapPin ?? null;
    });
  const [selectedMapPinOffset, setSelectedMapPinOffset] =
    useState<LockerMarkerOffset | null>(null);
  const [context, setContext] = useState<AppMapContext>(() => {
    if (lockerIdFromQuery !== undefined && loaderData?.detail) return "map";
    return readRestoredMapSheetSession()?.context ?? "idle";
  });
  const [overlayReturnContext, setOverlayReturnContext] =
    useState<OverlayReturnContext>("idle");
  const [listKind, setListKind] = useState<SearchListKind | null>(
    () => readRestoredMapSheetSession()?.listKind ?? null,
  );
  const [searchPlaceId, setSearchPlaceId] = useState<number | null>(
    () => readRestoredMapSheetSession()?.searchPlaceId ?? null,
  );
  const [mapPlaceId, setMapPlaceId] = useState<number | null>(
    () => readRestoredMapSheetSession()?.mapPlaceId ?? null,
  );
  const [searchDetailBack, setSearchDetailBack] =
    useState<SearchDetailBackTarget | null>(
      () => readRestoredMapSheetSession()?.searchDetailBack ?? null,
    );
  const [mapDetailBack, setMapDetailBack] = useState<MapDetailBack | null>(
    () => readRestoredMapSheetSession()?.mapDetailBack ?? null,
  );
  const [searchDraft, setSearchDraft] = useState("");
  const {
    entries: searchHistoryEntries,
    record: recordSearchHistory,
    remove: removeSearchHistory,
    clear: clearSearchHistory,
  } = useSearchHistory();
  const [isNavigationPopupOpen, setIsNavigationPopupOpen] = useState(false);
  // onFirstLocation을 useCallback으로 메모이즈
  // → 매 렌더마다 새 함수 레퍼런스가 생성되면 useLocationTracking 내부
  //   useEffect([isTracking, onFirstLocation])이 불필요하게 재실행되어 watchPosition이
  //   재등록되는 무한 루프가 발생함
  // setIsLocationDelayedLoading은 useState dispatch로 stable하므로 deps [] 안전
  const handleFirstLocation = useCallback(() => {
    hasPendingLocationRequestRef.current = false;
    window.clearTimeout(locationLoadingTimerRef.current);
    locationLoadingTimerRef.current = undefined;
    // GPS 응답 시점에 오버레이 해제(애니메이션을 늦추면 사용자 경험 저하)
    setIsLocationDelayedLoading(false);
  }, []);

  // 위치 및 방향 트래킹
  const [isCameraCentered, setIsCameraCentered] = useState(false);
  isCameraCenteredRef.current = isCameraCentered;

  useEffect(() => {
    if (activeLockerId === null) {
      lastFocusedLockerIdRef.current = null;
      isPendingFocusRef.current = false;
    }
  }, [activeLockerId]);

  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { permission, isTracking, isLocating, location, error, startTracking } =
    useLocationTracking({ onFirstLocation: handleFirstLocation });
  const shouldPreferHomeLocation =
    lockerIdFromQuery === undefined && focusLat == null && focusLng == null;
  const shouldDeferHomeMapForLocation =
    shouldPreferHomeLocation &&
    permission !== "denied" &&
    location == null &&
    error == null;

  useEffect(() => {
    if (
      !shouldPreferHomeLocation ||
      location != null ||
      permission === "denied" ||
      isTracking ||
      isLocating ||
      error != null
    ) {
      return;
    }

    hasPendingLocationRequestRef.current = true;
    startTracking();
  }, [
    error,
    isLocating,
    isTracking,
    location,
    permission,
    shouldPreferHomeLocation,
    startTracking,
  ]);

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
    requestPermission: requestOrientationPermission,
    startTracking: startOrientationTracking,
    stopTracking: stopOrientationTracking,
  } = useDeviceOrientation();
  const {
    isOpen: isLocationPopupOpen,
    openPopup: openLocationPopup,
    closePopup: closeLocationPopup,
  } = useLocationPermissionPopup();

  // 위치 권한 거부 시 지연 로딩 오버레이 해제 및 타이머 정리
  useEffect(() => {
    if (permission === "denied") {
      window.clearTimeout(locationLoadingTimerRef.current);
      locationLoadingTimerRef.current = undefined;
      setIsLocationDelayedLoading(false);
      setIsCameraCentered(false);

      if (hasPendingLocationRequestRef.current) {
        hasPendingLocationRequestRef.current = false;
        openLocationPopup();
      }
    }
  }, [permission, openLocationPopup]);

  // 리프레시 버튼 관련 상태
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCooldownRemaining, setRefreshCooldownRemaining] = useState(0);
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);
  const [isRefreshVisualLoading, setIsRefreshVisualLoading] = useState(false);

  const handleRefreshMap = useCallback(() => {
    if (!mapInstanceRef.current || isRefreshing) return;

    useMapViewportStore.getState().saveFromMap(mapInstanceRef.current);

    setIsRefreshing(true);
    setRefreshCooldownRemaining(5);
    setIsRefreshSpinning(true);
    setIsRefreshVisualLoading(true);

    refreshTimersRef.current.spinning = window.setTimeout(
      () => setIsRefreshSpinning(false),
      500,
    );
    refreshTimersRef.current.visual = window.setTimeout(
      () => setIsRefreshVisualLoading(false),
      900,
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
      window.clearTimeout(refreshTimersRef.current.visual);
      window.clearInterval(refreshTimersRef.current.interval);
      window.clearTimeout(locationLoadingTimerRef.current);
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
    if (permission === "denied") {
      hasPendingLocationRequestRef.current = false;
      openLocationPopup();
      return;
    }

    if (!isCameraCentered) {
      // 상태 1: 카메라 중앙 고정 ON (만약 GPS가 안 켜져있다면 켜기)
      if (!isTracking) {
        hasPendingLocationRequestRef.current = true;
        window.clearTimeout(locationLoadingTimerRef.current);
        locationLoadingTimerRef.current = window.setTimeout(() => {
          setIsLocationDelayedLoading(true);
        }, 300);
        startTracking();
      } else if (location && mapInstanceRef.current) {
        focusNaverMapOnCoordinates({
          map: mapInstanceRef.current,
          coordinates: location,
        });
      }
      setIsCameraCentered(true);
    } else if (isCameraCentered && !isOrientationTracking) {
      // 상태 2: 나침반 모드 ON
      const granted = await requestOrientationPermission();
      if (granted) {
        startOrientationTracking();
      }
    } else {
      // 상태 0으로 복귀: 카메라 중앙 고정 OFF, 나침반 OFF (GPS는 계속 켜둠)
      setIsCameraCentered(false);
      stopOrientationTracking();
    }
  }, [
    permission,
    isCameraCentered,
    isTracking,
    location,
    isOrientationTracking,
    openLocationPopup,
    requestOrientationPermission,
    startTracking,
    startOrientationTracking,
    stopOrientationTracking,
  ]);

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
    setMapPlaceId(null);
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setSelectedMapPinOffset(null);
    setMapDetailBack(null);
    setSearchFilters(createDefaultSearchFilters());
    setIsNavigationPopupOpen(false);
    setSheetMode("idle");
    setContext("idle");
    writeMapSheetSessionSnapshot(null);
  }, [clearPendingLockerDetailOpen, flushLockerSheetMutations]);

  const resetSearchContext = useCallback(() => {
    clearPendingLockerDetailOpen();
    void flushLockerSheetMutations();
    setSearchQuery("");
    setSearchDraft("");
    setSearchFilters(createDefaultSearchFilters());
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
    setIsSearchOpen,
    setSearchQuery,
  ]);

  const handleOpenSearch = useCallback(() => {
    clearPendingLockerDetailOpen();
    const returnContext = resolveOverlayReturnContext(context);

    if (context === "map") {
      resetMapContext();
    }

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
    if (location) {
      return { lat: location.lat, lng: location.lng };
    }

    if (mapInstance) {
      const center = mapInstance.getCenter();
      return { lat: center.lat(), lng: center.lng() };
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
    searchQuery,
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

    const keyword = getValidatedSearchQuery(searchQuery);
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
    searchQuery,
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
  } = useLockerKeywordSearch(keywordSearchParams);

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

    if (lockerIdFromQuery !== undefined && loaderData?.detail) {
      return {
        lockerId: activeLockerId,
        lat: loaderData.detail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
        lng: loaderData.detail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
      };
    }

    const origin = lockerDetailQueryOrigin ?? searchCoordinates;

    return {
      lockerId: activeLockerId,
      lat: origin.lat ?? DEFAULT_SEARCH_COORDINATES.lat,
      lng: origin.lng ?? DEFAULT_SEARCH_COORDINATES.lng,
    };
  }, [
    activeLockerId,
    lockerDetailQueryOrigin,
    searchCoordinates,
    lockerIdFromQuery,
    loaderData,
  ]);

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

  const mapPlacePins = useMemo(() => {
    if (activePlaceId == null) return [];
    return lastValidPlaceLockersRef.current?.placeId === activePlaceId
      ? lastValidPlaceLockersRef.current.pins
      : [];
  }, [activePlaceId, placeLockersResults]);

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
      setSearchQuery(selection.searchQuery);
    },
    [setSearchQuery],
  );

  const openLockerDetailById = useCallback(
    (
      lockerId: number,
      optimisticDetail?: LockerDetailItem,
      options?: { detailSnap?: LockerDetailSnap; animateOnMount?: boolean },
    ) => {
      clearPendingLockerDetailOpen();
      handledOpenLockerIdRef.current = lockerId;
      void flushLockerSheetMutations();

      // URL에 보관함 상세 주소를 연동합니다 (쿼리 파라미터 슬러그 반영).
      const cleanName = optimisticDetail?.title
        ? optimisticDetail.title
            .replace(/[^\p{L}\p{N}\s-]/gu, "")
            .replace(/\s+/g, "-")
        : "";
      const lockerSlug = cleanName
        ? `${lockerId}-${cleanName}`
        : String(lockerId);

      if (String(search.locker ?? "") !== lockerSlug) {
        navigate({
          to: ".",
          search: (prev: any) => ({
            ...prev,
            locker: lockerSlug,
          }),
        }).catch((err) => console.error("navigate ERROR:", err));
      }

      // 상태 변경 및 UI 언마운트를 다음 이벤트 루프로 연기하여 클릭 액션 소실 방지
      setTimeout(() => {
        setSelectedLockerDetail(
          optimisticDetail ?? createLockerDetailPlaceholder(lockerId),
        );
        setActiveLockerId(lockerId);
        setIsNavigationPopupOpen(false);
        setIsSearchOpen(false);
        setLockerDetailOpensFull(options?.detailSnap === "full");
        setLockerDetailAnimatesOnMount(options?.animateOnMount === true);
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
      setSheetMode,
      search.locker,
      navigate,
    ],
  );

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
        applySearchSelection(
          createPlaceSearchSelection(
            options.draft ?? searchDraft,
            options.placeName,
          ),
        );
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
      applySearchSelection,
      clearPendingLockerDetailOpen,
      searchDraft,
      setIsSearchOpen,
      setSheetMode,
    ],
  );

  const openMapPlaceList = useCallback(
    (placeId: number) => {
      clearPendingLockerDetailOpen();
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
    [clearPendingLockerDetailOpen, setIsSearchOpen, setSheetMode],
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
      setSheetMode,
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
        setSearchQuery(lockerSearchSelection.searchQuery);
        setSearchDetailBack(createKeywordDetailBackTarget());
        openLockerDetailById(
          item.lockerId,
          createLockerDetailFromAutocompleteItem(item),
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
      setSearchQuery,
    ],
  );

  const handleSelectSearchHistory = useCallback(
    (entry: SearchHistoryEntry) => {
      if (entry.kind === "keyword") {
        handleSelectSearch(entry.query);
        return;
      }

      if (entry.kind === "locker") {
        recordSearchHistory({
          kind: "locker",
          lockerId: entry.lockerId,
          title: entry.title,
          searchDraft: entry.searchDraft,
        });
        setContext("search");
        setListKind("keyword");
        setSearchPlaceId(null);
        const lockerSearchSelection = applyLockerSearchDraft(entry.searchDraft);
        setSearchDraft(lockerSearchSelection.searchDraft);
        setSearchQuery(lockerSearchSelection.searchQuery);
        setSearchDetailBack(createKeywordDetailBackTarget());
        openLockerDetailById(
          entry.lockerId,
          createLockerDetailFromHistoryEntry(entry),
        );
        void queryClient.invalidateQueries({
          queryKey: [LOCKER_DETAIL_QUERY_KEY, entry.lockerId],
        });
        return;
      }

      recordSearchHistory({
        kind: "place",
        placeId: entry.placeId,
        title: entry.title,
        searchDraft: entry.searchDraft,
      });
      openSearchPlaceList(entry.placeId, {
        applySelection: true,
        draft: entry.searchDraft,
        placeName: entry.title,
      });
    },
    [
      handleSelectSearch,
      openLockerDetailById,
      openSearchPlaceList,
      queryClient,
      recordSearchHistory,
      setSearchQuery,
    ],
  );

  const handleOpenLockerDetail = useCallback(
    (item: SearchLockerResultItem) => {
      if (context === "map") {
        setMapDetailBack("placeList");
      } else if (context === "search") {
        setSearchDetailBack(
          listKind === "place" && searchPlaceId != null
            ? createPlaceDetailBackTarget(searchPlaceId)
            : createKeywordDetailBackTarget(),
        );
      }

      openLockerDetailById(
        item.lockerId,
        createLockerDetailFromSearchItem(item),
      );
    },
    [context, listKind, openLockerDetailById, searchPlaceId],
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

  const openLockerDetailAfterPinFocus = useCallback(
    (
      lockerId: number,
      detail: LockerDetailItem | undefined,
      shouldDelay: boolean,
    ) => {
      clearPendingLockerDetailOpen();

      if (!shouldDelay) {
        openLockerDetailById(lockerId, detail, { animateOnMount: true });
        return;
      }

      pendingLockerDetailOpenTimerRef.current = window.setTimeout(() => {
        pendingLockerDetailOpenTimerRef.current = undefined;
        openLockerDetailById(lockerId, detail, { animateOnMount: true });
      }, DETAIL_SHEET_OPEN_AFTER_MORPH_DELAY_MS);
    },
    [clearPendingLockerDetailOpen, openLockerDetailById],
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

      if (pin) {
        deepLinkMapCenterRef.current = {
          lat: pin.latitude,
          lng: pin.longitude,
        };
        setContext("map");
        setMapDetailBack("idle");
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
          search: (prev: any) => {
            const {
              openLockerId: _,
              detailSnap: __,
              focusLat: ___,
              focusLng: ____,
              ...rest
            } = prev;
            if (!rest.locker) {
              rest.locker = String(openLockerId);
            }
            return rest as any;
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
          search: (prev: any) => {
            const {
              openLockerId: _,
              detailSnap: __,
              focusLat: ___,
              focusLng: ____,
              ...rest
            } = prev;
            return rest as any;
          },
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
      if (context !== "idle") {
        return;
      }

      if (pinType === "PLACE") {
        setSelectedMapPin(null);
        setSelectedMapPinOffset(null);
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        openMapPlaceList(id);
        return;
      }

      setSelectedMapPin(pin ?? null);
      setSelectedMapPinOffset(offset ?? null);
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
      context,
      focusMapOnLockerPin,
      openLockerDetailAfterPinFocus,
      openMapPlaceList,
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

      if (pinType === "PLACE") {
        setSelectedMapPinOffset(null);
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        openMapPlaceList(id);
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
      context,
      focusMapOnLockerPin,
      openLockerDetailAfterPinFocus,
      openMapPlaceList,
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

      if (pinType === "PLACE") {
        setListKind("place");
        setSearchPlaceId(id);
        setActiveLockerId(null);
        setSearchDetailBack(null);
        setSelectedLockerDetail(null);
        setSelectedMapPin(null);
        setSelectedMapPinOffset(null);
        setSheetMode("list");
        focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
        return;
      }

      setSearchDetailBack(
        createSearchDetailBackTarget({
          listKind: listKind ?? "keyword",
          placeId: listKind === "place" ? searchPlaceId : null,
        }),
      );
      const detail =
        pin?.pinType === "LOCKER" ? createLockerDetailFromPin(pin) : undefined;
      setSelectedMapPinOffset(offset ?? null);
      const shouldDelayDetailOpen =
        pin != null &&
        mapInstanceRef.current != null &&
        (mapInstanceRef.current.getZoom?.() ?? DETAIL_FOCUS_ZOOM) <
          DETAIL_FOCUS_ZOOM;
      focusMapOnLockerPin(pin, DETAIL_FOCUS_ZOOM);
      openLockerDetailAfterPinFocus(id, detail, shouldDelayDetailOpen);
    },
    [
      context,
      focusMapOnLockerPin,
      listKind,
      openLockerDetailAfterPinFocus,
      searchPlaceId,
      setSheetMode,
    ],
  );

  const handleOpenNavigationPopup = useCallback(() => {
    setIsNavigationPopupOpen(true);
  }, []);

  const navigationKnownLocation = useMemo(
    () => (permission === "granted" && location ? location : null),
    [permission, location],
  );

  const handleNavigationOriginResolved = useCallback(
    (result: ResolveNavigationOriginResult) => {
      if (result.usedCurrentLocation) {
        startTracking();
      }
    },
    [startTracking],
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
            search: (prev: any) => {
              const { locker, ...rest } = prev;
              return rest as any;
            },
          });
        }
        return;
      }

      setSheetMode("list");
      if (search.locker) {
        void navigate({
          to: ".",
          search: (prev: any) => {
            const { locker, ...rest } = prev;
            return rest as any;
          },
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
        search: (prev: any) => {
          const { locker, ...rest } = prev;
          return rest as any;
        },
      });
    }
  }, [
    context,
    flushLockerSheetMutations,
    mapDetailBack,
    resetMapContext,
    searchDetailBack,
    setListKind,
    setSearchPlaceId,
    setSheetMode,
    search.locker,
    navigate,
  ]);

  const handleBackFromMapPlaceSheet = useCallback(() => {
    resetMapContext();
  }, [resetMapContext]);

  const handleBackToKeywordList = useCallback(() => {
    void flushLockerSheetMutations();
    if (getSearchQueryIssue(searchDraft) === null) {
      setSearchQuery(trimSearchQueryDraft(searchDraft));
    }
    setListKind("keyword");
    setSearchPlaceId(null);
    setSheetMode("list");
  }, [flushLockerSheetMutations, searchDraft]);

  const handleOpenSearchFilter = useCallback(() => {
    setSheetMode("filter");
  }, [setSheetMode]);

  const handleResetSearchFilter = useCallback(() => {
    setSearchFilters(createDefaultSearchFilters());
  }, []);

  const handleApplySearchFilter = useCallback(
    (filters: SearchFilterAppliedState) => {
      setSearchFilters(filters);
      setSheetMode("list");
    },
    [setSheetMode],
  );

  useEffect(() => {
    if (!lockerDetail) {
      return;
    }

    setSelectedLockerDetail((previousDetail) =>
      mergeLockerDetailWithPreviousDistance(lockerDetail, previousDetail),
    );

    // API 응답을 받아 보관함 이름이 확보되면 URL을 슬러그 형태로 정규화하여 업데이트함
    const cleanName = lockerDetail.title
      ? lockerDetail.title
          .replace(/[^\p{L}\p{N}\s-]/gu, "")
          .replace(/\s+/g, "-")
      : "";
    const lockerSlug = cleanName
      ? `${lockerDetail.lockerId}-${cleanName}`
      : String(lockerDetail.lockerId);

    if (String(search.locker ?? "") !== lockerSlug) {
      void navigate({
        to: ".",
        search: (prev: any) => ({
          ...prev,
          locker: lockerSlug,
        }),
        replace: true,
      });
    }

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
  }, [lockerDetail, mapInstance, search.locker, navigate]);

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

  // 카메라고정(트래킹) 중일 때 위치가 갱신되면 지도 중심 이동
  useEffect(() => {
    if (isCameraCentered && location && mapInstance) {
      focusNaverMapOnCoordinates({ map: mapInstance, coordinates: location });
    }
  }, [isCameraCentered, location, mapInstance]);

  // 지도 드래그 시 카메라 고정 해제 및 나침반 해제 (GPS는 유지)
  useEffect(() => {
    const maps = typeof window !== "undefined" ? window.naver?.maps : null;

    if (!mapInstance || !maps?.Event) return;

    const listener = maps.Event.addListener(mapInstance, "dragstart", () => {
      hasUserMovedMapBeforeInitialGpsRef.current = true;
      setIsCameraCentered(false);
      stopOrientationTracking();
      isPendingFocusRef.current = false;
      mapInstance.setCenter(mapInstance.getCenter());
    });

    return () => {
      maps.Event.removeListener(listener);
    };
  }, [mapInstance, stopOrientationTracking]);

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
  const isSearchFilterActive =
    searchFilters.regionActive ||
    searchFilters.sizeActive ||
    searchFilters.placeTypeActive;
  const isPlaceListScope = activePlaceId != null;
  const searchBottomSheetItems = isPlaceListScope
    ? (placeLockersResults?.lockers ?? [])
    : (keywordSearchResults?.items ?? []);

  useEffect(() => {
    favoriteSession.syncBaselineFromSearchData(searchBottomSheetItems);
  }, [favoriteSession.syncBaselineFromSearchData, searchBottomSheetItems]);

  useEffect(() => {
    favoriteSession.syncBaselineFromLockerDetail(lockerDetail);
  }, [favoriteSession.syncBaselineFromLockerDetail, lockerDetail]);

  useEffect(() => {
    voteSession.syncBaselineFromLockerDetail(lockerDetail);
  }, [voteSession.syncBaselineFromLockerDetail, lockerDetail]);

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
    if (!selectedLockerDetail) {
      return null;
    }

    const withFavorite = applyFavoriteOverlayToLockerDetail(
      selectedLockerDetail,
      favoriteSession.getEffectiveIsFavorite,
    );

    return applyVoteOverlayToLockerDetail(
      withFavorite,
      voteSession.getEffectiveVoteFlagOverlay,
      voteSession.getEffectiveVoteCountOverlay,
    );
  }, [
    favoriteSession.getEffectiveIsFavorite,
    selectedLockerDetail,
    voteSession.getEffectiveVoteFlagOverlay,
    voteSession.getEffectiveVoteCountOverlay,
  ]);

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
      return [selectedMapPin];
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
        isFavorite: null,
        lockerCount: null,
        pinCount: null,
        bounds: null,
      },
    ];
  }, [context, selectedLockerDetail, selectedMapPin, sheetMode]);
  const markerLayer = resolveMapMarkerLayer({
    context,
    sheetMode,
    isSearchOpen,
    searchDetailBack,
    mapDetailBack,
    selectedMapDetailPinCount: selectedMapDetailPins.length,
  });
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
  const selectedPinPreservedOffsets = useMemo(() => {
    if (!selectedPinId || !selectedMapPinOffset) {
      return undefined;
    }

    return new Map([[selectedPinId, selectedMapPinOffset]]);
  }, [selectedPinId, selectedMapPinOffset]);
  const showPlaceSheetBack =
    context === "map" || (context === "search" && listKind === "place");
  const listHeaderLeadingPress = showPlaceSheetBack
    ? context === "map"
      ? handleBackFromMapPlaceSheet
      : handleBackToKeywordList
    : undefined;
  const handleClusterClick = useCallback(
    (bounds: LockerBoundsRaw) => {
      focusNaverMapOnClusterBounds({
        map: mapInstance,
        bounds,
      });
    },
    [mapInstance],
  );

  return (
    <main className={pageWrapper}>
      {shouldRenderHomeSearchBar ? (
        <HomeSearchBar
          onOpenSearch={handleOpenSearch}
          onCloseSearchContext={handleExitSearchContext}
          searchQuery={searchQuery}
          isSearchContextActive={context === "search"}
        />
      ) : null}

      {(isRefreshVisualLoading || isLocationDelayedLoading) && (
        <div className={refreshLoadingOverlay}>
          <div className={refreshLoadingBackdrop} />
          <div className={refreshLoadingSpinner} />
        </div>
      )}

      <NaverMapProvider language={languageTag()}>
        {shouldDeferHomeMapForLocation ? (
          <MapSkeleton />
        ) : (
          <NaverMapCanvas
            key={mapRemountKey}
            onLoad={handleMapLoad}
            onWillDestroy={persistMapViewport}
            onLoadingChange={setIsMapLoading}
            onErrorChange={setHasMapError}
            initialCenter={mapBootstrap.center}
            initialZoom={mapBootstrap.zoom}
          />
        )}
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
            onSelectPin={handleIdlePinSelect}
            onClusterClick={handleClusterClick}
          />
        )}
        {!isMapLoading &&
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
                    : handleIdlePinSelect
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
      {isMapLoading && !hasMapError ? (
        <MapControlsSkeleton />
      ) : shouldRenderMapControls ? (
        <div className={locationControlStack}>
          <button
            type="button"
            className={[
              locationButton,
              isRefreshing || !mapInstance ? refreshButtonDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleRefreshMap}
            aria-label={m.home_map_refresh_aria()}
            disabled={isRefreshing || !mapInstance}
          >
            <IconCircleboxRefresh48
              state={isRefreshing || !mapInstance ? "refresh" : "refreshActive"}
              className={isRefreshSpinning ? refreshIconSpinning : ""}
            />
            {isRefreshing &&
              !isRefreshSpinning &&
              refreshCooldownRemaining > 0 && (
                <div className={refreshCooldownBadge}>
                  {refreshCooldownRemaining}
                </div>
              )}
          </button>
          <button
            type="button"
            className={locationButton}
            onClick={handleMyLocation}
            aria-label={m.home_my_location_aria()}
          >
            <IconCircleboxCrosshair48
              state={
                permission === "denied"
                  ? "denied"
                  : isCameraCentered
                    ? "active"
                    : "default"
              }
            />
          </button>
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

      {!isMapLoading && sheetMode === "list" && !isSearchOpen ? (
        <SearchListBottomSheet
          searchQuery={searchQuery}
          items={searchBottomSheetDisplayItems}
          placeName={activePlaceName}
          appLanguage={normalizeLocale(languageTag()) ?? BASE_LOCALE}
          isFilterActive={isSearchFilterActive}
          isLoading={isSearchListLoading}
          isError={isSearchListError}
          onRetry={() => void refetchSearchList()}
          onOpenFilter={handleOpenSearchFilter}
          onLockerPress={handleOpenLockerDetail}
          onFavoriteChange={favoriteSession.handleSearchFavoriteChange}
          showHeaderBack={showPlaceSheetBack}
          onHeaderBackPress={listHeaderLeadingPress}
          onDismiss={listHeaderLeadingPress}
        />
      ) : null}

      {!isMapLoading &&
      sheetMode === "detail" &&
      !isSearchOpen &&
      displayedLockerDetail ? (
        <LockerDetailBottomSheet
          locker={displayedLockerDetail}
          loadState={lockerDetailLoadState}
          onRetry={() => void refetchLockerDetail()}
          onFavoriteChange={favoriteSession.handleDetailFavoriteChange}
          onVoteChange={voteSession.handleDetailVoteChange}
          onBack={handleBackFromDetail}
          onNavigate={handleOpenNavigationPopup}
          initialSnapPoint={lockerDetailOpensFull ? 44 : undefined}
          animateOnMount={lockerDetailAnimatesOnMount}
        />
      ) : null}

      <NavigationPlatformPopup
        isOpen={isNavigationPopupOpen}
        locker={displayedLockerDetail}
        knownLocation={navigationKnownLocation}
        onOriginResolved={handleNavigationOriginResolved}
        onOpenChange={handleNavigationPopupOpenChange}
      />

      {!isMapLoading && sheetMode === "filter" && !isSearchOpen ? (
        <SearchFilterBottomSheet
          initialFilters={searchFilters}
          onCollapseToResults={() => setSheetMode("list")}
          onReset={handleResetSearchFilter}
          onApply={handleApplySearchFilter}
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
    </main>
  );
}

function LockerMarkersLayer({
  map,
  selectedPinId,
  onSelectPin,
  onClusterClick,
  spreadCenter,
}: {
  map: naver.maps.Map | null;
  selectedPinId?: string | null;
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
    selectedPinId,
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
