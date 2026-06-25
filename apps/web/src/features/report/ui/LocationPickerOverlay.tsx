import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Popup } from "@repo/ui/components/popup";
import {
  IconChevronLeft13,
  IconCircleboxCrosshair48,
  IconNavigationPin40,
} from "@repo/ui/tokens/icons";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { ReportPageLoadingOverlay } from "./ReportPageLoadingOverlay";

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
  const scriptSrc = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}&submodules=geocoder`;
  const activeScript = document.querySelector<HTMLScriptElement>(
    'script[src*="maps.js"]',
  );

  if (activeScript && window.naver?.maps?.Service) return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Naver Maps SDK Load Failed"));
    document.head.appendChild(script);
  });
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const geocodeRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isMountedRef = useRef(true);
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
  const [isLocationErrorPopupOpen, setIsLocationErrorPopupOpen] =
    useState(false);
  const [locationPermission, setLocationPermission] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");

  const isMapInteractive = isSdkLoaded && isInitialSetupComplete;

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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latLng = new window.naver.maps.LatLng(lat, lng);
        mapInstanceRef.current?.panTo(latLng);
        setIsCentered(true);
        setLocationPermission("granted");
      },
      (error) => {
        if (!isMountedRef.current) return;
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

  const isAddressPending = !isMapInteractive || isMapMoving || isGeocoding;
  const isConfirmDisabled = isAddressPending;

  return (
    <div className={overlayContainer}>
      <div className={mapWrapper}>
        <div ref={mapRef} className={map} />

        {!isMapInteractive && <ReportPageLoadingOverlay />}

        <button
          type="button"
          className={backButton}
          onClick={onClose}
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
          disabled={!isMapInteractive}
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
