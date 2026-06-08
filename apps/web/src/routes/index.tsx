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
import {
  findPlaceTitleInSearchResults,
  type SearchLockerResultItem,
} from "#/composites/search/search-list-model";
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
import {
  useLockerKeywordSearch,
  usePlaceLockers,
} from "#/features/search/hooks/useSearch";
import {
  searchLockerItemsToPins,
  searchResultItemsToPins,
} from "#/features/search/lib/search-result-pins";
import { toLockerSearchFilterParams } from "#/features/search/lib/to-locker-search-filter-params";
import {
  createKeywordSearchSelection,
  createPlaceSearchSelection,
  type SearchSelectionState,
  syncSearchDraft,
} from "#/features/search/model/search-selection";
import { toLockerDetailItem } from "#/shared/api/locker-adapters";
import { getLockerDetail } from "#/shared/api/lockers";
import { useDeviceOrientation } from "#/shared/hooks/useDeviceOrientation";
import { useLocationPermissionPopup } from "#/shared/hooks/useLocationPermissionPopup";
import { BASE_LOCALE, normalizeLocale } from "#/shared/i18n/locales";
import { type SheetMode, useSearchStore } from "#/shared/store/search";
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
type DetailBackMode = Exclude<SheetMode, "detail">;

interface SelectedPlace {
  placeId: number;
  placeName: string;
}

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
  const [selectedLockerDetail, setSelectedLockerDetail] =
    useState<LockerDetailItem | null>(null);
  const [detailBackMode, setDetailBackMode] = useState<DetailBackMode>("idle");
  const [searchDraft, setSearchDraft] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null,
  );
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

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
  }, [setIsSearchOpen]);

  const handleCloseSearch = useCallback(
    (draft?: string) => {
      if (draft !== undefined) {
        setSearchDraft(draft.trim());
      }
      setIsSearchOpen(false);
    },
    [setIsSearchOpen],
  );

  const handleExitSearchContext = useCallback(() => {
    setSearchQuery("");
    setSearchDraft("");
    setSelectedPlace(null);
    setSelectedLockerDetail(null);
    setDetailBackMode("idle");
    setIsNavigationPopupOpen(false);
    setSearchFilters(createDefaultSearchFilters());
    setIsSearchOpen(false);
    setSheetMode("idle");
  }, [setIsSearchOpen, setSearchQuery, setSheetMode]);

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

  const shouldFetchSearchListData =
    sheetMode === "list" ||
    sheetMode === "filter" ||
    (sheetMode === "detail" && detailBackMode !== "idle");

  const keywordSearchParams = useMemo(() => {
    if (!shouldFetchSearchListData || selectedPlace || !searchQuery.trim()) {
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
    selectedPlace,
    shouldFetchSearchListData,
  ]);

  const placeLockersParams = useMemo(() => {
    if (!shouldFetchSearchListData || !selectedPlace) {
      return null;
    }

    return {
      placeId: selectedPlace.placeId,
      lat: searchCoordinates.lat,
      lng: searchCoordinates.lng,
      ...toLockerSearchFilterParams(searchFilters),
    };
  }, [
    searchCoordinates.lat,
    searchCoordinates.lng,
    searchFilters,
    selectedPlace,
    shouldFetchSearchListData,
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

  const searchResultPins = useMemo(() => {
    if (selectedPlace) {
      return searchLockerItemsToPins(placeLockersResults?.lockers ?? []);
    }

    return searchResultItemsToPins(keywordSearchResults?.items ?? []);
  }, [
    keywordSearchResults?.items,
    placeLockersResults?.lockers,
    selectedPlace,
  ]);

  const applySearchSelection = useCallback(
    (selection: SearchSelectionState) => {
      setSearchDraft(selection.searchDraft);
      setSearchQuery(selection.searchQuery);
    },
    [setSearchQuery],
  );

  const openLockerDetailById = useCallback(
    async (lockerId: number, options: { backMode?: DetailBackMode } = {}) => {
      try {
        const raw = await getLockerDetail({
          lockerId,
          lat: searchCoordinates.lat,
          lng: searchCoordinates.lng,
        });
        const detail = toLockerDetailItem(raw);
        setSelectedLockerDetail(detail);
        setDetailBackMode(
          options.backMode ??
            (sheetMode === "detail" ? detailBackMode : sheetMode),
        );
        setIsNavigationPopupOpen(false);
        setIsSearchOpen(false);
        setSheetMode("detail");

        if (
          mapInstance &&
          detail.latitude !== undefined &&
          detail.longitude !== undefined
        ) {
          focusNaverMapOnCoordinates({
            map: mapInstance,
            coordinates: {
              lat: detail.latitude,
              lng: detail.longitude,
            },
          });
        }
      } catch {
        // API 실패 시 detail 시트는 열지 않는다.
      }
    },
    [
      mapInstance,
      searchCoordinates.lat,
      searchCoordinates.lng,
      detailBackMode,
      setIsSearchOpen,
      setSheetMode,
      sheetMode,
    ],
  );

  const openPlaceLockers = useCallback(
    (
      place: SelectedPlace,
      options: { applySelection?: boolean; draft?: string } = {},
    ) => {
      if (options.applySelection) {
        applySearchSelection(
          createPlaceSearchSelection(
            options.draft ?? searchDraft,
            place.placeName,
          ),
        );
      }

      setSelectedPlace(place);
      setSelectedLockerDetail(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [applySearchSelection, searchDraft, setIsSearchOpen, setSheetMode],
  );

  const handleSelectSearch = useCallback(
    (query: string) => {
      applySearchSelection(createKeywordSearchSelection(query));
      setSelectedPlace(null);
      setSelectedLockerDetail(null);
      setIsNavigationPopupOpen(false);
      setIsSearchOpen(false);
      setSheetMode("list");
    },
    [applySearchSelection, setIsSearchOpen, setSheetMode],
  );

  const handleSelectSearchAutocomplete = useCallback(
    (item: SearchAutocompleteItemData, sourceQuery: string) => {
      if (item.itemType === "LOCKER") {
        setSelectedPlace(null);
        setSearchDraft(syncSearchDraft(sourceQuery).searchDraft);
        void openLockerDetailById(item.lockerId, { backMode: "list" });
        return;
      }

      openPlaceLockers(
        { placeId: item.placeId, placeName: item.title },
        { applySelection: true, draft: sourceQuery },
      );
    },
    [openLockerDetailById, openPlaceLockers],
  );

  const handleOpenLockerDetail = useCallback(
    (item: SearchLockerResultItem) => {
      void openLockerDetailById(item.lockerId, { backMode: "list" });
    },
    [openLockerDetailById],
  );

  const handleMapPinSelect = useCallback(
    (pinType: "LOCKER" | "PLACE", id: number) => {
      if (pinType === "PLACE") {
        const placeName =
          findPlaceTitleInSearchResults(
            keywordSearchResults?.items ?? [],
            id,
          ) ??
          selectedPlace?.placeName ??
          "";

        openPlaceLockers({ placeId: id, placeName });
        return;
      }

      void openLockerDetailById(id, {
        backMode:
          sheetMode === "detail"
            ? detailBackMode
            : sheetMode === "idle"
              ? "idle"
              : sheetMode,
      });
    },
    [
      detailBackMode,
      keywordSearchResults?.items,
      openLockerDetailById,
      openPlaceLockers,
      selectedPlace?.placeName,
      sheetMode,
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
    setSelectedLockerDetail(null);
    setIsNavigationPopupOpen(false);

    if (detailBackMode === "idle") {
      setSearchQuery("");
      setSearchDraft("");
      setSelectedPlace(null);
      setSearchFilters(createDefaultSearchFilters());
    }

    setSheetMode(detailBackMode);
  }, [detailBackMode, setSearchQuery, setSheetMode]);

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

    const bounds = selectedPlace
      ? placeLockersResults?.bounds
      : keywordSearchResults?.bounds;

    if (!bounds) {
      return;
    }

    fitNaverMapToBounds({
      map: mapInstance,
      bounds,
    });
  }, [
    keywordSearchResults?.bounds,
    mapInstance,
    placeLockersResults?.bounds,
    selectedPlace,
    sheetMode,
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
  const searchBottomSheetItems = selectedPlace
    ? (placeLockersResults?.lockers ?? [])
    : (keywordSearchResults?.items ?? []);
  const isSearchListLoading = selectedPlace
    ? isPlaceLockersPending
    : isKeywordSearchPending;
  const isSearchListError = selectedPlace
    ? isPlaceLockersError
    : isKeywordSearchError;
  const refetchSearchList = selectedPlace
    ? refetchPlaceLockers
    : refetchKeywordSearch;
  const shouldRenderSearchResultMarkers =
    sheetMode !== "idle" &&
    (sheetMode !== "detail" || detailBackMode !== "idle");

  return (
    <main className={pageWrapper}>
      {shouldRenderHomeSearchBar ? (
        <HomeSearchBar
          onOpenSearch={handleOpenSearch}
          onCloseSearchContext={handleExitSearchContext}
          searchQuery={searchQuery}
          isSearchContextActive={sheetMode !== "idle"}
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
        {sheetMode === "idle" ? (
          <LockerMarkersLayer
            map={mapInstance}
            onSelectPin={handleMapPinSelect}
          />
        ) : shouldRenderSearchResultMarkers ? (
          <SearchResultMarkersLayer
            map={mapInstance}
            pins={searchResultPins}
            onSelectLocker={handleMapPinSelect}
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
          placeName={selectedPlace?.placeName ?? null}
          appLanguage={normalizeLocale(languageTag()) ?? BASE_LOCALE}
          isFilterActive={isSearchFilterActive}
          isLoading={isSearchListLoading}
          isError={isSearchListError}
          onRetry={() => void refetchSearchList()}
          onOpenFilter={handleOpenSearchFilter}
          onLockerPress={handleOpenLockerDetail}
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
  onSelectPin?: (pinType: "LOCKER" | "PLACE", id: number) => void;
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
  onSelectLocker: (pinType: "LOCKER" | "PLACE", id: number) => void;
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
