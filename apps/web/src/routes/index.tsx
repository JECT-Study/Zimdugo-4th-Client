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
  LOCKER_DETAIL_FULL_TOP_OFFSET,
  LockerDetailBottomSheet,
  type LockerDetailItem,
  type LockerDetailLoadState,
  type LockerDetailSheetSnapRequest,
  type LockerDetailSheetSnapStage,
} from "#/composites/search/LockerDetailBottomSheet";
import { NavigationPlatformPopup } from "#/composites/search/NavigationPlatformPopup";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
  SearchFilterBottomSheet,
} from "#/composites/search/SearchFilterBottomSheet";
import {
  SearchListBottomSheet,
  type SearchListSheetSnapRequest,
  type SearchListSheetSnapStage,
} from "#/composites/search/SearchListBottomSheet";
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
  useLockerSearch,
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
  readSearchFilterParams,
  readSearchPlaceIdParam,
  readSearchQueryParam,
  type SearchUrlParams,
  withLockerDetailParam,
  withoutSearchContextParams,
  withSearchFilterParams,
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
import { toLockerDetailItem } from "#/shared/api/locker-adapters";
import type { LockerPinSearchParams } from "#/shared/api/lockers";
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
  shareCopyToast,
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
    q?: string;
    searchPlaceId?: number;
    filterSizes?: string;
    filterIndoorOutdoor?: string;
    filterPlaceTypes?: string;
  } => {
    const safeSearch = search || {};
    const parsed = parseOpenLockerDeepLinkSearch(safeSearch);
    const lockerNum = parseLockerSearchParam(safeSearch.locker);
    const locker =
      lockerNum !== undefined ? String(safeSearch.locker).trim() : undefined;
    const q = readSearchQueryParam(safeSearch.q);
    const searchPlaceId = readSearchPlaceIdParam(safeSearch.searchPlaceId);
    const filterParams = withSearchFilterParams(
      {},
      readSearchFilterParams(safeSearch),
    );
    return {
      ...parsed,
      locker,
      q,
      searchPlaceId,
      ...filterParams,
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

export function IndexPage() {
  const navigate = useNavigate();
  const search = (useSearch({ strict: false }) || {}) as Record<string, any>;
  const loaderData = Route.useLoaderData();

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
  const {
    filterIndoorOutdoor: filterIndoorOutdoorFromUrl,
    filterPlaceTypes: filterPlaceTypesFromUrl,
    filterSizes: filterSizesFromUrl,
  } = search;
  const searchFiltersFromUrl = useMemo(
    () =>
      readSearchFilterParams({
        filterIndoorOutdoor: filterIndoorOutdoorFromUrl,
        filterPlaceTypes: filterPlaceTypesFromUrl,
        filterSizes: filterSizesFromUrl,
      }),
    [filterIndoorOutdoorFromUrl, filterPlaceTypesFromUrl, filterSizesFromUrl],
  );
  const hasSearchPlaceEntry =
    searchPlaceIdFromUrl !== undefined && !hasExplicitLockerEntry;
  const hasSearchQueryEntry =
    (searchQueryFromUrl !== undefined || hasSearchPlaceEntry) &&
    !hasExplicitLockerEntry;
  const handledOpenLockerIdRef = useRef<number | null>(null);
  const pendingDeepLinkFocusPinRef = useRef<LockerPinItemResponse | null>(null);
  const deepLinkMapCenterRef = useRef<{ lat: number; lng: number } | null>(
    null,
  );
  const [mapRemountKey, setMapRemountKey] = useState(0);
  const [lockerDetailOpensFull, setLockerDetailOpensFull] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (shareCopiedTimerRef.current !== null) {
        clearTimeout(shareCopiedTimerRef.current);
      }
    };
  }, []);
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
  const syncSearchFilterUrl = useCallback(
    (
      filters: SearchFilterAppliedState,
      options: { replace?: boolean } = {},
    ) => {
      void navigate({
        to: ".",
        search: (prev: SearchUrlParams) =>
          withSearchFilterParams(prev, filters),
        replace: options.replace,
      });
    },
    [navigate],
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
  const shouldIgnoreNextMapPressRef = useRef(false);
  const mapPressSuppressionTimerRef = useRef<number | undefined>(undefined);

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
    () => searchFiltersFromUrl,
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
  const [listSheetSnapRequest, setListSheetSnapRequest] =
    useState<SearchListSheetSnapRequest | null>(null);
  const [detailSheetSnapStage, setDetailSheetSnapStage] =
    useState<LockerDetailSheetSnapStage>("half");
  const [detailSheetSnapRequest, setDetailSheetSnapRequest] =
    useState<LockerDetailSheetSnapRequest | null>(null);
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawSearchQueryFromUrl =
      new URLSearchParams(window.location.search).get("q") ?? undefined;
    const rawSearchPlaceIdFromUrl =
      new URLSearchParams(window.location.search).get("searchPlaceId") ??
      undefined;
    const normalizedSearchPlaceIdFromUrl =
      searchPlaceIdFromUrl !== undefined
        ? String(searchPlaceIdFromUrl)
        : undefined;
    const urlSearchParams = new URLSearchParams(window.location.search);
    const rawFilterSizes = urlSearchParams.get("filterSizes") ?? undefined;
    const rawFilterIndoorOutdoor =
      urlSearchParams.get("filterIndoorOutdoor") ?? undefined;
    const rawFilterPlaceTypes =
      urlSearchParams.get("filterPlaceTypes") ?? undefined;
    const normalizedFilterParams = withSearchFilterParams(
      {},
      searchFiltersFromUrl,
    );

    if (
      (rawSearchQueryFromUrl !== undefined &&
        rawSearchQueryFromUrl !== searchQueryFromUrl) ||
      (rawSearchPlaceIdFromUrl !== undefined &&
        rawSearchPlaceIdFromUrl !== normalizedSearchPlaceIdFromUrl) ||
      rawFilterSizes !== normalizedFilterParams.filterSizes ||
      rawFilterIndoorOutdoor !== normalizedFilterParams.filterIndoorOutdoor ||
      rawFilterPlaceTypes !== normalizedFilterParams.filterPlaceTypes
    ) {
      void navigate({
        to: ".",
        search: (prev: SearchUrlParams) =>
          withSearchFilterParams(
            withSearchPlaceIdParam(
              withSearchQueryParam(prev, searchQueryFromUrl),
              searchPlaceIdFromUrl,
            ),
            searchFiltersFromUrl,
          ),
        replace: true,
      });
    }
  }, [
    navigate,
    searchFiltersFromUrl,
    searchPlaceIdFromUrl,
    searchQueryFromUrl,
  ]);

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
    setSearchFilters(searchFiltersFromUrl);
  }, [searchFiltersFromUrl]);
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
    void navigate({
      to: ".",
      search: (prev: SearchUrlParams) => {
        const next = withSearchFilterParams(
          withoutSearchContextParams(prev),
          createDefaultSearchFilters(),
        );
        delete next.locker;
        delete next.openLockerId;
        delete next.detailSnap;
        delete next.focusLat;
        delete next.focusLng;
        delete next.searchPlaceId;
        return next;
      },
    });
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

    if (lockerIdFromQuery !== undefined && loaderData?.detail) {
      return {
        lockerId: activeLockerId,
        lat: loaderData.detail.latitude ?? DEFAULT_SEARCH_COORDINATES.lat,
        lng: loaderData.detail.longitude ?? DEFAULT_SEARCH_COORDINATES.lng,
      };
    }

    const origin = lockerDetailQueryOrigin ?? DEFAULT_SEARCH_COORDINATES;

    return {
      lockerId: activeLockerId,
      lat: origin.lat ?? DEFAULT_SEARCH_COORDINATES.lat,
      lng: origin.lng ?? DEFAULT_SEARCH_COORDINATES.lng,
    };
  }, [activeLockerId, lockerDetailQueryOrigin, lockerIdFromQuery, loaderData]);

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
      setSheetMode,
      syncLockerDetailUrl,
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

  const requestListSheetSnap = useCallback(
    (stage: SearchListSheetSnapStage) => {
      setListSheetSnapRequest((previousRequest) => ({
        id: (previousRequest?.id ?? 0) + 1,
        stage,
      }));
    },
    [],
  );

  const requestDetailSheetSnap = useCallback(
    (stage: LockerDetailSheetSnapStage) => {
      setDetailSheetSnapRequest((previousRequest) => ({
        id: (previousRequest?.id ?? 0) + 1,
        stage,
      }));
    },
    [],
  );

  const handleListSheetSnapStageChange = useCallback(
    (nextStage: SearchListSheetSnapStage) => {
      setListSheetSnapStage(nextStage);
    },
    [],
  );

  const handleDetailSheetSnapStageChange = useCallback(
    (nextStage: LockerDetailSheetSnapStage) => {
      setDetailSheetSnapStage(nextStage);
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
      setSheetMode,
      shouldRaiseSelectedPinFromMini,
      suppressNextMapPressForMarkerInteraction,
    ],
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
    const shareData = {
      title: item.title,
      text: createLockerShareText({
        locale: shareLocale,
        url: shareUrl,
        title: item.title,
        address: item.address,
      }),
    };

    const copyShareText = () => {
      if (!navigator.clipboard) {
        console.error(
          "Failed to copy locker detail URL: Clipboard API is not supported",
        );
        return;
      }

      void navigator.clipboard.writeText(shareData.text).then(() => {
        if (shareCopiedTimerRef.current !== null) {
          clearTimeout(shareCopiedTimerRef.current);
        }
        setShareCopied(true);
        shareCopiedTimerRef.current = setTimeout(() => {
          setShareCopied(false);
          shareCopiedTimerRef.current = null;
        }, 2000);
      }).catch((error) => {
        console.error("Failed to copy locker detail URL:", error);
      });
    };

    if (typeof navigator.share === "function") {
      void navigator.share(shareData).catch((error) => {
        if (error?.name === "AbortError") {
          return;
        }

        console.error("Failed to share locker detail:", error);
        copyShareText();
      });
      return;
    }

    copyShareText();
  }, [setShareCopied]);

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
  }, [setSheetMode]);

  const handleResetSearchFilter = useCallback(() => {
    const defaultFilters = createDefaultSearchFilters();
    setSearchFilters(defaultFilters);
    syncSearchFilterUrl(defaultFilters);
  }, [syncSearchFilterUrl]);

  const handleApplySearchFilter = useCallback(
    (filters: SearchFilterAppliedState) => {
      setSearchFilters(filters);
      syncSearchFilterUrl(filters);
      setSheetMode("list");
    },
    [setSheetMode, syncSearchFilterUrl],
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

  // 카메라고정(트래킹) 중일 때 위치가 갱신되면 지도 중심 이동
  useEffect(() => {
    if (isCameraCentered && location && mapInstance) {
      focusNaverMapOnCoordinates({ map: mapInstance, coordinates: location });
    }
  }, [isCameraCentered, location, mapInstance]);

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

    return applyVoteOverlayToLockerDetail(
      withFavorite,
      voteSession.getEffectiveVoteFlagOverlay,
      voteSession.getEffectiveVoteCountOverlay,
    );
  }, [
    favoriteSession.getEffectiveIsFavorite,
    lockerDetail,
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
  useEffect(() => {
    if (sheetMode === "list") {
      setListSheetSnapStage("half");
      setListSheetSnapRequest(null);
    }
  }, [searchListSheetKey, sheetMode]);

  useEffect(() => {
    if (sheetMode === "detail") {
      setDetailSheetSnapStage(lockerDetailOpensFull ? "full" : "half");
      setDetailSheetSnapRequest(null);
    }
  }, [activeLockerId, lockerDetailOpensFull, sheetMode]);

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

  // 지도 드래그 시 카메라 고정 해제 및 나침반 해제 (GPS는 유지), 바텀시트 snap 다운
  useEffect(() => {
    const maps = typeof window !== "undefined" ? window.naver?.maps : null;

    if (!mapInstance || !maps?.Event) return;

    const listener = maps.Event.addListener(mapInstance, "dragstart", () => {
      hasUserMovedMapBeforeInitialGpsRef.current = true;
      setIsCameraCentered(false);
      stopOrientationTracking();
      isPendingFocusRef.current = false;
      mapInstance.setCenter(mapInstance.getCenter());
      handleMapPressRef.current();
    });

    return () => {
      maps.Event.removeListener(listener);
    };
  }, [mapInstance, stopOrientationTracking]);
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
            onMapPress={handleMapPress}
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
          onFavoriteChange={favoriteSession.handleSearchFavoriteChange}
          animateOnMount
          onDismiss={listSheetDismissPress}
          snapRequest={listSheetSnapRequest}
          onSnapStageChange={handleListSheetSnapStageChange}
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
          onVoteChange={(item, voteType) =>
            voteSession.handleDetailVoteChange(
              item,
              voteType,
              lockerDetail
                ? {
                    isAccurateVoted: lockerDetail.isAccurateVoted,
                    isInaccurateVoted: lockerDetail.isInaccurateVoted,
                  }
                : undefined,
            )
          }
          onBack={handleBackFromDetail}
          onShare={handleShareLockerDetail}
          onNavigate={handleOpenNavigationPopup}
          initialSnapPoint={
            lockerDetailOpensFull ? LOCKER_DETAIL_FULL_TOP_OFFSET : undefined
          }
          animateOnMount={lockerDetailAnimatesOnMount}
          snapRequest={detailSheetSnapRequest}
          onSnapStageChange={handleDetailSheetSnapStageChange}
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

      {shareCopied ? (
        <div className={shareCopyToast} role="status" aria-live="polite">
          {m.locker_detail_share_copied()}
        </div>
      ) : null}
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
