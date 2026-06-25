import { useId } from "react";
import { vars } from "../../vars.css.ts";
import { root } from "./MapPinMarker.css.ts";

export type MapPinMarkerVariant = "locker" | "favoriteLocker" | "placeCluster";

export interface MapPinMarkerProps {
  variant?: MapPinMarkerVariant;
  count?: number | string;
  scale?: number;
  className?: string;
  "aria-label"?: string;
}

const LOCKER_SOURCE_SIZE = 90;
const PLACE_CLUSTER_SOURCE_SIZE = 121;

const getSourceSize = (variant: MapPinMarkerVariant): number =>
  variant === "placeCluster" ? PLACE_CLUSTER_SOURCE_SIZE : LOCKER_SOURCE_SIZE;

const formatCount = (count: number | string): string => {
  if (typeof count === "number" && count > 9) return "9+";
  return String(count);
};

const sanitizeId = (id: string): string => id.replace(/[^a-zA-Z0-9_-]/g, "");

function LockerGlyph() {
  return (
    <path
      d="M48.4398 26.0612C51.9428 25.5465 55.0768 28.3442 55.0768 31.9866V32.5677H57.9845C61.1961 32.5677 63.7998 35.2476 63.8 38.5533V55.0141C63.7998 58.3201 61.1961 61 57.9845 61H31.8152C28.6036 61 26.0001 58.3201 26 55.0141V38.5533C26.0001 35.2476 28.6036 32.5678 31.8152 32.5677H34.7231V31.9866C34.7232 28.3443 37.857 25.5466 41.3599 26.0612L44.8926 26.5805L44.9 26.5815L44.9071 26.5803L48.4398 26.0612ZM31.8152 35.5605C30.2095 35.5606 28.9077 36.9006 28.9076 38.5533V55.0141C28.9077 56.6671 30.2095 58.007 31.8152 58.007H34.7231V50.692L44.0501 46.2083C44.6491 47.3851 45.8162 48.1806 47.1522 48.1806C49.1026 48.1806 50.6999 46.4735 50.6999 44.352H50.7152C50.7152 42.247 49.1181 40.5232 47.1678 40.5231C45.2173 40.5231 43.62 42.2305 43.62 44.352C43.62 44.5509 43.6355 44.7499 43.6662 44.9487L34.7231 46.9508V35.5605H31.8152ZM55.0768 58.007H57.9845C59.5904 58.007 60.892 56.6671 60.892 55.0141V38.5533C60.892 36.9005 59.5902 35.5605 57.9845 35.5605H55.0768V58.007ZM52.1693 31.9866C52.169 30.194 50.6507 28.8105 48.9326 29.0132L48.8509 29.024L45.3112 29.5443L45.3045 29.5452L45.0987 29.5745L44.9 29.6026L44.7012 29.5745L44.4954 29.5452L44.492 29.5447L44.4885 29.5443L40.9491 29.024C39.1976 28.7667 37.6308 30.1656 37.6307 31.9866V32.5677H37.6538C37.6387 32.6466 37.6307 32.7264 37.6307 32.8068C37.6308 34.4597 40.8854 35.7999 44.9 35.7999C48.9146 35.7999 52.1688 34.4597 52.169 32.8068C52.169 32.7264 52.1611 32.6466 52.1458 32.5677H52.1693V31.9866Z"
      fill={vars.color.palette.green[500]}
    />
  );
}

function LockerMarker({ id }: { id: string }) {
  const clipId = `${id}-locker-clip`;
  const shadowId = `${id}-locker-shadow`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Locker map pin</title>
      <g clipPath={`url(#${clipId})`}>
        <g filter={`url(#${shadowId})`}>
          <path
            d="M44.5 16C60.2401 16 73 28.76 73 44.5C73 60.2402 60.2401 73 44.5 73C28.7599 73 16 60.2402 16 44.5C16 28.76 28.7599 16 44.5 16Z"
            fill={vars.color.palette.gray[100]}
          />
          <path
            d="M44.5 16C60.2401 16 73 28.76 73 44.5C73 60.2402 60.2401 73 44.5 73C28.7599 73 16 60.2402 16 44.5C16 28.76 28.7599 16 44.5 16Z"
            stroke={vars.color.palette.green[500]}
            strokeWidth="3"
          />
        </g>
        <LockerGlyph />
      </g>
      <defs>
        <filter
          id={shadowId}
          x="-1.5"
          y="2.5"
          width="92"
          height="92"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="8" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <clipPath id={clipId}>
          <rect width="90" height="90" fill={vars.color.palette.gray[100]} />
        </clipPath>
      </defs>
    </svg>
  );
}

function FavoriteLockerMarker({ id }: { id: string }) {
  const clipId = `${id}-favorite-clip`;
  const shadowId = `${id}-favorite-shadow`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Favorite locker map pin</title>
      <g clipPath={`url(#${clipId})`}>
        <g filter={`url(#${shadowId})`}>
          <path
            d="M16 44.5C16 28.7599 28.7599 16 44.5 16C60.2401 16 73 28.7599 73 44.5C73 60.2402 60.2401 73 44.5 73C28.7599 73 16 60.2402 16 44.5Z"
            fill={vars.color.palette.green[500]}
          />
          <path
            d="M44.0258 53.6479L34.2538 59.1178L36.4362 48.1338L28.2144 40.5304L39.3352 39.2118L44.0258 29.0428L48.7162 39.2118L59.8369 40.5304L51.6152 48.1338L53.7977 59.1178L44.0258 53.6479Z"
            fill={vars.color.palette.gray[100]}
          />
        </g>
      </g>
      <defs>
        <filter
          id={shadowId}
          x="-6.4"
          y="-0.8"
          width="101.8"
          height="101.8"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="5.6" />
          <feGaussianBlur stdDeviation="11.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <clipPath id={clipId}>
          <rect width="90" height="90" fill={vars.color.palette.gray[100]} />
        </clipPath>
      </defs>
    </svg>
  );
}

function PlaceClusterMarker({
  count,
  id,
}: {
  count: number | string;
  id: string;
}) {
  const label = formatCount(count);
  const badgeFontSize = label.length > 1 ? 24 : 31;
  const badgeY = label.length > 1 ? 43 : 45;
  const markerShadowId = `${id}-cluster-marker-shadow`;
  const badgeShadowId = `${id}-cluster-badge-shadow`;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 121 121"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>Place cluster map pin</title>
      <g filter={`url(#${markerShadowId})`}>
        <path
          d="M22.4 63C22.4 46.4315 35.8315 33 52.4 33C68.9686 33 82.4 46.4315 82.4 63C82.4 79.5685 68.9686 93 52.4 93C35.8315 93 22.4 79.5685 22.4 63Z"
          fill={vars.color.palette.gray[100]}
          shapeRendering="crispEdges"
        />
        <path
          d="M52.4 34.5C68.1401 34.5 80.9 47.2599 80.9 63C80.9 78.7401 68.1401 91.5 52.4 91.5C36.6599 91.5 23.9 78.7401 23.9 63C23.9 47.2599 36.6599 34.5 52.4 34.5Z"
          stroke={vars.color.palette.green[500]}
          strokeWidth="3"
          shapeRendering="crispEdges"
        />
        <g transform="translate(6.8 18.8)">
          <LockerGlyph />
        </g>
      </g>
      <g filter={`url(#${badgeShadowId})`}>
        <path
          d="M99.3436 33.2436C99.3436 20.3786 88.9144 9.94946 76.0495 9.94946C63.1845 9.94946 52.7554 20.3786 52.7554 33.2436C52.7554 46.1085 63.1845 56.5377 76.0495 56.5377C88.9144 56.5377 99.3436 46.1085 99.3436 33.2436Z"
          fill={vars.color.palette.green[600]}
        />
        <text
          x="76.05"
          y={badgeY}
          textAnchor="middle"
          fill={vars.color.palette.gray[100]}
          fontFamily="Pretendard, sans-serif"
          fontSize={badgeFontSize}
          fontWeight="700"
        >
          {label}
        </text>
      </g>
      <defs>
        <filter
          id={markerShadowId}
          x="0"
          y="16.2"
          width="104.8"
          height="104.8"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="5.6" />
          <feGaussianBlur stdDeviation="11.2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.16 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <filter
          id={badgeShadowId}
          x="47.1145"
          y="5.71883"
          width="57.8699"
          height="57.8699"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.41021" />
          <feGaussianBlur stdDeviation="2.82042" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.0862745 0 0 0 0 0.0941176 0 0 0 0 0.109804 0 0 0 0.12 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function MapPinMarker({
  variant = "locker",
  count = 3,
  scale = 1,
  className,
  "aria-label": ariaLabel,
}: MapPinMarkerProps) {
  const reactId = sanitizeId(useId());
  const sourceSize = getSourceSize(variant);
  const displaySize = sourceSize * scale;

  return (
    <span
      className={[root, className].filter(Boolean).join(" ")}
      style={{ width: displaySize, height: displaySize }}
      role="img"
      aria-label={ariaLabel ?? `${variant} map pin marker`}
    >
      {variant === "favoriteLocker" ? (
        <FavoriteLockerMarker id={reactId} />
      ) : variant === "placeCluster" ? (
        <PlaceClusterMarker count={count} id={reactId} />
      ) : (
        <LockerMarker id={reactId} />
      )}
    </span>
  );
}
