import { languageTag, m } from "@repo/i18n";
import {
  IconChevronLeft13,
  IconCircleboxCrosshair48,
  IconNavigationPin40,
} from "@repo/ui/assets/icons";
import { Button } from "@repo/ui/components/button";
import { Popup } from "@repo/ui/components/popup";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMapColorScheme } from "#/entities/map";
import { normalizeNaverMapLanguage } from "#/entities/map/model/naver-map-language";
import {
  getNaverMapScriptSrc,
  waitForNaverMapSdkReady,
} from "#/entities/map/model/naver-map-script";
import {
  getNaverMapStyleOptions,
  withNaverMapStyleSubmodules,
} from "#/entities/map/model/naver-map-style";
import { MapLoadingOverlay } from "#/entities/map/ui/map-skeleton/MapLoadingOverlay";
import { useLocationPermissionPopup } from "#/shared/hooks/useLocationPermissionPopup";
import {
  addressInfo,
  addressLabel,
  addressText,
  backButton,
  backIcon,
  bottomPanel,
  centerPin,
  centerPinContainer,
  confirmButton,
  map,
  mapWrapper,
  myLocationButton,
  overlayContainer,
} from "./LocationPickerOverlay.css.ts";

export interface LocationPickerOverlayProps {
  onClose: () => void;
  onSelect: (address: string, coords: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

const DEFAULT_COORDS = { lat: 37.4979, lng: 127.0276 }; // 강남역 정중앙
const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

const loadNaverMapsScript = async () => {
  if (typeof window === "undefined") return;
  if (!NAVER_MAP_CLIENT_ID) {
    throw new Error("VITE_NAVER_MAP_CLIENT_ID is required.");
  }
  // 지도 디자인툴 스타일은 gl 서브모듈에서만 그려진다. 스타일 ID 자체는
  // 스크립트가 아니라 지도를 만들 때 MapOptions 로 넘긴다.
  const scriptSrc = getNaverMapScriptSrc({
    clientId: NAVER_MAP_CLIENT_ID,
    language: normalizeNaverMapLanguage(languageTag()),
    submodules: withNaverMapStyleSubmodules(["geocoder"]),
  });
  const activeScript = document.querySelector<HTMLScriptElement>(
    'script[src*="maps.js"]',
  );

  // 파라미터가 같은 스크립트일 때만 재사용한다. 아무 maps.js 나 받아들이면
  // gl 없이 실린 SDK 를 그대로 써서 customStyleId 가 조용히 무시된다.
  if (activeScript?.src === scriptSrc && window.naver?.maps?.Service) {
    await waitForNaverMapSdkReady();
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Naver Maps SDK Load Failed"));
    document.head.appendChild(script);
  });

  // 서브모듈(geocoder, gl)은 onload 뒤에 실린다.
  await waitForNaverMapSdkReady();
};

type GeocodeOptions = {
  retry?: number;
  onSettled?: () => void;
};

export function LocationPickerOverlay({
  onClose,
  onSelect,
  initialCoords,
}: LocationPickerOverlayProps) {
  const { colorScheme } = useMapColorScheme();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const geocodeRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isMountedRef = useRef(true);
  const colorSchemeRef = useRef(colorScheme);
  colorSchemeRef.current = colorScheme;
  const hasCompletedInitialSetupRef = useRef(false);

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isInitialSetupComplete, setIsInitialSetupComplete] = useState(false);

  const [currentAddress, setCurrentAddress] = useState<string>(
    m.report_location_select_placeholder(),
  );
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  }>(initialCoords ?? DEFAULT_COORDS);

  const [isMapMoving, setIsMapMoving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const {
    isOpen: isLocationPopupOpen,
    openPopup,
    closePopup,
  } = useLocationPermissionPopup();
  const [isCentered, setIsCentered] = useState(false);
  const [locationRequestStatus, setLocationRequestStatus] = useState<
    "idle" | "pending"
  >("idle");
  const [isLocationErrorPopupOpen, setIsLocationErrorPopupOpen] =
    useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const isMapInteractive = isSdkLoaded && isInitialSetupComplete;
  const isLocatingMyPosition = locationRequestStatus === "pending";

  const completeInitialSetup = useCallback(() => {
    if (hasCompletedInitialSetupRef.current) return;
    hasCompletedInitialSetupRef.current = true;
    setIsInitialSetupComplete(true);
  }, []);

  // 위치 권한 실시간 감지
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !navigator.permissions ||
      !navigator.permissions.query
    )
      return;

    let permissionStatus: PermissionStatus | null = null;

    const handlePermissionChange = () => {
      if (permissionStatus) {
        const state = permissionStatus.state;
        if (state === "granted" || state === "denied" || state === "prompt") {
          setLocationPermission(state);
        }
        if (state === "denied") {
          setIsCentered(false);
        }
      }
    };

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        permissionStatus = status;
        const state = status.state;
        if (state === "granted" || state === "denied" || state === "prompt") {
          setLocationPermission(state);
        }
        status.addEventListener("change", handlePermissionChange);
      })
      .catch((err) => {
        console.warn("Permissions API not supported for geolocation:", err);
      });

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener("change", handlePermissionChange);
      }
    };
  }, []);

  // SDK 로드
  useEffect(() => {
    loadNaverMapsScript()
      .then(() => {
        setIsSdkLoaded(true);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (geocodeRetryTimeoutRef.current) {
        clearTimeout(geocodeRetryTimeoutRef.current);
      }
    };
  }, []);

  const updateAddressFromCoords = useCallback(
    (lat: number, lng: number, options?: GeocodeOptions) => {
      const retry = options?.retry ?? 0;
      const onSettled = options?.onSettled;

      if (!window.naver?.maps?.Service) {
        if (retry >= 20) {
          onSettled?.();
          return;
        }
        if (geocodeRetryTimeoutRef.current) {
          clearTimeout(geocodeRetryTimeoutRef.current);
        }
        geocodeRetryTimeoutRef.current = setTimeout(
          () =>
            updateAddressFromCoords(lat, lng, {
              retry: retry + 1,
              onSettled,
            }),
          100,
        );
        return;
      }

      setIsGeocoding(true);
      window.naver.maps.Service.reverseGeocode(
        {
          coords: new window.naver.maps.LatLng(lat, lng),
          orders: [
            window.naver.maps.Service.OrderType.ROAD_ADDR,
            window.naver.maps.Service.OrderType.ADDR,
          ].join(","),
        },
        (
          status: naver.maps.Service.Status,
          response: naver.maps.Service.ReverseGeocodeResponse,
        ) => {
          if (!isMountedRef.current) return;
          setIsGeocoding(false);

          if (status === window.naver.maps.Service.Status.OK) {
            const result = response.v2.results[0];
            if (result) {
              const region = result.region;
              const land = result.land;

              const area1 = region?.area1?.name || "";
              const area2 = region?.area2?.name || "";
              const area3 = region?.area3?.name || "";
              const landName = land?.name || "";
              const number1 = land?.number1 || "";
              const number2 = land?.number2 ? `-${land.number2}` : "";

              const addr = `${area1} ${area2} ${area3} ${landName} ${number1}${number2}`;
              setCurrentAddress(addr.trim().replace(/\s+/g, " "));
            }
          }

          onSettled?.();
        },
      );
    },
    [],
  );

  // 지도 초기화 및 초기 위치·주소 설정
  useEffect(() => {
    if (!isSdkLoaded || !mapRef.current || mapInstanceRef.current) return;

    const startCoords = initialCoords ?? DEFAULT_COORDS;

    const mapOptions = {
      center: new window.naver.maps.LatLng(startCoords.lat, startCoords.lng),
      zoom: 17,
      logoControl: false,
      mapDataControl: false,
      scaleControl: false,
      zoomControl: false,
      draggable: false,
      scrollWheel: false,
      pinchZoom: false,
      // 홈 지도와 같은 테마로 띄운다. 오버레이가 떠 있는 동안에는 테마를 바꿀
      // 수단이 없어 만들 때 한 번 읽으면 된다.
      ...getNaverMapStyleOptions(colorSchemeRef.current),
    };

    const map = new window.naver.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    const finishInitialGeocode = (lat: number, lng: number) => {
      updateAddressFromCoords(lat, lng, {
        onSettled: completeInitialSetup,
      });
    };

    if (!initialCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latLng = new window.naver.maps.LatLng(lat, lng);
          map.panTo(latLng);
          setCurrentCoords({ lat, lng });
          setIsCentered(true);
          setLocationPermission("granted");
          finishInitialGeocode(lat, lng);
        },
        (error) => {
          if (!isMountedRef.current) return;
          finishInitialGeocode(startCoords.lat, startCoords.lng);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission("denied");
          }
        },
      );
    } else {
      finishInitialGeocode(startCoords.lat, startCoords.lng);
      if (initialCoords) setIsCentered(false);
    }

    window.naver.maps.Event.addListener(map, "dragstart", () => {
      setIsMapMoving(true);
      setIsCentered(false);
    });

    window.naver.maps.Event.addListener(map, "idle", () => {
      const center = map.getCenter();
      const lat = center.lat();
      const lng = center.lng();
      setCurrentCoords({ lat, lng });
      setIsMapMoving(false);
      updateAddressFromCoords(lat, lng);
    });
  }, [
    completeInitialSetup,
    initialCoords,
    isSdkLoaded,
    updateAddressFromCoords,
  ]);

  useEffect(() => {
    if (!isMapInteractive || !mapInstanceRef.current) return;

    mapInstanceRef.current.setOptions({
      draggable: true,
      scrollWheel: true,
      pinchZoom: true,
    });
  }, [isMapInteractive]);

  const handleMyLocation = () => {
    if (!isMapInteractive || !navigator.geolocation) return;

    setLocationRequestStatus("pending");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        setLocationRequestStatus("idle");
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latLng = new window.naver.maps.LatLng(lat, lng);
        mapInstanceRef.current?.panTo(latLng);
        setIsCentered(true);
        setLocationPermission("granted");
      },
      (error) => {
        if (!isMountedRef.current) return;
        setLocationRequestStatus("idle");
        setIsCentered(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission("denied");
          openPopup();
        } else {
          setIsLocationErrorPopupOpen(true);
        }
      },
    );
  };

  const handleConfirm = () => {
    onSelect(currentAddress, currentCoords);
  };

  const handleCloseOverlay = () => {
    onClose();
  };

  const isAddressPending = !isMapInteractive || isMapMoving || isGeocoding;
  const isConfirmDisabled = isAddressPending;

  return (
    <div className={overlayContainer}>
      <div className={mapWrapper}>
        <div ref={mapRef} className={map} />

        {!isMapInteractive && (
          <MapLoadingOverlay
            label={
              isSdkLoaded ? m.report_location_loading() : m.map_loading_aria()
            }
            message={
              isSdkLoaded
                ? m.report_location_loading()
                : m.map_loading_message()
            }
          />
        )}
        {isLocatingMyPosition && (
          <MapLoadingOverlay
            label={m.location_loading_aria()}
            message={m.location_loading_message()}
          />
        )}

        <button
          type="button"
          className={backButton}
          onClick={handleCloseOverlay}
          aria-label={m.locker_detail_back_aria()}
        >
          <IconChevronLeft13 className={backIcon} />
        </button>

        <div className={centerPinContainer}>
          <IconNavigationPin40
            className={[
              centerPin,
              !isMapMoving && isMapInteractive ? "bounce" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        <button
          type="button"
          className={myLocationButton}
          onClick={handleMyLocation}
          disabled={!isMapInteractive || isLocatingMyPosition}
          aria-busy={isLocatingMyPosition}
          aria-label={m.home_my_location_aria()}
        >
          <IconCircleboxCrosshair48
            state={
              isCentered
                ? "active"
                : locationPermission === "denied"
                  ? "denied"
                  : "default"
            }
          />
        </button>
      </div>

      <div className={bottomPanel}>
        <div className={addressInfo}>
          <span className={addressLabel}>
            {m.report_location_selected_label()}
          </span>
          <div className={addressText}>
            {isAddressPending ? m.report_location_loading() : currentAddress}
          </div>
        </div>
        <Button
          className={confirmButton}
          variant="filled"
          intent="primary"
          size="L"
          onPress={handleConfirm}
          isDisabled={isConfirmDisabled}
        >
          {isAddressPending
            ? m.report_location_confirming()
            : m.report_location_confirm_button()}
        </Button>
      </div>

      <Popup
        isOpen={isLocationPopupOpen}
        onOpenChange={closePopup}
        titleText={m.report_location_permission_title()}
        helperText={m.report_location_permission_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: closePopup,
        }}
      />

      <Popup
        isOpen={isLocationErrorPopupOpen}
        onOpenChange={setIsLocationErrorPopupOpen}
        titleText={m.report_location_error_title()}
        helperText={m.report_location_error_helper()}
        primaryAction={{
          label: m.common_confirm(),
          onPress: () => setIsLocationErrorPopupOpen(false),
        }}
      />
    </div>
  );
}
