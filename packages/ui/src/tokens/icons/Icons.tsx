import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";
import { color } from "../color/color.css.ts";
import { typography } from "../typography/typography.css.ts";
import {
  brandSymbolBase,
  brandSymbolRoot,
  circleBoxContent,
  circleBoxGlyph,
  circleBoxGlyph20,
  circleBoxRoot,
  circleBoxSize,
  iconSvgFixed,
} from "./Icons.css.ts";

export function IconNavigationSearch24({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "active";
}) {
  const fill = color.palette.gray[800];
  const title = tone === "active" ? "지도 검색 활성" : "지도 검색";
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>{title}</title>
      {tone === "active" ? (
        <path
          d="M0 3L7 0L13 3L19.303 0.2987C19.5569 0.18992 19.8508 0.30749 19.9596 0.56131C19.9862 0.62355 20 0.69056 20 0.75827V17L13 20L7 17L0.69696 19.7013C0.44314 19.8101 0.14921 19.6925 0.0404301 19.4387C0.0137501 19.3765 0 19.3094 0 19.2417V3ZM13 17.7639V5.17594L12.9352 5.20369L7 2.23607V14.8241L7.06476 14.7963L13 17.7639Z"
          fill={fill}
        />
      ) : (
        <path
          d="M0 3L7 0L13 3L19.303 0.2987C19.5569 0.18992 19.8508 0.30749 19.9596 0.56131C19.9862 0.62355 20 0.69056 20 0.75827V17L13 20L7 17L0.69696 19.7013C0.44314 19.8101 0.14921 19.6925 0.0404301 19.4387C0.0137501 19.3765 0 19.3094 0 19.2417V3ZM14 17.3955L18 15.6812V3.03308L14 4.74736V17.3955ZM12 17.2639V4.73607L8 2.73607V15.2639L12 17.2639ZM6 15.2526V2.60451L2 4.31879V16.9669L6 15.2526Z"
          fill={fill}
        />
      )}
    </svg>
  );
}

export function IconNormalSearch24({
  className,
  size = 24,
  tone = "default",
}: {
  className?: string;
  size?: 20 | 24;
  tone?: "default" | "active";
}) {
  const fill =
    tone === "active" ? color.palette.gray[800] : color.palette.gray[600];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 20.3137 20.3137"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>검색</title>
      <path
        d="M16.031 14.6168L20.3137 18.8995L18.8995 20.3137L14.6168 16.031C13.0769 17.263 11.124 18 9 18C4.032 18 0 13.968 0 9C0 4.032 4.032 0 9 0C13.968 0 18 4.032 18 9C18 11.124 17.263 13.0769 16.031 14.6168ZM14.0247 13.8748C15.2475 12.6146 16 10.8956 16 9C16 5.1325 12.8675 2 9 2C5.1325 2 2 5.1325 2 9C2 12.8675 5.1325 16 9 16C10.8956 16 12.6146 15.2475 13.8748 14.0247L14.0247 13.8748Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNormalGlobe32({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "selected";
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "9999px",
        border:
          state === "selected" ? `1px solid ${color.palette.green[500]}` : 0,
        backgroundColor: color.bg.default,
        boxSizing: "border-box",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <svg
        className={iconSvgFixed}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <title>language</title>
        <path
          d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10ZM4.062 13c.438 3.33 3.144 5.936 6.522 6.245-.67-.87-1.31-2.192-1.686-3.95A16.553 16.553 0 0 1 8.598 13H4.062Zm0-2h4.536c.067-.8.168-1.572.3-2.295.376-1.758 1.016-3.08 1.686-3.95C7.206 5.064 4.5 7.67 4.062 11Zm15.876 2h-4.536c-.067.8-.168 1.572-.3 2.295-.376 1.758-1.016 3.08-1.686 3.95 3.378-.309 6.084-2.915 6.522-6.245Zm0-2c-.438-3.33-3.144-5.936-6.522-6.245.67.87 1.31 2.192 1.686 3.95.132.723.233 1.495.3 2.295h4.536ZM10.61 13c.06.655.147 1.273.26 1.834.33 1.64.819 2.826 1.13 3.408.311-.582.8-1.768 1.13-3.408.113-.561.2-1.179.26-1.834h-2.78Zm0-2h2.78a16.16 16.16 0 0 0-.26-1.834C12.8 7.526 12.311 6.34 12 5.758c-.311.582-.8 1.768-1.13 3.408-.113.561-.2 1.179-.26 1.834Z"
          fill={color.palette.green[500]}
        />
      </svg>
    </span>
  );
}

export function IconStarOutline24({
  className,
  size = 24,
}: {
  className?: string;
  size?: 20 | 24;
}) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 22.8253 21.7082"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>즐겨찾기</title>
      <path
        d="M11.4127 17.76L4.35926 21.7082L5.93459 13.7799L0 8.2918L8.02704 7.34006L11.4127 0L14.7983 7.34006L22.8253 8.2918L16.8908 13.7799L18.4661 21.7082L11.4127 17.76ZM11.4127 15.468L15.6594 17.8451L14.7109 13.0717L18.284 9.7674L13.4511 9.19434L11.4127 4.77502L9.37425 9.19434L4.54132 9.7674L8.11442 13.0717L7.16594 17.8451L11.4127 15.468Z"
        fill={color.palette.gray[500]}
      />
    </svg>
  );
}

export function IconStarFilled24({
  className,
  size = 24,
}: {
  className?: string;
  size?: 20 | 24;
}) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 22.8253 21.7082"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>즐겨찾기됨</title>
      <path
        d="M11.4127 17.76L4.35926 21.7082L5.93459 13.7799L0 8.2918L8.02704 7.34006L11.4127 0L14.7983 7.34006L22.8253 8.2918L16.8908 13.7799L18.4661 21.7082L11.4127 17.76Z"
        fill={color.palette.green[500]}
      />
    </svg>
  );
}

export function IconNavigateMarker({ className }: { className?: string }) {
  return <IconMarker22 className={className} size={24} />;
}

export function IconNavigateLocation({ className }: { className?: string }) {
  const blurId = useId();

  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      xmlns="http://www.w3.org/2000/svg"
      width={41}
      height={41}
      viewBox="0 0 41 41"
      fill="none"
      aria-hidden
    >
      <title>current location</title>
      <g filter={`url(#${blurId})`}>
        <circle cx="20.5" cy="20.5" r="8.5" fill={color.palette.blue[300]} />
      </g>
      <circle
        cx="20.5"
        cy="20.5"
        r="6.5"
        fill={color.palette.blue[300]}
        stroke={color.palette.gray[100]}
        strokeWidth="2"
      />
      <defs>
        <filter
          id={blurId}
          x="0"
          y="0"
          width="41"
          height="41"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="6"
            result="effect1_foregroundBlur_1197_305"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function IconNavigatePin({ className }: { className?: string }) {
  return <BrandSymbolIcon className={className} width={48} height={48} />;
}

export function BrandSymbolIcon({
  className,
  width = 80,
  height = 80,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <div
      className={[brandSymbolRoot, className].filter(Boolean).join(" ")}
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-hidden
    >
      <svg
        className={brandSymbolBase}
        viewBox="0 0 59.2 71.05"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>ZimDUGO 심볼</title>
        <path
          d="M59.2 10.0333C59.2 10.0333 59.2 10.3 59.2 10.4333C59.2 12 58.8667 13.4667 58.3 14.8L58.2 15.0333L35.0667 67.5C33 72.2333 26.3 72.2333 24.2 67.5L10.1333 35.6667L30.1 26.0667C31.4 28.4 33.9333 30.0333 36.8333 30.0333C41.2667 30.0333 44.8 26.3 44.5333 21.8333C44.3 18 41.1667 14.8667 37.3333 14.6333C32.8667 14.3667 29.1333 17.9 29.1333 22.3333C29.1333 22.7333 29.1333 23.1333 29.2333 23.5333L6.66667 27.8667L0.966667 15C0.333334 13.6 0 12.0667 0 10.4667C0 10.3333 0 10.2 0 10.0667C0 9.96667 0 9.86667 0 9.8C0 6.13333 2.03333 2.9 5 1.23333C5 1.23333 5 1.23333 5.03333 1.23333C5.46667 1 5.9 0.8 6.36667 0.6C7.43333 0.2 8.6 0 9.8 0C10.7 0 11.6 0.133333 12.4333 0.366667C12.8333 0.466667 14.2333 0.933334 14.6333 1.1C15.6667 1.46667 15.9333 1.56667 16.4333 1.76667C24.6 5 34.1667 4.93333 42.4667 1.73333L45.8667 0.666666C46.9333 0.266666 48.1 0.0333333 49.3333 0.0333333C51.1333 0.0333333 52.8 0.5 54.2667 1.33333C57.2 3.03333 59.2 6.2 59.2 9.86667C59.2 9.96667 59.2 10.0667 59.2 10.1333V10.0333Z"
          fill={color.palette.green[500]}
        />
      </svg>
    </div>
  );
}

export function BrandTextLogoLarge({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 158 28"
      width="158"
      height="28"
      role="img"
      aria-label="ZimDUGO 텍스트 로고"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>ZimDUGO</title>
      <text
        x="0"
        y="24"
        fontFamily="'Metropolis', sans-serif"
        fontWeight={typography.fontWeight.Bold}
        fontSize="32"
        letterSpacing="0"
      >
        <tspan fill={color.palette.gray[800]}>Zim</tspan>
        <tspan fill={color.palette.green[500]}>DUGO</tspan>
      </text>
    </svg>
  );
}

export function BrandTextLogoSmall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 78 16"
      width="78"
      height="16"
      role="img"
      aria-label="ZimDUGO 텍스트 로고 (소)"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <title>ZimDUGO</title>
      <text
        x="0"
        y="13"
        fontFamily="'Metropolis', sans-serif"
        fontWeight={typography.fontWeight.Bold}
        fontSize={typography.fontSize[16]}
        letterSpacing="0"
      >
        <tspan fill={color.palette.gray[800]}>Zim</tspan>
        <tspan fill={color.palette.green[500]}>DUGO</tspan>
      </text>
    </svg>
  );
}

export function IconNaver19({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 19 19.2988"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={19}
      height={19}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>네이버</title>
      <path
        d="M12.8828 10.169L5.83933 0H0V19H6.11642V8.83183L13.1607 19H19V0H12.8828V10.169Z"
        fill={color.palette.gray[100]}
      />
    </svg>
  );
}

export function IconKakao24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>카카오</title>
      <path
        d="M12.499 2C18.299 2 23 5.664 23 10.185C23 14.705 18.299 18.369 12.5 18.369C11.9226 18.368 11.3458 18.3312 10.773 18.259L6.365 21.142C5.864 21.407 5.687 21.378 5.893 20.729L6.785 17.051C3.905 15.591 2 13.061 2 10.185C2 5.665 6.7 2 12.5 2M18.408 10.06L19.878 8.636C19.9628 8.54791 20.0101 8.43033 20.01 8.30804C20.0098 8.18575 19.9622 8.06829 19.8772 7.98041C19.7922 7.89252 19.6763 7.84107 19.5541 7.83689C19.4319 7.83271 19.3128 7.87613 19.222 7.958L17.294 9.824V8.282C17.294 8.15682 17.2443 8.03676 17.1558 7.94825C17.0672 7.85973 16.9472 7.81 16.822 7.81C16.6968 7.81 16.5768 7.85973 16.4882 7.94825C16.3997 8.03676 16.35 8.15682 16.35 8.282V10.839C16.3334 10.9121 16.3334 10.9879 16.35 11.061V12.5C16.35 12.6252 16.3997 12.7452 16.4882 12.8338C16.5768 12.9223 16.6968 12.972 16.822 12.972C16.9472 12.972 17.0672 12.9223 17.1558 12.8338C17.2443 12.7452 17.294 12.6252 17.294 12.5V11.137L17.721 10.724L19.149 12.757C19.1847 12.8078 19.23 12.851 19.2823 12.8842C19.3347 12.9175 19.3931 12.9401 19.4542 12.9508C19.5153 12.9615 19.5779 12.96 19.6384 12.9465C19.699 12.933 19.7562 12.9077 19.807 12.872C19.8578 12.8363 19.901 12.791 19.9342 12.7387C19.9675 12.6863 19.9901 12.6279 20.0008 12.5668C20.0115 12.5057 20.01 12.4431 19.9965 12.3826C19.983 12.322 19.9577 12.2648 19.922 12.214L18.408 10.06ZM15.45 11.984H13.99V8.297C13.9844 8.17571 13.9323 8.06123 13.8445 7.97737C13.7567 7.89351 13.6399 7.84672 13.5185 7.84672C13.3971 7.84672 13.2803 7.89351 13.1925 7.97737C13.1047 8.06123 13.0526 8.17571 13.047 8.297V12.456C13.047 12.716 13.257 12.928 13.518 12.928H15.45C15.5752 12.928 15.6952 12.8783 15.7838 12.7898C15.8723 12.7012 15.922 12.5812 15.922 12.456C15.922 12.3308 15.8723 12.2108 15.7838 12.1222C15.6952 12.0337 15.5752 11.984 15.45 11.984ZM9.593 10.893L10.289 9.185L10.927 10.892L9.593 10.893ZM12.116 11.38L12.118 11.364C12.1177 11.2451 12.0723 11.1308 11.991 11.044L10.945 8.244C10.9012 8.11057 10.8176 7.99369 10.7056 7.90899C10.5936 7.8243 10.4583 7.7758 10.318 7.77C10.1768 7.76994 10.0388 7.81259 9.92227 7.89237C9.80573 7.97215 9.71605 8.08531 9.665 8.217L8.003 12.292C7.95566 12.4079 7.9563 12.5379 8.00478 12.6533C8.05325 12.7687 8.1456 12.8602 8.2615 12.9075C8.3774 12.9548 8.50736 12.9542 8.62279 12.9057C8.73822 12.8572 8.82966 12.7649 8.877 12.649L9.209 11.836H11.279L11.577 12.636C11.5973 12.6958 11.6295 12.7509 11.6715 12.7981C11.7135 12.8452 11.7645 12.8835 11.8216 12.9105C11.8787 12.9376 11.9406 12.9529 12.0037 12.9557C12.0668 12.9584 12.1298 12.9484 12.189 12.9263C12.2481 12.9042 12.3023 12.8704 12.3482 12.8271C12.3941 12.7837 12.4308 12.7315 12.4561 12.6737C12.4815 12.6158 12.495 12.5535 12.4958 12.4903C12.4967 12.4272 12.4848 12.3645 12.461 12.306L12.116 11.38ZM8.793 8.302C8.79326 8.24003 8.78127 8.17861 8.7577 8.12129C8.73414 8.06397 8.69947 8.01188 8.6557 7.96801C8.61192 7.92414 8.5599 7.88936 8.50263 7.86568C8.44536 7.84199 8.38397 7.82987 8.322 7.83H5.077C4.95182 7.83 4.83176 7.87973 4.74325 7.96825C4.65473 8.05676 4.605 8.17682 4.605 8.302C4.605 8.42718 4.65473 8.54724 4.74325 8.63575C4.83176 8.72427 4.95182 8.774 5.077 8.774H6.237V12.51C6.237 12.6352 6.28673 12.7552 6.37525 12.8438C6.46376 12.9323 6.58382 12.982 6.709 12.982C6.83418 12.982 6.95424 12.9323 7.04275 12.8438C7.13127 12.7552 7.181 12.6352 7.181 12.51V8.774H8.321C8.38306 8.77426 8.44455 8.76224 8.50194 8.73861C8.55932 8.71498 8.61146 8.68023 8.65534 8.63634C8.69923 8.59246 8.73398 8.54032 8.75761 8.48294C8.78124 8.42555 8.79326 8.36406 8.793 8.302Z"
        fill={color.palette.gray[800]}
      />
    </svg>
  );
}

export function IconGoogle24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>구글</title>
      <path
        d="M11.99 13.9V10.18H21.35C21.49 10.81 21.6 11.4 21.6 12.23C21.6 17.94 17.77 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C14.7 2 16.96 2.99 18.69 4.61L15.85 7.37C15.13 6.69 13.87 5.89 12 5.89C8.69 5.89 5.99 8.64 5.99 12.01C5.99 15.38 8.69 18.13 12 18.13C15.83 18.13 17.24 15.48 17.5 13.91H11.99V13.9Z"
        fill={color.palette.gray[100]}
      />
    </svg>
  );
}

export function IconX16({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>닫기</title>
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke={color.palette.gray[500]}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconX24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>닫기</title>
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke={color.palette.gray[500]}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// 1차 검수 완료 (26.04.21)
export function IconFilter14({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>필터</title>
      <path
        d="M2.78047 10.6667C3.05503 9.88987 3.79585 9.33333 4.66667 9.33333C5.53747 9.33333 6.27833 9.88987 6.55287 10.6667H13.3333V12H6.55287C6.27833 12.7768 5.53747 13.3333 4.66667 13.3333C3.79585 13.3333 3.05503 12.7768 2.78047 12H0V10.6667H2.78047ZM6.78047 6C7.055 5.22321 7.79587 4.66667 8.66667 4.66667C9.53747 4.66667 10.2783 5.22321 10.5529 6H13.3333V7.33333H10.5529C10.2783 8.11013 9.53747 8.66667 8.66667 8.66667C7.79587 8.66667 7.055 8.11013 6.78047 7.33333H0V6H6.78047ZM2.78047 1.33333C3.05503 0.55654 3.79585 0 4.66667 0C5.53747 0 6.27833 0.55654 6.55287 1.33333H13.3333V2.66667H6.55287C6.27833 3.44346 5.53747 4 4.66667 4C3.79585 4 3.05503 3.44346 2.78047 2.66667H0V1.33333H2.78047ZM4.66667 2.66667C5.03485 2.66667 5.33333 2.36819 5.33333 2C5.33333 1.63181 5.03485 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2C4 2.36819 4.29848 2.66667 4.66667 2.66667ZM8.66667 7.33333C9.03487 7.33333 9.33333 7.03487 9.33333 6.66667C9.33333 6.29847 9.03487 6 8.66667 6C8.29847 6 8 6.29847 8 6.66667C8 7.03487 8.29847 7.33333 8.66667 7.33333ZM4.66667 12C5.03485 12 5.33333 11.7015 5.33333 11.3333C5.33333 10.9651 5.03485 10.6667 4.66667 10.6667C4.29848 10.6667 4 10.9651 4 11.3333C4 11.7015 4.29848 12 4.66667 12Z"
        fill="var(--icon-default, #8E8E8E)"
      />
    </svg>
  );
}

export function IconFilter20({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      width="20"
      height="20"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>filter</title>
      <path
        d="M2.78047 10.6667C3.05503 9.88987 3.79585 9.33333 4.66667 9.33333C5.53747 9.33333 6.27833 9.88987 6.55287 10.6667H13.3333V12H6.55287C6.27833 12.7768 5.53747 13.3333 4.66667 13.3333C3.79585 13.3333 3.05503 12.7768 2.78047 12H0V10.6667H2.78047ZM6.78047 6C7.055 5.22321 7.79587 4.66667 8.66667 4.66667C9.53747 4.66667 10.2783 5.22321 10.5529 6H13.3333V7.33333H10.5529C10.2783 8.11013 9.53747 8.66667 8.66667 8.66667C7.79587 8.66667 7.055 8.11013 6.78047 7.33333H0V6H6.78047ZM2.78047 1.33333C3.05503 0.55654 3.79585 0 4.66667 0C5.53747 0 6.27833 0.55654 6.55287 1.33333H13.3333V2.66667H6.55287C6.27833 3.44346 5.53747 4 4.66667 4C3.79585 4 3.05503 3.44346 2.78047 2.66667H0V1.33333H2.78047ZM4.66667 2.66667C5.03485 2.66667 5.33333 2.36819 5.33333 2C5.33333 1.63181 5.03485 1.33333 4.66667 1.33333C4.29848 1.33333 4 1.63181 4 2C4 2.36819 4.29848 2.66667 4.66667 2.66667ZM8.66667 7.33333C9.03487 7.33333 9.33333 7.03487 9.33333 6.66667C9.33333 6.29847 9.03487 6 8.66667 6C8.29847 6 8 6.29847 8 6.66667C8 7.03487 8.29847 7.33333 8.66667 7.33333ZM4.66667 12C5.03485 12 5.33333 11.7015 5.33333 11.3333C5.33333 10.9651 5.03485 10.6667 4.66667 10.6667C4.29848 10.6667 4 10.9651 4 11.3333C4 11.7015 4.29848 12 4.66667 12Z"
        fill="var(--icon-default, #8E8E8E)"
      />
    </svg>
  );
}

export function IconCircleboxFilter28({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        width: "28px",
        height: "28px",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <IconFilter14 />
    </div>
  );
}

// 1차 검수 완료 (26.04.22)
export function IconNormalMapPin24({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active" | "fill";
}) {
  if (state === "active") {
    return (
      <svg
        className={[iconSvgFixed, className].filter(Boolean).join(" ")}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        aria-hidden
      >
        <title>지도 핀</title>
        <path
          d="M18.364 17.364L12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364Z"
          fill={color.palette.gray[100]}
        />
        <path
          d="M12 23.7279L18.364 17.364C21.8787 13.8492 21.8787 8.15076 18.364 4.63604C14.8492 1.12132 9.15076 1.12132 5.63604 4.63604C2.12132 8.15076 2.12132 13.8492 5.63604 17.364L12 23.7279ZM12 20.8995L7.05025 15.9497C4.33103 13.2304 4.33103 8.76959 7.05025 6.05025C9.76959 3.33103 14.2304 3.33103 16.9497 6.05025C19.669 8.76959 19.669 13.2304 16.9497 15.9497L12 20.8995Z"
          fill={color.palette.gray[600]}
        />
        <path
          d="M12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15ZM12 13C10.8954 13 10 12.1046 10 11C10 9.89543 10.8954 9 12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13Z"
          fill={color.palette.gray[600]}
        />
      </svg>
    );
  }

  const fill =
    state === "fill" ? color.palette.green[500] : color.palette.gray[800];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>지도 핀</title>
      <path
        d="M18.364 17.364L12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364ZM12 15C14.2091 15 16 13.2091 16 11C16 8.79086 14.2091 7 12 7C9.79086 7 8 8.79086 8 11C8 13.2091 9.79086 15 12 15ZM12 13C10.8954 13 10 12.1046 10 11C10 9.89543 10.8954 9 12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNavigationMapPin24({ className }: { className?: string }) {
  return <IconNormalMapPin24 className={className} state="active" />;
}

export function IconNavigationMapPin24Fill({
  className,
}: {
  className?: string;
}) {
  return <IconNormalMapPin24 className={className} state="fill" />;
}

export function IconNavigationCrosshair24({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active" | "denied";
}) {
  const fill =
    state === "active"
      ? color.palette.green[500]
      : state === "denied"
        ? color.palette.gray[500]
        : color.palette.gray[800];

  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>지도 십자선</title>
      <path
        d="M10 4.07089C6.93431 4.5094 4.5094 6.93431 4.07089 10H6V12H4.07089C4.5094 15.0657 6.93431 17.4906 10 17.9291V16H12V17.9291C15.0657 17.4906 17.4906 15.0657 17.9291 12H16V10H17.9291C17.4906 6.93431 15.0657 4.5094 12 4.07089V6H10V4.07089ZM2.05493 10C2.51608 5.82838 5.82838 2.51608 10 2.05493V0H12V2.05493C16.1716 2.51608 19.4839 5.82838 19.9451 10H22V12H19.9451C19.4839 16.1716 16.1716 19.4839 12 19.9451V22H10V19.9451C5.82838 19.4839 2.51608 16.1716 2.05493 12H0V10H2.05493ZM13 11C13 12.1046 12.1046 13 11 13C9.8954 13 9 12.1046 9 11C9 9.8954 9.8954 9 11 9C12.1046 9 13 9.8954 13 11Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNavigationNavigate24({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active";
}) {
  const fill = color.palette.gray[800];
  return state === "active" ? (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>네비게이트 활성</title>
      <path
        d="M0.658236 0.025659L19.464 6.29425C19.726 6.38157 19.8676 6.66474 19.7803 6.92671C19.7338 7.06623 19.6282 7.17821 19.4916 7.23283L10.759 10.7259L6.3338 19.5762C6.2103 19.8232 5.90997 19.9233 5.66298 19.7998C5.53762 19.7371 5.44432 19.6247 5.40582 19.4899L0.0193663 0.637359C-0.0564937 0.371839 0.0972463 0.0950991 0.362766 0.0192391C0.459656 -0.00844092 0.562646 -0.00621103 0.658236 0.025659Z"
        fill={fill}
      />
    </svg>
  ) : (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>네비게이트</title>
      <path
        d="M2.72367 2.82233L6.26949 15.2327L9.31019 9.15137L14.9468 6.8967L2.72367 2.82233ZM0.658236 0.0256556L19.464 6.29426C19.726 6.38158 19.8676 6.66474 19.7803 6.92671C19.7338 7.06624 19.6282 7.17822 19.4916 7.23284L10.759 10.7259L6.3338 19.5762C6.2103 19.8232 5.90997 19.9233 5.66298 19.7998C5.53762 19.7371 5.44432 19.6247 5.40582 19.49L0.0193663 0.637365C-0.0564937 0.371845 0.0972463 0.0951055 0.362766 0.0192355C0.459656 -0.00844449 0.562646 -0.00620435 0.658236 0.0256556Z"
        fill={fill}
      />
    </svg>
  );
}

function IconNavigationRefresh({
  className,
  size,
  state = "default",
}: {
  className?: string;
  size: 20 | 24;
  state?: "default" | "active";
}) {
  const fill =
    state === "active" ? color.palette.gray[800] : color.palette.gray[500];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>새로고침</title>
      <path
        d="M20 10C20 15.5228 15.5228 20 10 20C6.72774 20 3.82382 18.4286 2 16.001V18.5H0V12.5H6V14.5H3.38477C4.82543 16.6137 7.25151 18 10 18C14.4183 18 18 14.4183 18 10H20ZM10 0C13.2723 0 16.1762 1.57144 18 3.99902V1.5H20V7.5H14V5.5H16.6152C15.1746 3.38634 12.7485 2 10 2C5.58172 2 2 5.58172 2 10H0C0 4.47715 4.47715 0 10 0Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNavigationRefresh20({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active";
}) {
  return (
    <IconNavigationRefresh className={className} size={20} state={state} />
  );
}

export function IconNavigationClock24({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active";
}) {
  const fill = color.palette.gray[800];
  return state === "active" ? (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>시계 활성</title>
      <path
        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM13 12V7H11V14H17V12H13Z"
        fill={fill}
      />
    </svg>
  ) : (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>시계</title>
      <path
        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H17V14H11V7H13V12Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNormalWallet24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>지갑</title>
      <path
        d="M20 3H13C9.68632 3 7 5.68629 7 9.00001C7 12.3137 9.68632 15 13 15H20V17C20 17.5523 19.5523 18 19 18H1C0.44772 18 0 17.5523 0 17V1C0 0.44771 0.44772 0 1 0H19C19.5523 0 20 0.44771 20 1V3ZM13 5H21V13H13C10.7908 13 9.00002 11.2091 9.00002 9.00001C9.00002 6.79086 10.7908 5 13 5ZM13 8.00001V10H16V8.00001H13Z"
        fill={color.palette.gray[500]}
        transform="translate(2 3)"
      />
    </svg>
  );
}

export function IconNormalCapacity24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={27}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>용량</title>
      <path
        d="M3.24128 4.88383C3.24128 4.10666 3.5486 3.36133 4.09564 2.81179C4.64268 2.26226 5.38463 1.95353 6.15826 1.95353C6.93189 1.95353 7.67383 2.26226 8.22087 2.81179C8.76791 3.36133 9.07523 4.10666 9.07523 4.88383V6.18618C9.80901 6.18618 10.452 6.18878 11.0199 6.20571V4.88383C11.0199 3.58855 10.5077 2.34633 9.59594 1.43044C8.68421 0.514544 7.44764 0 6.15826 0C4.86887 0 3.6323 0.514544 2.72057 1.43044C1.80884 2.34633 1.29663 3.58855 1.29663 4.88383V6.20571C1.86447 6.18878 2.5075 6.18618 3.24128 6.18618V4.88383ZM1.3096 12.5378C1.35189 12.2822 1.49352 12.0539 1.70334 11.9032C1.80723 11.8286 1.92474 11.7753 2.04915 11.7463C2.17356 11.7173 2.30243 11.7132 2.42842 11.7342C2.5544 11.7552 2.67503 11.801 2.78341 11.8689C2.89179 11.9367 2.98581 12.0254 3.06008 12.1297C3.13436 12.2341 3.18745 12.3522 3.21631 12.4771C3.24518 12.6021 3.24926 12.7316 3.22832 12.8581L1.93188 20.6723C1.91094 20.7988 1.86539 20.92 1.79783 21.0289C1.73027 21.1377 1.64203 21.2322 1.53814 21.3068C1.43425 21.3814 1.31674 21.4348 1.19233 21.4637C1.06792 21.4927 0.939046 21.4968 0.813061 21.4758C0.687076 21.4548 0.56645 21.409 0.458068 21.3411C0.349687 21.2733 0.255674 21.1846 0.181396 21.0803C0.107118 20.9759 0.0540314 20.8579 0.0251658 20.7329C-0.00369989 20.6079 -0.00777834 20.4784 0.0131624 20.3519L1.3096 12.5378ZM9.88809 11.7342C10.0141 11.7131 10.143 11.7172 10.2674 11.7462C10.3918 11.7752 10.5093 11.8285 10.6132 11.9031C10.7171 11.9778 10.8054 12.0722 10.8729 12.1811C10.9405 12.29 10.986 12.4112 11.0069 12.5378L12.3033 20.3519C12.3243 20.4784 12.3202 20.6079 12.2913 20.7329C12.2625 20.8579 12.2094 20.9759 12.1351 21.0803C12.0608 21.1846 11.9668 21.2733 11.8584 21.3411C11.7501 21.409 11.6294 21.4548 11.5034 21.4758C11.3775 21.4968 11.2486 21.4927 11.1242 21.4637C10.9998 21.4348 10.8823 21.3814 10.7784 21.3068C10.6745 21.2322 10.5862 21.1377 10.5187 21.0289C10.4511 20.92 10.4056 20.7988 10.3846 20.6723L9.0882 12.8581C9.06723 12.7316 9.07129 12.6021 9.10014 12.4771C9.129 12.3521 9.18208 12.2341 9.25636 12.1297C9.33064 12.0253 9.42467 11.9367 9.53306 11.8688C9.64146 11.801 9.7621 11.7552 9.88809 11.7342Z"
        fill={color.palette.gray[500]}
        transform="translate(5.842 0)"
      />
      <path
        d="M1.73549 6.37372C2.30463 3.32621 2.58854 1.80115 3.66847 0.899926C4.7497 0 6.29245 0 9.38056 0H14.6181C17.7075 0 19.2503 0 20.3315 0.899926C21.4115 1.80115 21.6954 3.32491 22.2645 6.37372L23.2368 11.5831C24.0367 15.8705 24.4373 18.0142 23.2705 19.4259C22.1038 20.8377 19.9335 20.8377 15.5918 20.8377H8.40823C4.06648 20.8377 1.89495 20.8377 0.729459 19.4259C-0.437331 18.0142 -0.0367333 15.8705 0.763166 11.5831L1.73549 6.37372Z"
        fill={color.palette.gray[500]}
        opacity="0.5"
        transform="translate(0 6.161)"
      />
    </svg>
  );
}

export function IconLockerDetailMapPin24({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>위치</title>
      <path
        d="M2.63106 2.63309C6.14199 -0.877841 11.8347 -0.877553 15.3459 2.63309C18.8569 6.14417 18.8569 11.8367 15.3459 15.3479L8.98848 21.7054L2.63106 15.3479C1.84718 14.5639 1.2387 13.671 0.804891 12.7181L9.44747 9.17606C9.92623 10.0151 10.8406 10.5723 11.8752 10.554C13.3854 10.5272 14.6003 9.27661 14.5734 7.74931L14.5852 7.74833C14.5581 6.23299 13.2995 5.01363 11.7893 5.04032C10.2791 5.06715 9.06404 6.31858 9.09102 7.84599C9.09356 7.98907 9.10771 8.13202 9.13399 8.2747L0.0539143 9.97587C-0.232921 7.35876 0.624569 4.63959 2.63106 2.63309Z"
        fill="currentColor"
        transform="translate(3 1)"
      />
    </svg>
  );
}

export function IconLockerDetailWallet24({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>가격</title>
      <path
        d="M9.71481 0.0295107C10.3634 -0.0835031 11.0259 0.13221 11.4813 0.605701L21.4521 10.9787C22.2058 11.7627 22.1785 13.0061 21.3911 13.7563L13.3097 21.4546C12.522 22.2048 11.2724 22.1778 10.5187 21.3938L0.547095 11.0208C0.0919964 10.5472 -0.0954629 9.87855 0.0465448 9.23858L1.49838 2.69679C1.67087 1.91959 2.29704 1.32284 3.08458 1.18537L9.71481 0.0295107ZM9.03816 5.20674C8.0672 4.28146 6.52651 4.31443 5.59673 5.28065C4.66693 6.2473 4.69985 7.78207 5.67092 8.70767C6.64204 9.633 8.18333 9.59907 9.11304 8.63248C10.0425 7.66588 10.0089 6.13226 9.03816 5.20674Z"
        fill="currentColor"
        transform="translate(1 1)"
      />
    </svg>
  );
}

export function IconLockerDetailCapacity24({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 41 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>보관함 크기</title>
      <path
        d="M20.5 0C22.559 2.46477e-05 24.3005 0.704021 25.7241 2.11267C27.1478 3.52147 27.8595 5.24544 27.8595 7.28312V8.73742C31.6836 10.2093 34.8299 12.6267 37.2965 15.9896C39.7654 19.3526 41 23.2131 41 27.5702V52.5389C41 54.0939 40.4736 55.3925 39.4216 56.4339C38.3693 57.4752 37.0542 57.9976 35.4781 58H5.52184C3.94806 58 2.63453 57.4788 1.58225 56.4377C0.529926 55.3963 0.00227776 54.0964 0 52.5389V42.2919L20.2959 33.3474C21.2895 35.2476 23.2256 36.5324 25.4418 36.5326C28.6769 36.5326 31.3265 33.7763 31.3267 30.3502H31.3525C31.3525 26.9509 28.7028 24.1664 25.4675 24.1664C22.2321 24.1667 19.5824 26.9242 19.5824 30.3502C19.5825 30.6713 19.6085 30.9923 19.6594 31.3132L0 36.2497V27.5702C0 23.2131 1.23454 19.3526 3.70347 15.9896C6.17028 12.6266 9.31616 10.2097 13.1405 8.73999V7.28312C13.1405 5.24544 13.8522 3.52147 15.2759 2.11267C16.6994 0.704052 18.441 0 20.5 0ZM20.5 3.38052C19.4021 3.37827 18.4703 3.75761 17.705 4.51722C16.9397 5.27684 16.5565 6.19893 16.5565 7.28312L16.5603 7.75245C17.2301 7.59468 17.8866 7.47804 18.5289 7.40141C19.1733 7.32256 19.8305 7.28312 20.5 7.28312C21.1695 7.28312 21.8265 7.32094 22.4711 7.39755C23.1155 7.47418 23.7728 7.59247 24.4422 7.75245V7.28312C24.4422 6.19448 24.0602 5.27231 23.2949 4.51722C22.5296 3.76212 21.5978 3.38282 20.5 3.38052Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconNavigationPushPin24({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active";
}) {
  const fill = color.palette.gray[800];
  return state === "active" ? (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>압정 활성</title>
      <path
        d="M19.0919 8.4853L17.6777 9.8995L16.9706 9.1924L12.7279 13.435L12.0208 16.9706L10.6066 18.3848L6.36396 14.1421L1.41422 19.0919L0 17.6777L4.94975 12.7279L0.70711 8.4853L2.12132 7.07107L5.65686 6.36396L9.8995 2.12132L9.1924 1.41422L10.6066 0L19.0919 8.4853Z"
        fill={fill}
      />
    </svg>
  ) : (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>압정</title>
      <path
        d="M10.6066 0L19.0919 8.4853L17.6777 9.8995L16.9706 9.1924L12.7279 13.435L12.0208 16.9706L10.6066 18.3848L6.36396 14.1421L1.41422 19.0919L0 17.6777L4.94975 12.7279L0.70711 8.4853L2.12132 7.07107L5.65686 6.36396L9.8995 2.12132L9.1924 1.41422L10.6066 0ZM11.3137 3.53554L6.64288 8.20637L3.821 8.7707L10.3211 15.2709L10.8855 12.449L15.5564 7.77818L11.3137 3.53554Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNormalArrow24({
  className,
  direction = "left",
  size = 24,
  tone = "default",
}: {
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  size?: 16 | 24;
  tone?: "default" | "active";
}) {
  const rotation =
    direction === "up"
      ? "90deg"
      : direction === "down"
        ? "-90deg"
        : direction === "right"
          ? "180deg"
          : "0deg";

  const strokeColor =
    tone === "active" ? color.palette.green[500] : color.palette.gray[700];

  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      style={{ transform: `rotate(${rotation})`, overflow: "visible" }}
      aria-hidden
    >
      <title>화살표</title>
      <path
        d="M2.8284 6.36398L7.7782 11.3137L6.364 12.7279L0 6.36398L6.364 0L7.7782 1.41421L2.8284 6.36398Z"
        fill={strokeColor}
        transform="translate(8.111 5.636)"
      />
    </svg>
  );
}

export function IconChevronLeft13({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 10 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={10}
      height={20}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>검색창 뒤로가기 버튼</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18.7506L8.83872 20L0.319686 10.8353C0.114657 10.6114 0 10.3118 0 10C0 9.68817 0.114657 9.38859 0.319686 9.16471L8.83872 0L10 1.25059L1.86769 10L10 18.7506Z"
        fill={color.palette.gray[500]}
      />
    </svg>
  );
}

export function IconCheck24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>체크</title>
      <path
        d="M17.642 0.25267C17.84 0.428853 17.96 0.676424 17.9755 0.940994C17.9911 1.20556 17.901 1.46549 17.725 1.66367L7.05902 13.6637C6.9652 13.7692 6.85008 13.8538 6.72124 13.9116C6.5924 13.9695 6.45276 13.9994 6.31152 13.9994C6.17028 13.9994 6.03064 13.9695 5.9018 13.9116C5.77296 13.8538 5.65784 13.7692 5.56402 13.6637L0.231018 7.66367C0.0651361 7.46413 -0.016686 7.20792 0.00283604 6.94917C0.022358 6.69042 0.141695 6.44939 0.335638 6.27699C0.529581 6.1046 0.782941 6.01434 1.0422 6.02529C1.30145 6.03624 1.5463 6.14754 1.72502 6.33567L6.31102 11.4947L16.231 0.33467C16.4073 0.136826 16.655 0.0170611 16.9195 0.00168594C17.1841 -0.0136893 17.444 0.0765821 17.642 0.25267Z"
        fill={color.palette.green[500]}
        transform="translate(3 5)"
      />
    </svg>
  );
}

export function IconCamera24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>카메라</title>
      <path
        d="M8.76524 18.9874H13.2092C16.3302 18.9874 17.8912 18.9874 19.0122 18.2524C19.4961 17.9355 19.9127 17.5264 20.2382 17.0484C20.9872 15.9484 20.9872 14.4154 20.9872 11.3514C20.9872 8.28735 20.9872 6.75435 20.2382 5.65435C19.9127 5.17635 19.4961 4.76721 19.0122 4.45035C18.2922 3.97735 17.3902 3.80835 16.0092 3.74835C15.3502 3.74835 14.7832 3.25835 14.6542 2.62335C14.5557 2.15822 14.2995 1.74139 13.9291 1.4433C13.5587 1.14522 13.0967 0.98416 12.6212 0.987351H9.35324C8.36524 0.987351 7.51424 1.67235 7.32024 2.62335C7.19124 3.25835 6.62424 3.74835 5.96524 3.74835C4.58524 3.80835 3.68324 3.97835 2.96224 4.45035C2.47878 4.76731 2.06252 5.17644 1.73724 5.65435C0.987244 6.75435 0.987244 8.28635 0.987244 11.3514C0.987244 14.4164 0.987244 15.9474 1.73624 17.0484C2.06024 17.5244 2.47624 17.9334 2.96224 18.2524C4.08324 18.9874 5.64424 18.9874 8.76524 18.9874Z"
        transform="translate(1 2)"
        stroke={color.icon.default}
        strokeWidth="1.975"
      />
      <path
        d="M3.98724 6.9873C5.6441 6.9873 6.98724 5.64416 6.98724 3.9873C6.98724 2.33045 5.6441 0.987305 3.98724 0.987305C2.33039 0.987305 0.987244 2.33045 0.987244 3.9873C0.987244 5.64416 2.33039 6.9873 3.98724 6.9873Z"
        transform="translate(8 9)"
        stroke={color.icon.default}
        strokeWidth="1.975"
      />
      <path
        d="M1.98724 0.987305H0.987244"
        transform="translate(16.7 9)"
        stroke={color.icon.default}
        strokeWidth="1.975"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMenuHome({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  const fill = isActive ? color.palette.gray[800] : color.palette.gray[600];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 18 18.7332"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18.7332}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>menu.home</title>
      {isActive ? (
        <path
          d="M18 17.7332C18 18.2855 17.5523 18.7332 17 18.7332H1C0.44772 18.7332 0 18.2855 0 17.7332V7.22223C0 6.91364 0.14247 6.62233 0.38606 6.43288L8.3861 0.210645C8.7472 -0.070215 9.2528 -0.070215 9.6139 0.210645L17.6139 6.43288C17.8575 6.62233 18 6.91364 18 7.22223V17.7332ZM8 10.7332V16.7332H10V10.7332H8Z"
          fill={fill}
        />
      ) : (
        <path
          d="M10 16.7332H16V7.71131L9 2.26687L2 7.71131V16.7332H8V10.7332H10V16.7332ZM18 17.7332C18 18.2855 17.5523 18.7332 17 18.7332H1C0.44772 18.7332 0 18.2855 0 17.7332V7.22223C0 6.91364 0.14247 6.62233 0.38606 6.43288L8.3861 0.210645C8.7472 -0.070215 9.2528 -0.070215 9.6139 0.210645L17.6139 6.43288C17.8575 6.62233 18 6.91364 18 7.22223V17.7332Z"
          fill={fill}
        />
      )}
    </svg>
  );
}

function IconMenuReport({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  const fill = isActive ? color.palette.green[500] : color.palette.gray[600];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 17.76 21.315"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={17.76}
      height={21.315}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>menu.report</title>
      <path
        d="M17.76 3.01C17.76 3.01 17.76 3.09 17.76 3.13C17.76 3.6 17.66 4.04 17.49 4.44L17.46 4.51L10.52 20.25C9.9 21.67 7.89 21.67 7.26 20.25L3.04 10.7L9.03 7.82C9.42 8.52 10.18 9.01 11.05 9.01C12.38 9.01 13.44 7.89 13.36 6.55C13.29 5.4 12.35 4.46 11.2 4.39C9.86 4.31 8.74 5.37 8.74 6.7C8.74 6.82 8.74 6.94 8.77 7.06L2 8.36L0.29 4.5C0.1 4.08 0 3.62 0 3.14C0 3.1 0 3.06 0 3.02C0 2.99 0 2.96 0 2.94C0 1.84 0.61 0.87 1.5 0.37C1.5 0.37 1.5 0.37 1.51 0.37C1.64 0.3 1.77 0.24 1.91 0.18C2.23 0.06 2.58 0 2.94 0C3.21 0 3.48 0.04 3.73 0.11C3.85 0.14 4.27 0.28 4.39 0.33C4.7 0.44 4.78 0.47 4.93 0.53C7.38 1.5 10.25 1.48 12.74 0.52L13.76 0.2C14.08 0.0799999 14.43 0.00999999 14.8 0.00999999C15.34 0.00999999 15.84 0.15 16.28 0.4C17.16 0.91 17.76 1.86 17.76 2.96C17.76 2.99 17.76 3.02 17.76 3.04V3.01Z"
        fill={fill}
      />
      {isActive ? (
        <path
          d="M11.35 2.31C11.35 3.59 10.31 4.62 9.04 4.62C8.17 4.62 7.41 4.14 7.02 3.43L1.03 6.32L0.52 5.16L0.4 4.88L0 3.97L6.77 2.67C6.75 2.55 6.74 2.43 6.74 2.31C6.74 1.03 7.78 0 9.05 0C10.32 0 11.36 1.04 11.36 2.31H11.35Z"
          fill={color.palette.gray[100]}
          transform="translate(3.72 4.77)"
        />
      ) : null}
    </svg>
  );
}

function IconMenuMy({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  const fill = isActive ? color.palette.gray[800] : color.palette.gray[600];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 16 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={21}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>menu.my</title>
      {isActive ? (
        <path
          d="M16 21H0V19C0 16.2386 2.23858 14 5 14H11C13.7614 14 16 16.2386 16 19V21ZM8 12C4.68629 12 2 9.3137 2 6C2 2.68629 4.68629 0 8 0C11.3137 0 14 2.68629 14 6C14 9.3137 11.3137 12 8 12Z"
          fill={fill}
        />
      ) : (
        <path
          d="M16 21H14V19C14 17.3431 12.6569 16 11 16H5C3.34315 16 2 17.3431 2 19V21H0V19C0 16.2386 2.23858 14 5 14H11C13.7614 14 16 16.2386 16 19V21ZM8 12C4.68629 12 2 9.3137 2 6C2 2.68629 4.68629 0 8 0C11.3137 0 14 2.68629 14 6C14 9.3137 11.3137 12 8 12ZM8 10C10.2091 10 12 8.20914 12 6C12 3.79086 10.2091 2 8 2C5.79086 2 4 3.79086 4 6C4 8.20914 5.79086 10 8 10Z"
          fill={fill}
        />
      )}
    </svg>
  );
}

function IconMenuSettings({
  isActive,
  className,
}: {
  isActive: boolean;
  className?: string;
}) {
  const fill = isActive ? color.palette.gray[800] : color.palette.gray[600];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 19 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={19}
      height={22}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>menu.settings</title>
      {isActive ? (
        <path
          d="M9.5 0L19 5.5V16.5L9.5 22L0 16.5V5.5L9.5 0ZM9.5 14C11.1569 14 12.5 12.6569 12.5 11C12.5 9.3431 11.1569 8 9.5 8C7.8431 8 6.5 9.3431 6.5 11C6.5 12.6569 7.8431 14 9.5 14Z"
          fill={fill}
        />
      ) : (
        <path
          d="M9.5 0L19 5.5V16.5L9.5 22L0 16.5V5.5L9.5 0ZM9.5 2.311L2 6.65311V15.3469L9.5 19.689L17 15.3469V6.65311L9.5 2.311ZM9.5 15C7.29086 15 5.5 13.2091 5.5 11C5.5 8.79086 7.29086 7 9.5 7C11.7091 7 13.5 8.79086 13.5 11C13.5 13.2091 11.7091 15 9.5 15ZM9.5 13C10.6046 13 11.5 12.1046 11.5 11C11.5 9.8954 10.6046 9 9.5 9C8.3954 9 7.5 9.8954 7.5 11C7.5 12.1046 8.3954 13 9.5 13Z"
          fill={fill}
        />
      )}
    </svg>
  );
}

export type BottomTabKey = "home" | "report" | "my" | "settings";

export function BottomMenuIcon({
  tab,
  isActive,
  className,
}: {
  tab: BottomTabKey;
  isActive: boolean;
  className?: string;
}) {
  switch (tab) {
    case "home":
      return <IconMenuHome isActive={isActive} className={className} />;
    case "report":
      return <IconMenuReport isActive={isActive} className={className} />;
    case "my":
      return <IconMenuMy isActive={isActive} className={className} />;
    case "settings":
      return <IconMenuSettings isActive={isActive} className={className} />;
  }
}

export function getMenuGroupIcons(
  activeTab: BottomTabKey,
): Record<BottomTabKey, ReactElement> {
  return {
    home: <BottomMenuIcon tab="home" isActive={activeTab === "home"} />,
    report: <BottomMenuIcon tab="report" isActive={activeTab === "report"} />,
    my: <BottomMenuIcon tab="my" isActive={activeTab === "my"} />,
    settings: (
      <BottomMenuIcon tab="settings" isActive={activeTab === "settings"} />
    ),
  };
}

export const BottomTabBarIcon = BottomMenuIcon;

export function IconShare24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>공유</title>
      <path
        d="M9 0L15.2071 6.2071L13.7929 7.62128L10 3.82842V13.4142H8V3.82842L4.20711 7.62128L2.79289 6.2071L9 0ZM0 15.4142V11.4142H2V15.4142C2 15.9665 2.44772 16.4142 3 16.4142H15C15.5523 16.4142 16 15.9665 16 15.4142V11.4142H18V15.4142C18 17.0711 16.6569 18.4142 15 18.4142H3C1.34315 18.4142 0 17.0711 0 15.4142Z"
        fill={color.palette.gray[800]}
        transform="translate(3, 3)"
      />
    </svg>
  );
}

export function IconThumbUp24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>좋아요</title>
      <g transform="translate(1, 1.64)">
        <path
          d="M13.5998 7.36068H20C21.1046 7.36068 22 8.25611 22 9.36065V11.4651C22 11.7263 21.9488 11.985 21.8494 12.2266L18.755 19.7415C18.6007 20.1162 18.2355 20.3607 17.8303 20.3607H1C0.44772 20.3607 0 19.913 0 19.3607V9.36065C0 8.80839 0.44772 8.36068 1 8.36068H4.48184C4.80677 8.36068 5.11143 8.20281 5.29881 7.93736L10.7522 0.211707C10.8947 0.00983761 11.1633 -0.0576704 11.3843 0.0528346L13.1984 0.959862C14.25 1.48569 14.7931 2.67327 14.5031 3.8127L13.5998 7.36068ZM6 9.94815V18.3607H17.1606L20 11.4651V9.36065H13.5998C12.2951 9.36065 11.3398 8.13163 11.6616 6.86726L12.5649 3.31929C12.6229 3.0914 12.5143 2.85388 12.3039 2.74872L11.6428 2.41815L6.93275 9.09073C6.68285 9.44475 6.36341 9.73495 6 9.94815ZM4 10.3607H2V18.3607H4V10.3607Z"
          fill={color.palette.gray[800]}
        />
      </g>
    </svg>
  );
}

export function IconThumbDown24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>싫어요</title>
      <g transform="translate(1, 2)">
        <path
          d="M8.40017 13H2C0.89543 13 0 12.1046 0 11V8.8957C0 8.6344 0.05118 8.3757 0.15064 8.1342L3.24501 0.61925C3.3993 0.24455 3.76447 0 4.16969 0H21C21.5523 0 22 0.44772 22 1V11C22 11.5523 21.5523 12 21 12H17.5182C17.1932 12 16.8886 12.1579 16.7012 12.4233L11.2478 20.149C11.1053 20.3508 10.8367 20.4184 10.6157 20.3078L8.80163 19.4008C7.74998 18.875 7.20687 17.6874 7.49694 16.548L8.40017 13ZM16 10.4125V2H4.83939L2 8.8957V11H8.40017C9.7049 11 10.6602 12.229 10.3384 13.4934L9.4351 17.0414C9.3771 17.2693 9.4857 17.5068 9.6961 17.612L10.3572 17.9425L15.0673 11.27C15.3172 10.9159 15.6366 10.6257 16 10.4125ZM18 10H20V2H18V10Z"
          fill={color.palette.gray[800]}
        />
      </g>
    </svg>
  );
}

export function IconCaution24({
  className,
  state = "correct",
}: {
  className?: string;
  state?: "correct" | "error";
}) {
  const fill =
    state === "correct" ? color.palette.green[500] : color.palette.red[300];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>상태</title>
      <path
        d="M12 8.58275e-07C18.6276 1.43768e-06 24 5.3724 24 12C24 18.6276 18.6276 24 12 24C5.3724 24 4.6967e-07 18.6276 1.04907e-06 12C1.62848e-06 5.3724 5.3724 2.78872e-07 12 8.58275e-07ZM12 2.4C9.45392 2.4 7.01212 3.41143 5.21177 5.21177C3.41143 7.01212 2.4 9.45392 2.4 12C2.4 14.5461 3.41143 16.9879 5.21177 18.7882C7.01212 20.5886 9.45392 21.6 12 21.6C14.5461 21.6 16.9879 20.5886 18.7882 18.7882C20.5886 16.9879 21.6 14.5461 21.6 12C21.6 9.45392 20.5886 7.01212 18.7882 5.21177C16.9879 3.41143 14.5461 2.4 12 2.4ZM13.2 18L10.8 18L10.8 15.6L13.2 15.6L13.2 18ZM13.2 13.2L10.8 13.2L10.8 6L13.2 6L13.2 13.2Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconMarker22({
  className,
  size = 22,
  fill = "green[500]",
}: {
  className?: string;
  size?: 14 | 22 | 24;
  fill?: "green[500]" | "gray[600]";
}) {
  const fillColor =
    fill === "green[500]" ? color.palette.green[500] : color.palette.gray[600];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      aria-hidden
    >
      <title>마커</title>
      <path
        d="M11 0C17.0751 0 22 4.92487 22 11C22 17.0751 17.0751 22 11 22C6.64579 22 2.88256 19.4701 1.09986 15.8L8.22852 12.4284C8.7645 13.385 9.80921 14.032 11.0049 14.0321C12.7503 14.0321 14.1797 12.6437 14.1797 10.9189H14.1935C14.1934 9.20771 12.7641 7.80645 11.0187 7.80645C9.27335 7.80647 7.84401 9.19425 7.84388 10.9189C7.84388 11.0806 7.85799 11.2424 7.88546 11.404L0.156628 12.8587C0.053794 12.2545 0 11.6335 0 11C0 4.92487 4.92487 0 11 0Z"
        fill={fillColor}
      />
    </svg>
  );
}

export function IconPencil24({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      aria-hidden
    >
      <title>수정</title>
      <path
        d="M15.7279 9.57628L14.3137 8.16207L5 17.4758V18.89H6.41421L15.7279 9.57628ZM17.1421 8.16207L18.5563 6.74786L17.1421 5.33364L15.7279 6.74786L17.1421 8.16207ZM7.24264 20.89H3V16.6473L16.435 3.21232C16.8256 2.8218 17.4587 2.8218 17.8492 3.21232L20.6777 6.04075C21.0682 6.43127 21.0682 7.06444 20.6777 7.45496L7.24264 20.89Z"
        fill={color.palette.gray[500]}
      />
    </svg>
  );
}

export function IconAddBox18({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      aria-hidden
    >
      <title>추가</title>
      <path
        d="M8.25 4.5H9.75V8.25H13.5V9.75H9.75V13.5H8.25V9.75H4.5V8.25H8.25V4.5Z"
        fill={color.palette.gray[600]}
      />
    </svg>
  );
}

export function IconMinusBox18({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      aria-hidden
    >
      <title>제거</title>
      <path d="M4.5 8.25H13.5V9.75H4.5V8.25Z" fill={color.palette.gray[600]} />
    </svg>
  );
}

function CircleBox({
  size,
  children,
  className,
  style,
}: {
  size: 24 | 32 | 48;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={[circleBoxRoot, circleBoxSize[size], className]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...style,
      }}
      aria-hidden
    >
      <span className={circleBoxContent}>{children}</span>
    </div>
  );
}

function CircleBoxGlyph({
  children,
  size = 24,
  offsetX = 0,
  offsetY = 0,
}: {
  children: ReactNode;
  size?: 20 | 24;
  offsetX?: number;
  offsetY?: number;
}) {
  return (
    <span
      className={size === 20 ? circleBoxGlyph20 : circleBoxGlyph}
      style={
        offsetX !== 0 || offsetY !== 0
          ? { transform: `translate(${offsetX}px, ${offsetY}px)` }
          : undefined
      }
    >
      {children}
    </span>
  );
}

export function IconNormalProfile({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <IconMarker22 size={22} fill="green[500]" />
    </CircleBox>
  );
}

export function IconThumbnail24({ className }: { className?: string }) {
  return (
    <CircleBox size={24} className={className}>
      <IconMarker22 size={14} fill="gray[600]" className={iconSvgFixed} />
    </CircleBox>
  );
}

type SearchRowMarkerFill = "green[500]" | "gray[600]";

const resolveSearchRowMarkerFill = (isClosed?: boolean): SearchRowMarkerFill =>
  isClosed ? "gray[600]" : "green[500]";

/** 검색 결과 PLACE 행 마커 */
export function IconSearchPlaceRow14({
  className,
  isClosed = false,
}: {
  className?: string;
  isClosed?: boolean;
}) {
  return (
    <IconMarker22
      size={14}
      fill={resolveSearchRowMarkerFill(isClosed)}
      className={className}
    />
  );
}

/** 검색 결과 LOCKER 행 마커 */
export function IconSearchLockerRow14({
  className,
  isClosed = false,
}: {
  className?: string;
  isClosed?: boolean;
}) {
  return (
    <IconMarker22
      size={14}
      fill={resolveSearchRowMarkerFill(isClosed)}
      className={className}
    />
  );
}

/** 검색 자동완성 PLACE 항목 마커 */
export function IconSearchAutocompletePlace14({
  className,
}: {
  className?: string;
}) {
  return <IconMarker22 size={14} className={className} />;
}

/** 검색 자동완성 LOCKER 항목 마커 */
export function IconSearchAutocompleteLocker14({
  className,
}: {
  className?: string;
}) {
  return <IconMarker22 size={14} className={className} />;
}

/** 최근 검색어 목록 썸네일 */
export function IconSearchRecentItem24({ className }: { className?: string }) {
  return <IconThumbnail24 className={className} />;
}

/** 보관함 상세 시트 헤더 썸네일 */
export function IconLockerDetailHeader24({
  className,
}: {
  className?: string;
}) {
  return (
    <CircleBox size={24} className={className}>
      <IconMarker22 size={14} fill="green[500]" className={iconSvgFixed} />
    </CircleBox>
  );
}

export function IconCircleboxClock32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20}>
        <svg
          className={iconSvgFixed}
          viewBox="0 0 20 20"
          width={20}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <title>시계</title>
          <path
            d="M10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19ZM10 17.2C13.9765 17.2 17.2 13.9765 17.2 10C17.2 6.02355 13.9765 2.8 10 2.8C6.02355 2.8 2.8 6.02355 2.8 10C2.8 13.9765 6.02355 17.2 10 17.2ZM10.9 10H14.5V11.8H9.1V5.5H10.9V10Z"
            fill={color.palette.gray[800]}
          />
        </svg>
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxMike32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20}>
        <svg
          className={iconSvgFixed}
          viewBox="0 0 20 20"
          width={20}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>마이크</title>
          <rect
            x="7"
            y="3"
            width="6"
            height="9"
            rx="3"
            fill={color.palette.gray[800]}
          />
          <path
            d="M4.5 9.5C4.5 12.5376 6.96243 15 10 15C13.0376 15 15.5 12.5376 15.5 9.5"
            stroke={color.palette.gray[800]}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 15V18"
            stroke={color.palette.gray[800]}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxCheck32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20} offsetX={1} offsetY={2}>
        <svg
          className={iconSvgFixed}
          viewBox="0 0 20 20"
          width={20}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <title>체크</title>
          <path
            d="M16.1344 3.21055C16.2994 3.35737 16.3994 3.56367 16.4123 3.78415C16.4253 4.00462 16.3502 4.22123 16.2034 4.38637L7.31496 14.3864C7.23678 14.4743 7.14084 14.5448 7.03347 14.5929C6.9261 14.6411 6.80974 14.666 6.69204 14.666C6.57434 14.666 6.45797 14.6411 6.3506 14.5929C6.24323 14.5448 6.14729 14.4743 6.06911 14.3864L1.62494 9.38637C1.48671 9.22008 1.41853 9.00657 1.4348 8.79095C1.45107 8.57533 1.55052 8.37447 1.71214 8.23081C1.87375 8.08715 2.08488 8.01194 2.30092 8.02107C2.51696 8.03019 2.72099 8.12294 2.86911 8.27977L6.69204 12.5806L14.9608 3.27977C15.1078 3.11489 15.3142 3.01509 15.5346 3.00228C15.7551 2.98947 15.9716 3.0647 16.1365 3.21138L16.1344 3.21055Z"
            fill={color.palette.green[500]}
          />
        </svg>
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxChevron32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20} offsetX={-1}>
        <IconChevronLeft13 />
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxUnhappy32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20}>
        <svg
          className={iconSvgFixed}
          viewBox="0 0 20 20"
          width={20}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>불만족</title>
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke={color.palette.gray[800]}
            strokeWidth="1.6"
          />
          <circle cx="7.2" cy="8" r="1" fill={color.palette.gray[800]} />
          <circle cx="12.8" cy="8" r="1" fill={color.palette.gray[800]} />
          <path
            d="M6.5 13.8C7.4 12.9 8.6 12.4 10 12.4C11.4 12.4 12.6 12.9 13.5 13.8"
            stroke={color.palette.gray[800]}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxHappy32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20}>
        <svg
          className={iconSvgFixed}
          viewBox="0 0 20 20"
          width={20}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>만족</title>
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke={color.palette.gray[800]}
            strokeWidth="1.6"
          />
          <circle cx="7.2" cy="8" r="1" fill={color.palette.gray[800]} />
          <circle cx="12.8" cy="8" r="1" fill={color.palette.gray[800]} />
          <path
            d="M6.5 12.6C7.4 13.8 8.6 14.4 10 14.4C11.4 14.4 12.6 13.8 13.5 12.6"
            stroke={color.palette.gray[800]}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxFilter32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20} offsetX={2} offsetY={1}>
        <IconFilter20 />
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxThumbUp32({ className }: { className?: string }) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20} offsetX={1} offsetY={-1}>
        <IconThumbUp24 />
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxThumbDown32({
  className,
}: {
  className?: string;
}) {
  return (
    <CircleBox size={32} className={className}>
      <CircleBoxGlyph size={20} offsetX={-1} offsetY={1}>
        <IconThumbDown24 />
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxCrosshair48({
  className,
  state = "default",
}: {
  className?: string;
  state?: "default" | "active" | "denied";
}) {
  return (
    <CircleBox
      size={48}
      className={className}
      style={{
        background: color.bg.default,
        boxShadow: "0 3px 12px 0 rgba(22, 24, 28, 0.12)",
      }}
    >
      <CircleBoxGlyph offsetX={1} offsetY={1}>
        <IconNavigationCrosshair24 state={state} />
      </CircleBoxGlyph>
    </CircleBox>
  );
}

export function IconCircleboxCrosshairActive48({
  className,
}: {
  className?: string;
}) {
  // Deprecated: prefer <IconCircleboxCrosshair48 state="active" />
  return <IconCircleboxCrosshair48 className={className} state="active" />;
}

export function IconNavigationRefresh24({
  className,
  state = "refreshActive",
}: {
  className?: string;
  state?: "refresh" | "refreshActive";
}) {
  const fill =
    state === "refreshActive"
      ? color.palette.gray[800]
      : color.palette.gray[500];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <title>새로고침</title>
      <path
        d="M20 10C20 15.5228 15.5228 20 10 20C6.72774 20 3.82382 18.4286 2 16.001V18.5H0V12.5H6V14.5H3.38477C4.82543 16.6137 7.25151 18 10 18C14.4183 18 18 14.4183 18 10H20ZM10 0C13.2723 0 16.1762 1.57144 18 3.99902V1.5H20V7.5H14V5.5H16.6152C15.1746 3.38634 12.7485 2 10 2C5.58172 2 2 5.58172 2 10H0C0 4.47715 4.47715 0 10 0Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconCircleboxRefresh48({
  className,
  state = "refreshActive",
}: {
  className?: string;
  state?: "refresh" | "refreshActive";
}) {
  const fill =
    state === "refreshActive"
      ? color.palette.gray[800]
      : color.palette.gray[500];
  return (
    <CircleBox
      size={48}
      className={className}
      style={{
        background: color.bg.default,
        boxShadow: "0 3px 12px 0 rgba(22, 24, 28, 0.12)",
      }}
    >
      <CircleBoxGlyph size={20} offsetX={1} offsetY={1}>
        <svg
          className={iconSvgFixed}
          viewBox="0 0 20 20"
          width={20}
          height={20}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <title>새로고침</title>
          <path
            d="M20 10C20 15.5228 15.5228 20 10 20C6.72774 20 3.82382 18.4286 2 16.001V18.5H0V12.5H6V14.5H3.38477C4.82543 16.6137 7.25151 18 10 18C14.4183 18 18 14.4183 18 10H20ZM10 0C13.2723 0 16.1762 1.57144 18 3.99902V1.5H20V7.5H14V5.5H16.6152C15.1746 3.38634 12.7485 2 10 2C5.58172 2 2 5.58172 2 10H0C0 4.47715 4.47715 0 10 0Z"
            fill={fill}
          />
        </svg>
      </CircleBoxGlyph>
    </CircleBox>
  );
}

type IconSizeState = "default" | "selected" | "disabled";

export function IconSizeS({
  className,
  state = "default",
}: {
  className?: string;
  state?: IconSizeState;
}) {
  const isDisabled = state === "disabled";
  const fill =
    state === "selected" ? color.palette.green[500] : color.palette.gray[500];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 42 59"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={42}
      height={59}
      style={{ opacity: isDisabled ? 0.3 : 1 }}
      aria-hidden
    >
      <title>icon.size.s</title>
      <path
        d="M5.5543 58.9594C3.97096 58.9594 2.64998 58.4301 1.59136 57.3715C0.532744 56.3129 0.00229138 54.9919 0 53.4085V28.0258C0 23.5966 1.24193 19.6726 3.72578 16.2539C6.20734 12.8351 9.37173 10.3788 13.2189 8.88481V7.40344C13.2189 5.33203 13.935 3.58028 15.3671 2.14817C16.7992 0.716056 18.551 0 20.6224 0C22.6938 0 24.4455 0.716056 25.8777 2.14817C27.3098 3.58028 28.0258 5.33203 28.0258 7.40344V8.88137C31.873 10.3776 35.0374 12.8351 37.519 16.2539C40.0028 19.6726 41.2448 23.5966 41.2448 28.0258V53.4085C41.2448 54.9896 40.7155 56.3094 39.6568 57.368C38.5982 58.4267 37.2761 58.9571 35.6905 58.9594H5.5543ZM32.1572 39.564C32.4871 39.2364 32.6521 38.8274 32.6521 38.337V35.2952C32.6521 33.76 32.1113 32.4505 31.0298 31.3666C29.9483 30.2851 28.6388 29.7444 27.1012 29.7444H10.3112C9.82313 29.7444 9.41412 29.9082 9.08416 30.2359C8.7542 30.5635 8.59037 30.9725 8.59266 31.4629C8.59495 31.9532 8.75878 32.3623 9.08416 32.6899C9.40953 33.0176 9.81855 33.1814 10.3112 33.1814H27.1012C27.7176 33.1814 28.224 33.3796 28.6204 33.776C29.0168 34.1724 29.215 34.68 29.215 35.2986V38.337C29.215 38.8274 29.3789 39.2364 29.7065 39.564C30.0342 39.8917 30.4432 40.0555 30.9336 40.0555C31.4239 40.0555 31.8329 39.8917 32.1606 39.564M16.6594 7.88119C17.3331 7.72079 17.993 7.60164 18.6392 7.52373C19.2877 7.44353 19.9487 7.40344 20.6224 7.40344C21.296 7.40344 21.9571 7.44239 22.6056 7.5203C23.254 7.5982 23.9151 7.7185 24.5888 7.88119V7.40344C24.5888 6.2967 24.2038 5.35953 23.4339 4.59192C22.664 3.82431 21.7268 3.43936 20.6224 3.43706C19.5179 3.43477 18.5808 3.81972 17.8109 4.59192C17.041 5.36411 16.656 6.30128 16.656 7.40344L16.6594 7.88119Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconSizeM({
  className,
  state = "default",
}: {
  className?: string;
  state?: IconSizeState;
}) {
  const isDisabled = state === "disabled";
  const fill =
    state === "selected" ? color.palette.green[500] : color.palette.gray[500];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 59 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={59}
      height={66}
      style={{ opacity: isDisabled ? 0.3 : 1 }}
      aria-hidden
    >
      <title>icon.size.m</title>
      <path
        d="M22.209 11.8879C22.209 9.99618 22.9604 8.18194 24.2981 6.84429C25.6357 5.50664 27.45 4.75516 29.3417 4.75516C31.2334 4.75516 33.0477 5.50664 34.3853 6.84429C35.723 8.18194 36.4744 9.99618 36.4744 11.8879V15.058C38.2687 15.058 39.8411 15.0644 41.2296 15.1056V11.8879C41.2296 8.73504 39.9771 5.7113 37.7477 3.48189C35.5183 1.25247 32.4946 0 29.3417 0C26.1888 0 23.1651 1.25247 20.9357 3.48189C18.7063 5.7113 17.4538 8.73504 17.4538 11.8879V15.1056C18.8423 15.0644 20.4147 15.058 22.209 15.058V11.8879ZM17.4855 30.5186C17.5889 29.8965 17.9352 29.3409 18.4483 28.974C18.7023 28.7924 18.9897 28.6626 19.2939 28.592C19.5981 28.5214 19.9132 28.5115 20.2213 28.5627C20.5294 28.6139 20.8243 28.7253 21.0893 28.8905C21.3544 29.0557 21.5843 29.2714 21.7659 29.5255C21.9475 29.7795 22.0773 30.0669 22.1479 30.3711C22.2185 30.6753 22.2285 30.9904 22.1773 31.2985L19.0071 50.3191C18.9559 50.6272 18.8446 50.9221 18.6794 51.1872C18.5142 51.4522 18.2984 51.6821 18.0443 51.8637C17.7903 52.0453 17.503 52.1751 17.1988 52.2457C16.8945 52.3163 16.5794 52.3263 16.2713 52.2751C15.9633 52.2239 15.6683 52.1125 15.4033 51.9473C15.1383 51.7821 14.9084 51.5663 14.7268 51.3123C14.5451 51.0582 14.4153 50.7709 14.3447 50.4667C14.2742 50.1625 14.2642 49.8473 14.3154 49.5393L17.4855 30.5186ZM38.4621 28.5627C38.7702 28.5114 39.0853 28.5213 39.3896 28.5919C39.6938 28.6624 39.9812 28.7922 40.2352 28.9739C40.4893 29.1555 40.705 29.3854 40.8702 29.6505C41.0354 29.9155 41.1468 30.2105 41.1979 30.5186L44.368 49.5393C44.4192 49.8473 44.4092 50.1625 44.3387 50.4667C44.2681 50.7709 44.1383 51.0582 43.9566 51.3123C43.775 51.5663 43.5451 51.7821 43.2801 51.9473C43.0151 52.1125 42.7201 52.2239 42.4121 52.2751C42.104 52.3263 41.7889 52.3163 41.4846 52.2457C41.1804 52.1751 40.8931 52.0453 40.6391 51.8637C40.385 51.6821 40.1692 51.4522 40.004 51.1872C39.8388 50.9222 39.7275 50.6272 39.6763 50.3191L36.5061 31.2985C36.4549 30.9904 36.4648 30.6752 36.5354 30.371C36.6059 30.0668 36.7357 29.7794 36.9174 29.5254C37.099 29.2713 37.3289 29.0555 37.594 28.8903C37.859 28.7252 38.154 28.6138 38.4621 28.5627Z"
        fill={fill}
      />
      <path
        d="M4.24371 30.5145C5.63539 23.0965 6.32964 19.3843 8.97034 17.1905C11.6142 15 15.3866 15 22.9378 15H35.7451C43.2994 15 47.0719 15 49.7157 17.1905C52.3564 19.3843 53.0507 23.0933 54.4424 30.5145L56.8199 43.1949C58.7759 53.6309 59.7555 58.8489 56.9024 62.2853C54.0493 65.7217 48.7425 65.7217 38.1258 65.7217H20.5603C9.94356 65.7217 4.63364 65.7217 1.78371 62.2853C-1.06939 58.8489 -0.0898223 53.6309 1.86613 43.1949L4.24371 30.5145Z"
        fill={fill}
        opacity="0.5"
      />
    </svg>
  );
}

export function IconSizeL({
  className,
  state = "default",
}: {
  className?: string;
  state?: IconSizeState;
}) {
  const isDisabled = state === "disabled";
  const fill =
    state === "selected" ? color.palette.green[500] : color.palette.gray[500];
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      viewBox="0 0 49 69"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={49}
      height={69}
      style={{ opacity: isDisabled ? 0.3 : 1 }}
      aria-hidden
    >
      <title>icon.size.l</title>
      <path
        d="M41.3479 13.7483C45.0599 13.7483 48.1189 16.7729 48.1189 20.6224V58.4301C48.1189 62.314 45.0599 65.3042 41.3479 65.3042C41.3479 67.2977 39.7325 68.7413 37.8077 68.7413C36.0892 68.7413 34.3706 67.2977 34.3706 65.3042H13.7483C13.7483 67.2977 12.0297 68.7413 10.3112 68.7413C8.38644 68.7413 6.77101 67.2977 6.77101 65.3042C3.05899 65.3042 0 62.314 0 58.4301V20.6224C0 16.7729 3.05899 13.7483 6.77101 13.7483H13.7483V3.43706C13.7483 1.44357 15.3293 0 17.1853 0H30.9336C32.7896 0 34.3706 1.44357 34.3706 3.43706V13.7483H41.3479ZM29.215 13.7483V5.1556H18.9039V13.7483H29.215ZM10.3112 24.0594V54.993H15.4668V24.0594H10.3112ZM32.6521 24.0594V54.993H37.8077V24.0594H32.6521ZM21.4816 24.0594V54.993H26.6372V24.0594H21.4816Z"
        fill={fill}
      />
    </svg>
  );
}

export function IconNavigationPin40({ className }: { className?: string }) {
  return (
    <svg
      className={[iconSvgFixed, className].filter(Boolean).join(" ")}
      width={40}
      height={48}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>내비게이션 핀</title>
      <path
        d="M20.0202 47.9794C17.753 47.9794 15.7895 46.6615 14.8583 44.5611L5.46559 22.8983H5.48583L4.21053 20.0566L0.769231 12.1287C0.263158 10.9961 0 9.76062 0 8.48391V8.07207C0 5.14801 1.5587 2.42986 4.06883 1.00901L4.65587 0.679537L4.97976 0.576577C6.01215 0.164736 6.96356 0 7.97571 0C8.70445 0 9.41296 0.10296 10.1215 0.30888C10.4656 0.391248 11.1943 0.658945 11.5992 0.803089C12.2672 1.05019 12.4494 1.11197 12.753 1.23552C14.919 2.10039 17.3684 2.574 19.8178 2.574C22.2672 2.574 24.8178 2.10039 27.085 1.21493L29.17 0.535393C30.1215 0.185328 31.0526 0.020592 31.9838 0.020592C33.3806 0.020592 34.7571 0.391248 35.9717 1.09138C38.4413 2.55341 40 5.25097 40 8.15444V8.5045C40 9.69884 39.7571 10.8726 39.2915 12.0051L25.1619 44.5817C24.251 46.7027 22.2875 48 20.0202 48V47.9794Z"
        fill={color.bg.default}
      />
      <g transform="translate(2, 2)">
        <path
          d="M35.9514 6.1982C35.9514 6.1982 35.9514 6.36293 35.9514 6.4453C35.9514 7.41313 35.749 8.31918 35.4049 9.14286L35.3441 9.287L21.2955 41.6988C20.0405 44.6229 15.9717 44.6229 14.6964 41.6988L6.15385 22.0335L18.2794 16.103C19.0688 17.5444 20.6073 18.5534 22.3684 18.5534C25.0607 18.5534 27.2065 16.2471 27.0445 13.4878C26.9028 11.1197 25 9.18404 22.6721 9.0399C19.9595 8.87516 17.6923 11.0579 17.6923 13.7967C17.6923 14.0438 17.6923 14.2909 17.6923 14.538L4.04858 17.2149L0.587045 9.26641C0.20243 8.40154 0 7.45431 0 6.46589C0 6.38353 0 6.30116 0 6.21879C0 6.15701 0 6.09524 0 6.05405C0 3.78893 1.23482 1.79151 3.03644 0.761905C3.03644 0.761905 3.03644 0.761905 3.05668 0.761905C3.31984 0.617761 3.583 0.494208 3.8664 0.370656C4.51417 0.123552 5.22267 0 5.95142 0C6.49798 0 7.04453 0.0823681 7.55061 0.226512C7.79352 0.288288 8.64373 0.576577 8.88664 0.679537C9.51417 0.906049 9.67611 0.967825 9.97976 1.09138C14.9393 3.0888 20.749 3.04762 25.7895 1.07079L27.8542 0.41184C28.502 0.164736 29.2105 0.020592 29.9595 0.020592C31.0526 0.020592 32.0648 0.30888 32.9555 0.823681C34.7368 1.87387 35.9514 3.83012 35.9514 6.09524C35.9514 6.15701 35.9514 6.21879 35.9514 6.25997V6.1982Z"
          fill={color.brand.primary}
        />
      </g>
    </svg>
  );
}
