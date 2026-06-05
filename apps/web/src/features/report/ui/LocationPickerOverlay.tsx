import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { Popup } from "@repo/ui/components/popup";
import {
  IconCircleboxCrosshair48,
  IconNavigationPin40,
} from "@repo/ui/tokens/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocationPermissionPopup } from "#/shared/hooks/useLocationPermissionPopup";
import {
  addressInfo,
  addressLabel,
  addressText,
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

export function LocationPickerOverlay({
  onSelect,
  initialCoords,
}: LocationPickerOverlayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<naver.maps.Map | null>(null);
  const geocodeRetryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isMountedRef = useRef(true);

  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  const [currentAddress, setCurrentAddress] = useState(
    m.report_location_select_placeholder(),
  );
  const [currentCoords, setCurrentCoords] = useState<{
    lat: number;
    lng: number;
  }>(
    initialCoords || { lat: 37.4979, lng: 127.0276 }, // 강남역 정중앙
  );

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
    (lat: number, lng: number, retry = 0) => {
      if (!window.naver?.maps?.Service) {
        // SDK는 로드되었으나 geocoder 서브모듈 초기화가 지연될 경우를 대비한 재시도 로직
        if (retry >= 20) return;
        if (geocodeRetryTimeoutRef.current) {
          clearTimeout(geocodeRetryTimeoutRef.current);
        }
        geocodeRetryTimeoutRef.current = setTimeout(
          () => updateAddressFromCoords(lat, lng, retry + 1),
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
          if (status !== window.naver.maps.Service.Status.OK) return;

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
        },
      );
    },
    [],
  );

  // 지도 초기화 및 위치 설정
  useEffect(() => {
    if (!isSdkLoaded || !mapRef.current || mapInstanceRef.current) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(
        currentCoords.lat,
        currentCoords.lng,
      ),
      zoom: 17,
      logoControl: false,
      mapDataControl: false,
      scaleControl: false,
      zoomControl: false,
    };

    const map = new window.naver.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // 만약 초기 좌표가 없다면, 사용자 현재 위치를 탐색하여 지도를 이동시킵니다.
    if (!initialCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current) return;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latLng = new window.naver.maps.LatLng(lat, lng);
          map.panTo(latLng);
          setCurrentCoords({ lat, lng });
          updateAddressFromCoords(lat, lng);
          setIsCentered(true);
          setLocationPermission("granted");
        },
        (error) => {
          if (!isMountedRef.current) return;
          // 권한 거부 등 실패 시 강남역 기본 좌표에 대한 주소 갱신
          updateAddressFromCoords(currentCoords.lat, currentCoords.lng);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission("denied");
          }
        },
      );
    } else {
      // 초기 좌표가 있거나 geolocation 미지원 환경일 때
      updateAddressFromCoords(currentCoords.lat, currentCoords.lng);
      if (initialCoords) setIsCentered(false); // 이미 선택한 위치라면 중앙 고정이 아님
    }

    // 지도 이벤트 리스너
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
    isSdkLoaded,
    updateAddressFromCoords,
    currentCoords.lat,
    currentCoords.lng,
    initialCoords,
  ]);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
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
    }
  };

  const handleConfirm = () => {
    onSelect(currentAddress, currentCoords);
  };

  return (
    <div className={overlayContainer}>
      <div className={mapWrapper}>
        <div ref={mapRef} className={map} />

        <div className={centerPinContainer}>
          <IconNavigationPin40
            className={[centerPin, !isMapMoving ? "bounce" : ""]
              .filter(Boolean)
              .join(" ")}
          />
        </div>

        <button
          type="button"
          className={myLocationButton}
          onClick={handleMyLocation}
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
          <span className={addressLabel}>{m.report_location_selected_label()}</span>
          <div className={addressText}>
            {isMapMoving || isGeocoding
              ? m.report_location_loading()
              : currentAddress}
          </div>
        </div>
        <Button
          className={confirmButton}
          variant="filled"
          intent="primary"
          size="L"
          onPress={handleConfirm}
          isDisabled={isMapMoving || isGeocoding}
        >
          {isMapMoving || isGeocoding
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
