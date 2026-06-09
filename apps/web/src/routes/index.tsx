import { languageTag, m } from "@repo/i18n";
import { Popup } from "@repo/ui/components/popup";
import {
  IconCircleboxCrosshair48,
  IconCircleboxRefresh48,
} from "@repo/ui/tokens/icons";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HomeSearchBar } from "#/composites/search/HomeSearchBar";
import {
  createLockerDetailFromAutocompleteItem,
  createLockerDetailPlaceholder,
  createLockerDetailFromSearchItem,
  LockerDetailBottomSheet,
  type LockerDetailItem,
} from "#/composites/search/LockerDetailBottomSheet";
import { NavigationPlatformPopup } from "#/composites/search/NavigationPlatformPopup";
import {
  createDefaultSearchFilters,
  type SearchFilterAppliedState,
  SearchFilterBottomSheet,
} from "#/composites/search/SearchFilterBottomSheet";
import { SearchListBottomSheet } from "#/composites/search/SearchListBottomSheet";
import { SearchOverlay } from "#/composites/search/SearchOverlay";
import type { SearchLockerResultItem } from "#/composites/search/search-list-model";
import {
  MapControlsSkeleton,
  NaverMapCanvas,
  NaverMapProvider,
  useNaverMapSdk,
} from "#/entities/map";
import { focusNaverMapOnCoordinates } from "#/entities/map/model/current-location";
import { fitNaverMapToBounds } from "#/entities/map/model/map-bounds";
import { useLocationTracking } from "#/entities/map/model/useLocationTracking";
import {
  LOCKER_PINS_QUERY_KEY,
  useLockerMarkers,
} from "#/entities/map/model/useLockerMarkers";
import { useSearchResultMarkers } from "#/entities/map/model/useSearchResultMarkers";
import { MyLocationMarker } from "#/entities/map/ui/MyLocationMarker";
import type { SearchAutocompleteItemData } from "#/entities/search";
import { useLockerDetail } from "#/features/search/hooks/useLockerDetail";
import {
  useLockerKeywordSearch,
  usePlaceLockers,
} from "#/features/search/hooks/useSearch";
import {
  searchLockerItemsToPins,
  searchResultItemsToPins,
} from "#/features/search/lib/search-result-pins";
import { toLockerSearchFilterParams } from "#/features/search/lib/to-locker-search-filter-params";
import type { LockerPinItemResponse } from "#/shared/api/lockers";
import {
  createKeywordSearchSelection,
  createPlaceSearchSelection,
  type SearchSelectionState,
  syncSearchDraft,
} from "#/features/search/model/search-selection";
import {
  getDetailFocusBottomInsetPx,
  getSearchBoundsBottomPadding,
} from "#/features/search/model/map-viewport-policy";
import { resolveMapMarkerLayer } from "#/features/search/model/map-marker-layer-policy";
import {
  type AppMapContext,
  createKeywordDetailBackTarget,
  createPlaceDetailBackTarget,
  createSearchDetailBackTarget,
  type MapDetailBack,
  type OverlayReturnContext,
  type SearchDetailBackTarget,
  type SearchListKind,
  resolveActivePlaceId,
  resolveOverlayReturnContext,
  shouldFetchKeywordSearch,
  shouldFetchPlaceLockers,
} from "#/features/search/model/sheet-session";
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

export const Route = createFileRoute("/")({ component: IndexPage });

const DEFAULT_SEARCH_COORDINATES = { lat: 37.498095, lng: 127.02761 };

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

function IndexPage() {
  const queryClient = useQueryClient();
  const isSearchOpen = useSearchStore((state) => state.isSearchOpen);
  const setIsSearchOpen = useSearchStore((state) => state.setIsSearchOpen);
  const sheetMode = useSearchStore((state) => state.sheetMode);
  const setSheetMode = useSearchStore((state) => state.setSheetMode);
  const searchQuery = useSearchStore((state) => state.searchQuery);
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<naver.maps.Map | null>(null);
  // 지도 SDK 로딩 상태(NaverMapCanvas에서 끌어올림).
  // 로딩 중에는 실제 컨트롤 대신 같은 위치/계층의 스켈레톤을 보여준다.
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [hasMapError, setHasMapError] = useState(false);
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800,
  );
  const locationLoadingTimerRef = useRef<number | undefined>(undefined);
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
  const [activeLockerId, setActiveLockerId] = useState<number | null>(null);
  const [selectedLockerDetail, setSelectedLockerDetail] =
    useState<LockerDetailItem | null>(null);
  const [selectedMapPin, setSelectedMapPin] =
    useState<LockerPinItemResponse | null>(null);
  const [context, setContext] = useState<AppMapContext>("idle");
  const [overlayReturnContext, setOverlayReturnContext] =
    useState<OverlayReturnContext>("idle");
  const [listKind, setListKind] = useState<SearchListKind | null>(null);
  const [searchPlaceId, setSearchPlaceId] = useState<number | null>(null);
  const [mapPlaceId, setMapPlaceId] = useState<number | null>(null);
  const [searchDetailBack, setSearchDetailBack] =
    useState<SearchDetailBackTarget | null>(null);
  const [mapDetailBack, setMapDetailBack] = useState<MapDetailBack | null>(
    null,
  );
  const [searchDraft, setSearchDraft] = useState("");
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
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { permission, isTracking, location, startTracking } =
    useLocationTracking({ onFirstLocation: handleFirstLocation });
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
    setIsRefreshing(true);
    setRefreshCooldownRemaining(15);
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

    mapInstanceRef.current.refresh();
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

  // 언마운트 시 리프레시 타이머 클린업
  useEffect(() => {
    return () => {
      window.clearTimeout(refreshTimersRef.current.spinning);
      window.clearTimeout(refreshTimersRef.current.visual);
      window.clearInterval(refreshTimersRef.current.interval);
      window.clearTimeout(locationLoadingTimerRef.current);
    };
  }, []);

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

  const handleMapLoad = useCallback((map: naver.maps.Map | null) => {
    mapInstanceRef.current = map;
    setMapInstance(map);
  }, []);

  const resetMapContext = useCallback(() => {
    setMapPlaceId(null);
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setMapDetailBack(null);
    setSearchFilters(createDefaultSearchFilters());
    setIsNavigationPopupOpen(false);
    setSheetMode("idle");
    setContext("idle");
  }, [setSheetMode]);

  const resetSearchContext = useCallback(() => {
    setSearchQuery("");
    setSearchDraft("");
    setSearchFilters(createDefaultSearchFilters());
    setListKind(null);
    setSearchPlaceId(null);
    setSearchDetailBack(null);
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setSelectedMapPin(null);
    setIsNavigationPopupOpen(false);
    setSheetMode("idle");
    setContext("idle");
    setIsSearchOpen(false);
  }, [setIsSearchOpen, setSearchQuery, setSheetMode]);

  const handleOpenSearch = useCallback(() => {
    const returnContext = resolveOverlayReturnContext(context);

    if (context === "map") {
      resetMapContext();
    }

    setOverlayReturnContext(returnContext);
    setIsSearchOpen(true);
  }, [context, resetMapContext, setIsSearchOpen]);

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

    return {
      keyword: searchQuery.trim(),
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
      ...toLockerSearchFilterParams(searchFilters),
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

  const lockerDetailParams = useMemo(
    () =>
      activeLockerId != null
        ? {
            lockerId: activeLockerId,
            lat: searchCoordinates.lat,
            lng: searchCoordinates.lng,
          }
        : null,
    [activeLockerId, searchCoordinates.lat, searchCoordinates.lng],
  );

  const { data: lockerDetail, isError: isLockerDetailError } =
    useLockerDetail(lockerDetailParams);

  const searchResultPins = useMemo(() => {
    if (context === "search" && listKind === "place") {
      return searchLockerItemsToPins(placeLockersResults?.lockers ?? []);
    }

    return searchResultItemsToPins(keywordSearchResults?.items ?? []);
  }, [
    context,
    keywordSearchResults?.items,
    listKind,
    placeLockersResults?.lockers,
  ]);
  const mapPlacePins = useMemo(
    () => searchLockerItemsToPins(placeLockersResults?.lockers ?? []),
    [placeLockersResults?.lockers],
  );

  const activePlaceName =
    context === "map" || listKind === "place"
      ? (placeLockersResults?.placeName ?? null)
      : null;

  const applySearchSelection = useCallback(
    (selection: SearchSelectionState) => {
      setSearchDraft(selection.searchDraft);
      setSearchQuery(selection.searchQuery);
    },
    [setSearchQuery],
  );

  const openLockerDetailById = useCallback(
    (lockerId: number, optimisticDetail?: LockerDetailItem) => {
      setSelectedLockerDetail(
        optimisticDetail ?? createLockerDetailPlaceholder(lockerId),
      );
      setActiveLockerId(lockerId);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("detail");
    },
    [setIsSearchOpen, setSheetMode],
  );

  const openSearchPlaceList = useCallback(
    (
      placeId: number,
      options: { applySelection?: boolean; draft?: string; placeName?: string } = {},
    ) => {
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
    [applySearchSelection, searchDraft, setIsSearchOpen, setSheetMode],
  );

  const openMapPlaceList = useCallback(
    (placeId: number) => {
      setContext("map");
      setMapPlaceId(placeId);
      setMapDetailBack(null);
      setActiveLockerId(null);
      setSelectedLockerDetail(null);
      setSelectedMapPin(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [setIsSearchOpen, setSheetMode],
  );

  const handleSelectSearch = useCallback(
    (query: string) => {
      applySearchSelection(createKeywordSearchSelection(query));
      setContext("search");
      setListKind("keyword");
      setSearchPlaceId(null);
      setSearchDetailBack(null);
      setActiveLockerId(null);
      setSelectedLockerDetail(null);
      setSelectedMapPin(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [applySearchSelection, setIsSearchOpen, setSheetMode],
  );

  const handleSelectSearchAutocomplete = useCallback(
    (item: SearchAutocompleteItemData, sourceQuery: string) => {
      if (item.itemType === "LOCKER") {
        setContext("search");
        setListKind("keyword");
        setSearchPlaceId(null);
        setSearchDraft(syncSearchDraft(sourceQuery).searchDraft);
        setSearchDetailBack(createKeywordDetailBackTarget());
        openLockerDetailById(
          item.lockerId,
          createLockerDetailFromAutocompleteItem(item),
        );
        return;
      }

      openSearchPlaceList(item.placeId, {
        applySelection: true,
        draft: sourceQuery,
        placeName: item.title,
      });
    },
    [openLockerDetailById, openSearchPlaceList],
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

  const focusMapOnLockerPin = useCallback((pin?: LockerPinItemResponse) => {
    if (!pin || !mapInstanceRef.current) {
      return;
    }

    focusNaverMapOnCoordinates({
      map: mapInstanceRef.current,
      coordinates: { lat: pin.latitude, lng: pin.longitude },
      bottomInsetPx: getDetailFocusBottomInsetPx(),
    });
  }, []);

  const handleIdlePinSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin?: LockerPinItemResponse,
    ) => {
      if (context !== "idle") {
        return;
      }

      if (pinType === "PLACE") {
        setSelectedMapPin(null);
        openMapPlaceList(id);
        return;
      }

      setSelectedMapPin(pin ?? null);
      setContext("map");
      setMapDetailBack("idle");
      focusMapOnLockerPin(pin);
      void openLockerDetailById(id);
    },
    [context, focusMapOnLockerPin, openLockerDetailById, openMapPlaceList],
  );

  const handleMapPlaceMarkerSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin?: LockerPinItemResponse,
    ) => {
      if (context !== "map") {
        return;
      }

      if (pinType === "PLACE") {
        openMapPlaceList(id);
        return;
      }

      setSelectedMapPin(pin ?? null);
      setMapDetailBack("placeList");
      focusMapOnLockerPin(pin);
      void openLockerDetailById(id);
    },
    [context, focusMapOnLockerPin, openLockerDetailById, openMapPlaceList],
  );

  const handleSearchMarkerSelect = useCallback(
    (
      pinType: "LOCKER" | "PLACE",
      id: number,
      pin?: LockerPinItemResponse,
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
        setSheetMode("list");
        return;
      }

      setSearchDetailBack(
        createSearchDetailBackTarget({
          listKind: listKind ?? "keyword",
          placeId: listKind === "place" ? searchPlaceId : null,
        }),
      );
      focusMapOnLockerPin(pin);
      void openLockerDetailById(id);
    },
    [
      context,
      focusMapOnLockerPin,
      listKind,
      openLockerDetailById,
      searchPlaceId,
      setSheetMode,
    ],
  );

  const handleDetailFavoriteChange = useCallback(
    (_item: LockerDetailItem, next: boolean) => {
      setSelectedLockerDetail((currentDetail) =>
        currentDetail ? { ...currentDetail, isFavorite: next } : currentDetail,
      );
    },
    [],
  );

  const handleOpenNavigationPopup = useCallback(() => {
    setIsNavigationPopupOpen(true);
  }, []);

  const handleBackFromDetail = useCallback(() => {
    setActiveLockerId(null);
    setSelectedLockerDetail(null);
    setIsNavigationPopupOpen(false);

    if (context === "map") {
      if (mapDetailBack === "idle") {
        resetMapContext();
        return;
      }

      setSheetMode("list");
      return;
    }

    if (searchDetailBack) {
      setListKind(searchDetailBack.listKind);
      setSearchPlaceId(searchDetailBack.placeId);
    }

    setSheetMode("list");
  }, [context, mapDetailBack, resetMapContext, searchDetailBack, setSheetMode]);

  const handleBackFromMapPlaceSheet = useCallback(() => {
    resetMapContext();
  }, [resetMapContext]);

  const handleBackToKeywordList = useCallback(() => {
    setSearchQuery(searchDraft);
    setListKind("keyword");
    setSearchPlaceId(null);
    setSheetMode("list");
  }, [searchDraft, setSearchQuery, setSheetMode]);

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

    if (
      mapInstance &&
      lockerDetail.latitude !== undefined &&
      lockerDetail.longitude !== undefined
    ) {
      focusNaverMapOnCoordinates({
        map: mapInstance,
        coordinates: {
          lat: lockerDetail.latitude,
          lng: lockerDetail.longitude,
        },
        bottomInsetPx: getDetailFocusBottomInsetPx(),
      });
    }
  }, [lockerDetail, mapInstance]);

  useEffect(() => {
    if (!isLockerDetailError || sheetMode !== "detail") {
      return;
    }

    setActiveLockerId(null);
    setSelectedLockerDetail(null);

    if (context === "map") {
      if (mapDetailBack === "idle") {
        resetMapContext();
        return;
      }

      setSheetMode("list");
      return;
    }

    if (searchDetailBack) {
      setListKind(searchDetailBack.listKind);
      setSearchPlaceId(searchDetailBack.placeId);
    }

    setSheetMode("list");
  }, [
    context,
    isLockerDetailError,
    mapDetailBack,
    resetMapContext,
    searchDetailBack,
    setSheetMode,
    sheetMode,
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
      setIsCameraCentered(false);
      stopOrientationTracking();
    });

    return () => {
      maps.Event.removeListener(listener);
    };
  }, [mapInstance, stopOrientationTracking]);

  useEffect(() => {
    if (sheetMode !== "list" && sheetMode !== "filter") {
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
  ]);

  const shouldRenderMapControls = shouldShowMapControls({
    isMapLoading,
    hasMapError,
    hasMapInstance: !!mapInstance,
  });
  const shouldRenderHomeSearchBar = shouldShowHomeSearchBar({ hasMapError });
  const isSearchFilterActive =
    searchFilters.regionActive ||
    searchFilters.sizePriceActive ||
    searchFilters.placeTypeActive;
  const isPlaceListScope = activePlaceId != null;
  const searchBottomSheetItems = isPlaceListScope
    ? (placeLockersResults?.lockers ?? [])
    : (keywordSearchResults?.items ?? []);
  const isSearchListLoading = isPlaceListScope
    ? isPlaceLockersPending
    : isKeywordSearchPending;
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
      },
    ];
  }, [context, selectedLockerDetail, selectedMapPin, sheetMode]);
  const markerLayer = resolveMapMarkerLayer({
    context,
    sheetMode,
    searchDetailBack,
    mapDetailBack,
    selectedMapDetailPinCount: selectedMapDetailPins.length,
  });
  const showPlaceSheetBack =
    context === "map" || (context === "search" && listKind === "place");
  const listHeaderLeadingPress = showPlaceSheetBack
    ? context === "map"
      ? handleBackFromMapPlaceSheet
      : handleBackToKeywordList
    : undefined;

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
        <NaverMapCanvas
          onLoad={handleMapLoad}
          onLoadingChange={setIsMapLoading}
          onErrorChange={setHasMapError}
        />
        <MyLocationMarker
          map={mapInstance}
          location={location}
          deviceHeading={deviceHeading}
          isOrientationTracking={isOrientationTracking}
        />
        {markerLayer === "idle" ? (
          <LockerMarkersLayer
            map={mapInstance}
            onSelectPin={handleIdlePinSelect}
          />
        ) : markerLayer === "search" ? (
          <SearchResultMarkersLayer
            map={mapInstance}
            pins={searchResultPins}
            onSelectLocker={handleSearchMarkerSelect}
          />
        ) : markerLayer === "mapPlace" ? (
          <SearchResultMarkersLayer
            map={mapInstance}
            pins={mapPlacePins}
            onSelectLocker={handleMapPlaceMarkerSelect}
          />
        ) : markerLayer === "selectedMapDetail" ? (
          <SearchResultMarkersLayer
            map={mapInstance}
            pins={selectedMapDetailPins}
            onSelectLocker={handleIdlePinSelect}
          />
        ) : null}
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
            aria-label="현 지도에서 검색"
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
            aria-label="내 위치로 이동"
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

      {sheetMode === "list" && !isSearchOpen ? (
        <SearchListBottomSheet
          searchQuery={searchQuery}
          items={searchBottomSheetItems}
          placeName={activePlaceName}
          appLanguage={normalizeLocale(languageTag()) ?? BASE_LOCALE}
          isFilterActive={isSearchFilterActive}
          isLoading={isSearchListLoading}
          isError={isSearchListError}
          onRetry={() => void refetchSearchList()}
          onOpenFilter={handleOpenSearchFilter}
          onLockerPress={handleOpenLockerDetail}
          showHeaderBack={showPlaceSheetBack}
          onHeaderBackPress={listHeaderLeadingPress}
        />
      ) : null}

      {sheetMode === "detail" && !isSearchOpen && selectedLockerDetail ? (
        <LockerDetailBottomSheet
          locker={selectedLockerDetail}
          onFavoriteChange={handleDetailFavoriteChange}
          onBack={handleBackFromDetail}
          onNavigate={handleOpenNavigationPopup}
        />
      ) : null}

      <NavigationPlatformPopup
        isOpen={isNavigationPopupOpen}
        locker={selectedLockerDetail}
        onOpenChange={setIsNavigationPopupOpen}
      />

      {sheetMode === "filter" && !isSearchOpen ? (
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
          onClose={handleCloseSearch}
          onSelect={handleSelectSearch}
          onSelectAutocomplete={handleSelectSearchAutocomplete}
        />
      ) : null}
    </main>
  );
}

function LockerMarkersLayer({
  map,
  onSelectPin,
}: {
  map: naver.maps.Map | null;
  onSelectPin?: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
  ) => void;
}) {
  const { maps } = useNaverMapSdk();

  useLockerMarkers({ map, maps, onSelectLocker: onSelectPin });

  return null;
}

function SearchResultMarkersLayer({
  map,
  pins,
  onSelectLocker,
}: {
  map: naver.maps.Map | null;
  pins: ReturnType<typeof searchResultItemsToPins>;
  onSelectLocker: (
    pinType: "LOCKER" | "PLACE",
    id: number,
    pin: LockerPinItemResponse,
  ) => void;
}) {
  const { maps } = useNaverMapSdk();

  useSearchResultMarkers({
    map,
    maps,
    pins,
    onSelectLocker,
  });

  return null;
}
