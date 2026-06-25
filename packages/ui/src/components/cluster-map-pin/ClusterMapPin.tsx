import { vars } from "../../vars.css.ts";
import { root } from "./ClusterMapPin.css.ts";

export type ClusterMapPinSize = "s" | "l";

interface ClusterMapPinProps {
  size?: ClusterMapPinSize;
  count?: number | string;
  className?: string;
  "aria-label"?: string;
}

const CONFIG = {
  s: {
    viewBoxSize: 300,
    outerRadius: 149,
    badgeRadius: 33,
    badgeFill: vars.color.palette.gray[100],
    textFill: vars.color.palette.green[500],
    fontSize: 45,
    filterId: "cluster-map-pin-badge-shadow-s",
    textDy: 15,
  },
  l: {
    viewBoxSize: 400,
    outerRadius: 199,
    badgeRadius: 43,
    badgeFill: vars.color.palette.green[500],
    textFill: vars.color.palette.gray[100],
    fontSize: 38,
    filterId: "cluster-map-pin-badge-shadow-l",
    textDy: 13,
  },
} as const;

const formatCount = (count: number | string): string => {
  if (typeof count === "number" && count > 99) return "99+";
  return String(count);
};

export function ClusterMapPin({
  size = "s",
  count = size === "s" ? 2 : 10,
  className,
  "aria-label": ariaLabel,
}: ClusterMapPinProps) {
  const config = CONFIG[size];
  const center = config.viewBoxSize / 2;
  const label = formatCount(count);

  return (
    <svg
      className={[root({ size }), className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${config.viewBoxSize} ${config.viewBoxSize}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel ?? `Cluster marker ${label}`}
    >
      <circle
        cx={center}
        cy={center}
        r={config.outerRadius}
        fill={vars.color.palette.green[100]}
        stroke={vars.color.palette.green[500]}
        strokeWidth="2"
      />
      <g filter={`url(#${config.filterId})`}>
        <circle
          cx={center}
          cy={center}
          r={config.badgeRadius}
          fill={config.badgeFill}
        />
        <text
          x={center}
          y={center + config.textDy}
          textAnchor="middle"
          fill={config.textFill}
          fontFamily="Pretendard, sans-serif"
          fontSize={config.fontSize}
          fontWeight="700"
        >
          {label}
        </text>
      </g>
      <defs>
        <filter
          id={config.filterId}
          x={center - config.badgeRadius - 30}
          y={center - config.badgeRadius - 20}
          width={(config.badgeRadius + 30) * 2}
          height={(config.badgeRadius + 40) * 2}
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
          <feOffset dy="7.341" />
          <feGaussianBlur stdDeviation="14.683" />
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
      </defs>
    </svg>
  );
}
