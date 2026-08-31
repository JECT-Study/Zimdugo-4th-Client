import type { Meta, StoryObj } from "@storybook/react";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { color } from "../../tokens/color/color.css.ts";
import {
  BottomMenuIcon,
  BrandSymbolIcon,
  BrandTextLogoLarge,
  BrandTextLogoSmall,
  IconAddBox18,
  IconCamera24,
  IconCaution24,
  IconCheck24,
  IconChevronLeft13,
  IconCircleboxCheck32,
  IconCircleboxChevron32,
  IconCircleboxClock32,
  IconCircleboxClose32,
  IconCircleboxCrosshair48,
  IconCircleboxCrosshairActive48,
  IconCircleboxFilter28,
  IconCircleboxFilter32,
  IconCircleboxHappy32,
  IconCircleboxMike32,
  IconCircleboxMore32,
  IconCircleboxPencil32,
  IconCircleboxRefresh48,
  IconCircleboxThumbDown32,
  IconCircleboxThumbUp32,
  IconCircleboxUnhappy32,
  IconCopy16,
  IconDistanceRoute24,
  IconFilter14,
  IconFilter20,
  IconFlagCircle24,
  IconGoogle24,
  IconHomeProfile32,
  IconImageUnavailable24,
  IconKakao24,
  IconLockerDetailCapacity24,
  IconLockerDetailHeader24,
  IconLockerDetailMapPin24,
  IconLockerDetailWallet24,
  IconLockerTimerClose28,
  IconLockerTimerLarge,
  IconMapColorScheme24,
  IconMarker22,
  IconMinusBox18,
  IconMore24,
  IconNaver19,
  IconNavigateLocation,
  IconNavigateMarker,
  IconNavigatePin,
  IconNavigationClock24,
  IconNavigationCrosshair24,
  IconNavigationMapPin24,
  IconNavigationMapPin24Fill,
  IconNavigationNavigate24,
  IconNavigationPin40,
  IconNavigationPushPin24,
  IconNavigationRefresh20,
  IconNavigationRefresh24,
  IconNavigationSearch24,
  IconNormalArrow24,
  IconNormalCapacity24,
  IconNormalGlobe32,
  IconNormalMapPin24,
  IconNormalProfile,
  IconNormalSearch24,
  IconNormalWallet24,
  IconPencil24,
  IconProfile22,
  IconProfile32,
  IconReport24,
  IconRoute20,
  IconSearchAutocompleteLocker14,
  IconSearchAutocompletePlace14,
  IconSearchLockerRow14,
  IconSearchPlaceRow14,
  IconSearchRecentItem24,
  IconShare24,
  IconSizeL,
  IconSizeM,
  IconSizeS,
  IconSocialProvider18,
  IconStarFilled24,
  IconStarOutline24,
  IconThumbDown24,
  IconThumbnail24,
  IconThumbUp24,
  IconTimerEnd28,
  IconTimerPreview24,
  IconTimerStart20,
  IconTimerStop20,
  IconX16,
  IconX24,
} from "./Icons.tsx";
import { LanguageFlagIcon } from "./LanguageFlagIcon";

// 번들러 타입 선언 없이 에셋을 참조하려고 URL 로 푼다.
const saveMapPin = new URL("../images/save-map-pin.png", import.meta.url).href;
const selectedMapPin = new URL(
  "../images/selected-map-pin.png",
  import.meta.url,
).href;

const meta = {
  title: "Design System/Assets/Icons",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "쓰임새로 묶은 아이콘 목록. 제품 코드에서 쓰지 않는 것은 지우지 않고 archived 로 모아 둔다.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
  gap: 16,
  width: "100%",
  justifyItems: "center",
};

const categoryColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxWidth: 980,
  margin: "0 auto",
};

const categoryTitle: CSSProperties = {
  fontSize: 12,
  color: "#8e8e8e",
};

const galleryColumn: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  maxWidth: 1020,
  margin: "0 auto",
};

const CELL_WIDTH = 120;
const CELL_HEIGHT = 112;
const CELL_GAP = 16;

const cell: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: 16,
  border: `1px solid ${color.palette.gray[500]}`,
  borderRadius: 8,
  width: CELL_WIDTH,
  minWidth: CELL_WIDTH,
  height: CELL_HEIGHT,
  boxSizing: "border-box",
};

const label: CSSProperties = {
  fontSize: 11,
  color: color.palette.gray[600],
  textAlign: "center",
  wordBreak: "break-all",
  width: "100%",
  lineHeight: 1.2,
};

const iconArea: CSSProperties = {
  flex: 1,
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 56,
  overflow: "visible",
};

const iconCanvas: CSSProperties = {
  width: "100%",
  minHeight: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const socialBadgeBase: CSSProperties = {
  minHeight: 48,
  padding: "12px 14px",
  borderRadius: 8,
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

function SocialBadge({
  provider,
  children,
}: {
  provider: "naver" | "kakao" | "google";
  children: ReactNode;
}) {
  const backgroundByProvider: Record<"naver" | "kakao" | "google", string> = {
    naver: "#04c65b",
    kakao: "#ffe400",
    google: "#1775f8",
  };
  const iconSlotByProvider: Record<
    "naver" | "kakao" | "google",
    CSSProperties
  > = {
    naver: { width: 19, height: 19 },
    kakao: { width: 24, height: 24 },
    google: { width: 24, height: 24 },
  };
  return (
    <div
      style={{
        ...socialBadgeBase,
        backgroundColor: backgroundByProvider[provider],
      }}
    >
      <span
        style={{
          ...iconSlotByProvider[provider],
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {children}
      </span>
    </div>
  );
}

const toHex = (value: string) => {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith("#")) {
    if (trimmed.length === 4) {
      const r = trimmed[1];
      const g = trimmed[2];
      const b = trimmed[3];
      return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
    }
    return trimmed.toUpperCase();
  }
  const rgb = trimmed.match(
    /^rgba?\(\s*(\d{1,3})[,\s]+(\d{1,3})[,\s]+(\d{1,3})(?:[,\s/]+[\d.]+)?\s*\)$/,
  );
  if (!rgb) {
    return null;
  }
  const r = Number.parseInt(rgb[1], 10).toString(16).padStart(2, "0");
  const g = Number.parseInt(rgb[2], 10).toString(16).padStart(2, "0");
  const b = Number.parseInt(rgb[3], 10).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`.toUpperCase();
};

const describeColorValue = (raw: string) => {
  const hex = toHex(raw);
  return hex ?? raw;
};

const collectSvgPaintInfo = (element: HTMLElement) => {
  const svg =
    element.tagName.toLowerCase() === "svg"
      ? element
      : element.querySelector("svg");
  if (!svg) {
    return {
      fills: ["n/a"],
      strokes: ["n/a"],
      backgrounds: ["n/a"],
    };
  }
  const fillSet = new Set<string>();
  const strokeSet = new Set<string>();
  const bgSet = new Set<string>();
  const paintTargets = svg.querySelectorAll(
    "path,circle,rect,ellipse,polygon,line,polyline",
  );
  paintTargets.forEach((node) => {
    const shape = node as SVGElement;
    const shapeStyle = window.getComputedStyle(shape);
    if (
      shapeStyle.display === "none" ||
      shapeStyle.visibility === "hidden" ||
      Number.parseFloat(shapeStyle.opacity || "1") === 0
    ) {
      return;
    }
    const fillAttr = shape.getAttribute("fill");
    const strokeAttr = shape.getAttribute("stroke");
    const strokeWidthAttr = shape.getAttribute("stroke-width");
    if (fillAttr && fillAttr !== "none") {
      fillSet.add(describeColorValue(fillAttr));
    } else if (shapeStyle.fill && shapeStyle.fill !== "none") {
      fillSet.add(describeColorValue(shapeStyle.fill));
    }
    if (strokeAttr && strokeAttr !== "none") {
      strokeSet.add(describeColorValue(strokeAttr));
    } else if (
      shapeStyle.stroke &&
      shapeStyle.stroke !== "none" &&
      (Number.parseFloat(strokeWidthAttr ?? "0") > 0 ||
        Number.parseFloat(shapeStyle.strokeWidth || "0") > 0)
    ) {
      strokeSet.add(describeColorValue(shapeStyle.stroke));
    }
  });
  const svgComputed = window.getComputedStyle(svg);
  if (
    svgComputed.backgroundColor &&
    svgComputed.backgroundColor !== "rgba(0, 0, 0, 0)"
  ) {
    bgSet.add(describeColorValue(svgComputed.backgroundColor));
  }
  const wrapperComputed = window.getComputedStyle(element);
  if (
    wrapperComputed.backgroundColor &&
    wrapperComputed.backgroundColor !== "rgba(0, 0, 0, 0)"
  ) {
    bgSet.add(describeColorValue(wrapperComputed.backgroundColor));
  }
  return {
    fills: fillSet.size ? [...fillSet] : ["n/a"],
    strokes: strokeSet.size ? [...strokeSet] : ["n/a"],
    backgrounds: bgSet.size ? [...bgSet] : ["transparent"],
  };
};

const collectSvgTypographyInfo = (element: HTMLElement) => {
  const svg =
    element.tagName.toLowerCase() === "svg"
      ? element
      : element.querySelector("svg");
  if (!svg) {
    return {
      fontSizes: ["n/a"],
      fontWeights: ["n/a"],
      textColors: ["n/a"],
    };
  }

  const textTargets = svg.querySelectorAll("text,tspan");
  const fontSizeSet = new Set<string>();
  const fontWeightSet = new Set<string>();
  const textColorSet = new Set<string>();

  textTargets.forEach((node) => {
    const textNode = node as SVGTextElement;
    const textStyle = window.getComputedStyle(textNode);
    if (
      textStyle.display === "none" ||
      textStyle.visibility === "hidden" ||
      Number.parseFloat(textStyle.opacity || "1") === 0
    ) {
      return;
    }

    if (textStyle.fontSize) {
      fontSizeSet.add(textStyle.fontSize);
    }
    if (textStyle.fontWeight) {
      fontWeightSet.add(textStyle.fontWeight);
    }

    const fillAttr = textNode.getAttribute("fill");
    if (fillAttr && fillAttr !== "none") {
      textColorSet.add(describeColorValue(fillAttr));
    } else if (textStyle.fill && textStyle.fill !== "none") {
      textColorSet.add(describeColorValue(textStyle.fill));
    } else if (textStyle.color && textStyle.color !== "rgba(0, 0, 0, 0)") {
      textColorSet.add(describeColorValue(textStyle.color));
    }
  });

  return {
    fontSizes: fontSizeSet.size ? [...fontSizeSet] : ["n/a"],
    fontWeights: fontWeightSet.size ? [...fontWeightSet] : ["n/a"],
    textColors: textColorSet.size ? [...textColorSet] : ["n/a"],
  };
};

function Cell({
  name,
  children,
  style,
  spanColumns = 1,
  ingredients,
  probeTarget = "svg",
}: {
  name: string;
  children: ReactNode;
  style?: CSSProperties;
  spanColumns?: 1 | 2;
  ingredients?: readonly string[];
  probeTarget?: "svg" | "root";
}) {
  const computedWidth =
    spanColumns === 2 ? CELL_WIDTH * 2 + CELL_GAP : CELL_WIDTH;
  const [isHovered, setIsHovered] = useState(false);
  const [summary, setSummary] = useState("");
  const [materialList, setMaterialList] = useState<readonly string[]>([]);
  const [tooltipPos, setTooltipPos] = useState({ left: 0, top: 0 });
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const iconAreaRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const rootElement = rootRef.current;
    const iconAreaElement = iconAreaRef.current;
    if (!rootElement || !iconAreaElement) {
      setSummary(`name: ${name}\ncss: unavailable`);
      return;
    }

    const probeRoot =
      (iconAreaElement.querySelector(
        "[data-icon-probe='true']",
      ) as HTMLElement | null) ?? iconAreaElement;
    const iconElement =
      probeTarget === "root"
        ? ((probeRoot.firstElementChild as HTMLElement | null) ?? probeRoot)
        : ((probeRoot.querySelector("svg") as HTMLElement | null) ??
          (probeRoot.firstElementChild as HTMLElement | null) ??
          probeRoot);
    const css = window.getComputedStyle(iconElement);
    const paintInfo = collectSvgPaintInfo(iconElement);
    const typographyInfo = collectSvgTypographyInfo(iconElement);
    setMaterialList(ingredients ?? []);
    setSummary(
      [
        `name: ${name}`,
        `element: <${iconElement.tagName.toLowerCase()}>`,
        `display: ${css.display}`,
        `width: ${css.width}`,
        `height: ${css.height}`,
        `position: ${css.position}`,
        `margin: ${css.margin}`,
        `padding: ${css.padding}`,
        `background: ${paintInfo.backgrounds.join(", ")}`,
        `fill: ${paintInfo.fills.join(", ")}`,
        `stroke: ${paintInfo.strokes.join(", ")}`,
        `font-size: ${typographyInfo.fontSizes.join(", ")}`,
        `font-weight: ${typographyInfo.fontWeights.join(", ")}`,
        `text-color: ${typographyInfo.textColors.join(", ")}`,
        `border-radius: ${css.borderRadius}`,
      ].join("\n"),
    );

    const rect = rootElement.getBoundingClientRect();
    const lines = 12 + (ingredients?.length ? ingredients.length + 2 : 0);
    const tooltipHeight = 8 * 2 + lines * 16;
    const tooltipWidth = 320;
    const viewportPadding = 8;
    const shouldShowAbove = rect.top > tooltipHeight + 12;
    const desiredTop = shouldShowAbove
      ? rect.top - tooltipHeight - 8
      : rect.bottom + 8;
    const desiredLeft = rect.left + rect.width / 2;
    const minLeft = viewportPadding + tooltipWidth / 2;
    const maxLeft = window.innerWidth - viewportPadding - tooltipWidth / 2;
    const clampedLeft = Math.min(Math.max(desiredLeft, minLeft), maxLeft);
    const minTop = viewportPadding;
    const maxTop = window.innerHeight - viewportPadding - tooltipHeight;
    const clampedTop = Math.min(Math.max(desiredTop, minTop), maxTop);
    setTooltipPos({
      left: clampedLeft,
      top: clampedTop,
    });
  };

  return (
    <button
      type="button"
      ref={rootRef}
      style={{
        ...cell,
        width: computedWidth,
        minWidth: computedWidth,
        position: "relative",
        background: "transparent",
        ...style,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setIsHovered(false);
        setMaterialList([]);
      }}
    >
      <div ref={iconAreaRef} style={iconArea}>
        <div style={iconCanvas}>
          <span
            data-icon-probe="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
              height: "fit-content",
              margin: "0 auto",
            }}
          >
            {children}
          </span>
        </div>
      </div>
      <span style={label}>{name}</span>
      {isHovered
        ? createPortal(
            <div
              style={{
                position: "fixed",
                left: tooltipPos.left,
                top: tooltipPos.top,
                transform: "translateX(-50%)",
                whiteSpace: "pre-line",
                background: "#16181c",
                color: "#fff",
                borderRadius: 6,
                fontSize: 11,
                lineHeight: 1.35,
                padding: "8px 10px",
                width: 320,
                maxWidth: 320,
                textAlign: "left",
                zIndex: 9999,
                boxShadow: "0 8px 20px rgba(0,0,0,0.24)",
                pointerEvents: "none",
              }}
            >
              <div style={{ whiteSpace: "pre-line" }}>{summary}</div>
              {materialList.length ? (
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    ingredient icons
                  </div>
                  <div>{materialList.join(", ")}</div>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </button>
  );
}

/**
 * 컴포넌트가 아닌 정적 이미지 에셋.
 *
 * favicon 처럼 파일로만 존재하는 것들이다. Storybook 이 web 의 public 을 / 로
 * 서빙하므로 절대 경로로 그대로 부른다.
 */
function StaticAsset({ name, src }: { name: string; src: string }) {
  return (
    <img
      src={src}
      alt={name}
      style={{ maxWidth: 56, maxHeight: 56, objectFit: "contain" }}
    />
  );
}

function IconSlot({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function RowSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 12, color: "#8e8e8e" }}>{title}</div>
      <div
        style={{
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap",
            gap: 8,
            width: "max-content",
            minWidth: "100%",
            justifyContent: "center",
            paddingInline: 4,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface IconEntry {
  name: string;
  render: () => ReactNode;
  spanColumns?: 1 | 2;
  ingredients?: readonly string[];
  probeTarget?: "svg" | "root";
  style?: CSSProperties;
}

interface IconCategory {
  id: string;
  label: string;
  entries: readonly IconEntry[];
}

/**
 * 아이콘 목록의 단일 출처.
 *
 * 카테고리 스토리와 전체 갤러리가 같은 배열을 읽는다. 예전에는 둘이 각자 JSX 를
 * 나열해서, 아이콘을 더할 때 한쪽만 고치면 조용히 어긋났다.
 *
 * 소속은 생김새가 아니라 쓰임새로 잡는다. circlebox 처럼 모양으로 묶으면 같은 화면에
 * 쓰이는 아이콘이 흩어져, 어디에 쓰는 아이콘인지 찾기 어렵다.
 */
const ICON_CATALOG = [
  {
    id: "common",
    label: "공통",
    entries: [
      {
        name: "x",
        render: () => <IconX16 />,
      },
      {
        name: "x24",
        render: () => <IconX24 />,
      },
      {
        name: "more",
        render: () => <IconMore24 />,
      },
      {
        name: "chevronLeft",
        render: () => <IconChevronLeft13 />,
      },
      {
        name: "check",
        render: () => <IconCheck24 />,
      },
      {
        name: "arrowLeft",
        render: () => <IconNormalArrow24 direction="left" />,
      },
      {
        name: "arrowRight",
        render: () => <IconNormalArrow24 direction="right" />,
      },
      {
        name: "arrowUp",
        render: () => <IconNormalArrow24 direction="up" />,
      },
      {
        name: "arrowDown",
        render: () => <IconNormalArrow24 direction="down" />,
      },
      {
        name: "caution.correct",
        render: () => <IconCaution24 state="correct" />,
      },
      {
        name: "caution.error",
        render: () => <IconCaution24 state="error" />,
      },
      {
        name: "pencil",
        render: () => <IconPencil24 />,
      },
      {
        name: "copy",
        render: () => <IconCopy16 />,
      },
      {
        name: "check",
        probeTarget: "root",
        ingredients: ["IconCheck24"],
        render: () => <IconCircleboxCheck32 />,
      },
    ],
  },
  {
    id: "brand",
    label: "브랜드",
    entries: [
      {
        name: "symbol",
        render: () => (
          <div style={{ width: 80, height: 80 }}>
            <BrandSymbolIcon />
          </div>
        ),
      },
      {
        name: "large",
        spanColumns: 2,
        style: { gridColumn: "span 2" },
        render: () => (
          <div style={{ width: 158, height: 28 }}>
            <BrandTextLogoLarge />
          </div>
        ),
      },
      {
        name: "small",
        spanColumns: 2,
        style: { gridColumn: "span 2" },
        render: () => <BrandTextLogoSmall />,
      },
    ],
  },
  {
    id: "app",
    label: "앱 아이콘",
    entries: [
      {
        name: "favicon.svg",
        probeTarget: "root",
        render: () => <StaticAsset name="favicon.svg" src="/favicon.svg" />,
      },
      {
        name: "favicon.ico",
        probeTarget: "root",
        render: () => <StaticAsset name="favicon.ico" src="/favicon.ico" />,
      },
      {
        name: "favicon 16",
        probeTarget: "root",
        render: () => (
          <StaticAsset name="favicon 16" src="/icons/favicon-16x16.png" />
        ),
      },
      {
        name: "favicon 32",
        probeTarget: "root",
        render: () => (
          <StaticAsset name="favicon 32" src="/icons/favicon-32x32.png" />
        ),
      },
      {
        name: "apple touch 180",
        probeTarget: "root",
        render: () => (
          <StaticAsset
            name="apple touch 180"
            src="/icons/apple-touch-icon-180x180.png"
          />
        ),
      },
      {
        name: "android chrome 192",
        probeTarget: "root",
        render: () => (
          <StaticAsset
            name="android chrome 192"
            src="/icons/android-chrome-192x192.png"
          />
        ),
      },
      {
        name: "android chrome 512",
        probeTarget: "root",
        render: () => (
          <StaticAsset
            name="android chrome 512"
            src="/icons/android-chrome-512x512.png"
          />
        ),
      },
      {
        name: "maskable 512",
        probeTarget: "root",
        render: () => (
          <StaticAsset name="maskable 512" src="/icons/maskable-512x512.png" />
        ),
      },
      {
        name: "badge 96",
        probeTarget: "root",
        render: () => (
          <StaticAsset name="badge 96" src="/icons/badge-96x96.png" />
        ),
      },
      {
        name: "tanstack circle",
        probeTarget: "root",
        render: () => (
          <StaticAsset name="tanstack circle" src="/tanstack-circle-logo.png" />
        ),
      },
      {
        name: "tanstack word",
        probeTarget: "root",
        render: () => (
          <StaticAsset
            name="tanstack word"
            src="/tanstack-word-logo-white.svg"
          />
        ),
      },
    ],
  },
  {
    id: "auth",
    label: "로그인",
    entries: [
      {
        name: "naver",
        render: () => (
          <SocialBadge provider="naver">
            <IconNaver19 />
          </SocialBadge>
        ),
      },
      {
        name: "kakao",
        render: () => (
          <SocialBadge provider="kakao">
            <IconKakao24 />
          </SocialBadge>
        ),
      },
      {
        name: "google",
        render: () => (
          <SocialBadge provider="google">
            <IconGoogle24 />
          </SocialBadge>
        ),
      },
      {
        name: "provider.google",
        probeTarget: "root",
        render: () => <IconSocialProvider18 provider="google" />,
      },
      {
        name: "provider.naver",
        probeTarget: "root",
        render: () => <IconSocialProvider18 provider="naver" />,
      },
      {
        name: "provider.kakao",
        probeTarget: "root",
        render: () => <IconSocialProvider18 provider="kakao" />,
      },
    ],
  },
  {
    id: "map",
    label: "지도",
    entries: [
      {
        name: "내 위치 마커",
        render: () => <IconNavigateLocation />,
      },
      {
        name: "pin40",
        render: () => <IconNavigationPin40 />,
      },
      {
        name: "crosshair",
        render: () => <IconNavigationCrosshair24 state="default" />,
      },
      {
        name: "crosshairActive",
        render: () => <IconNavigationCrosshair24 state="active" />,
      },
      {
        name: "crosshairDenied",
        render: () => <IconNavigationCrosshair24 state="denied" />,
      },
      {
        name: "colorSchemeLight",
        render: () => <IconMapColorScheme24 scheme="light" />,
      },
      {
        name: "colorSchemeDark",
        render: () => <IconMapColorScheme24 scheme="dark" />,
      },
      {
        name: "refresh",
        render: () => <IconNavigationRefresh24 state="refresh" />,
      },
      {
        name: "refreshActive",
        render: () => <IconNavigationRefresh24 state="refreshActive" />,
      },
      {
        name: "mapPin",
        render: () => <IconNormalMapPin24 />,
      },
      {
        name: "crosshair",
        probeTarget: "root",
        ingredients: ["IconNavigationCrosshair24"],
        render: () => <IconCircleboxCrosshair48 />,
      },
      {
        name: "crosshairActive",
        probeTarget: "root",
        ingredients: ["IconNavigationCrosshair24(active)"],
        render: () => <IconCircleboxCrosshair48 state="active" />,
      },
      {
        name: "crosshairDenied",
        probeTarget: "root",
        ingredients: ["IconNavigationCrosshair24(denied)"],
        render: () => <IconCircleboxCrosshair48 state="denied" />,
      },
    ],
  },
  {
    id: "search",
    label: "검색",
    entries: [
      {
        name: "search",
        render: () => <IconNormalSearch24 size={20} />,
      },
      {
        name: "searchActive",
        render: () => <IconNormalSearch24 size={20} tone="active" />,
      },
      {
        name: "filter14",
        render: () => <IconFilter14 />,
      },
    ],
  },
  {
    id: "locker",
    label: "보관함",
    entries: [
      {
        name: "distanceRoute",
        render: () => <IconDistanceRoute24 />,
      },
      {
        name: "clock",
        render: () => <IconNavigationClock24 state="default" />,
      },
      {
        name: "clockFill",
        render: () => <IconNavigationClock24 state="active" />,
      },
      {
        name: "report",
        render: () => <IconReport24 />,
      },
      {
        name: "share",
        render: () => <IconShare24 />,
      },
      {
        name: "mapPin",
        render: () => <IconLockerDetailMapPin24 />,
      },
      {
        name: "wallet",
        render: () => <IconLockerDetailWallet24 />,
      },
      {
        name: "capacity",
        render: () => <IconLockerDetailCapacity24 />,
      },
      {
        name: "timerStart",
        render: () => <IconTimerStart20 />,
      },
      {
        name: "timerStop",
        probeTarget: "root",
        render: () => <IconTimerStop20 />,
      },
      {
        name: "route",
        probeTarget: "root",
        render: () => <IconRoute20 />,
      },
      {
        name: "timerPreview",
        probeTarget: "root",
        render: () => <IconTimerPreview24 />,
      },
      {
        name: "timerEnd",
        probeTarget: "root",
        render: () => <IconTimerEnd28 />,
      },
      {
        name: "timerClose",
        probeTarget: "root",
        render: () => <IconLockerTimerClose28 />,
      },
      {
        name: "timerLarge",
        probeTarget: "root",
        render: () => <IconLockerTimerLarge />,
      },
      {
        name: "camera",
        render: () => <IconCamera24 />,
      },
      {
        name: "imageUnavailable",
        render: () => <IconImageUnavailable24 />,
      },
      {
        name: "size.s / default",
        render: () => <IconSizeS state="default" />,
      },
      {
        name: "size.s / selected",
        render: () => <IconSizeS state="selected" />,
      },
      {
        name: "size.s / disabled",
        render: () => <IconSizeS state="disabled" />,
      },
      {
        name: "size.m / default",
        render: () => <IconSizeM state="default" />,
      },
      {
        name: "size.m / selected",
        render: () => <IconSizeM state="selected" />,
      },
      {
        name: "size.m / disabled",
        render: () => <IconSizeM state="disabled" />,
      },
      {
        name: "size.l / default",
        render: () => <IconSizeL state="default" />,
      },
      {
        name: "size.l / selected",
        render: () => <IconSizeL state="selected" />,
      },
      {
        name: "size.l / disabled",
        render: () => <IconSizeL state="disabled" />,
      },
      {
        name: "star",
        render: () => <IconStarOutline24 size={24} />,
      },
      {
        name: "starFill",
        render: () => <IconStarFilled24 size={24} />,
      },
    ],
  },
  {
    id: "user",
    label: "사용자",
    entries: [
      {
        name: "profile-22",
        probeTarget: "root",
        ingredients: ["IconProfile22"],
        render: () => <IconProfile22 />,
      },
      {
        name: "home-profile-32",
        probeTarget: "root",
        ingredients: ["IconHomeProfile32", "Profile / My Page"],
        render: () => <IconHomeProfile32 />,
      },
      {
        name: "pencil",
        probeTarget: "root",
        ingredients: ["IconPencil24"],
        render: () => <IconCircleboxPencil32 />,
      },
      {
        name: "globe",
        render: () => <IconNormalGlobe32 />,
      },
      {
        name: "korea",
        probeTarget: "root",
        render: () => <LanguageFlagIcon language="ko" />,
      },
      {
        name: "unitedStates",
        probeTarget: "root",
        render: () => <LanguageFlagIcon language="en" />,
      },
      {
        name: "japan",
        probeTarget: "root",
        render: () => <LanguageFlagIcon language="ja" />,
      },
      {
        name: "china",
        probeTarget: "root",
        render: () => <LanguageFlagIcon language="zh" />,
      },
      {
        name: "taiwan",
        probeTarget: "root",
        render: () => <LanguageFlagIcon language="zh-TW" />,
      },
      {
        name: "circle.korea",
        probeTarget: "root",
        render: () => <IconFlagCircle24 country="ko" />,
      },
      {
        name: "circle.japan",
        probeTarget: "root",
        render: () => <IconFlagCircle24 country="ja" />,
      },
      {
        name: "circle.taiwan",
        probeTarget: "root",
        render: () => <IconFlagCircle24 country="zh-TW" />,
      },
      {
        name: "circle.china",
        probeTarget: "root",
        render: () => <IconFlagCircle24 country="zh" />,
      },
      {
        name: "circle.unitedStates",
        probeTarget: "root",
        render: () => <IconFlagCircle24 country="en" />,
      },
    ],
  },
  {
    id: "navigation",
    label: "하단 내비게이션",
    entries: (["home", "report", "my", "settings"] as const).flatMap((tab) => [
      {
        name: tab,
        render: () => (
          <IconSlot>
            <BottomMenuIcon tab={tab} isActive={false} />
          </IconSlot>
        ),
      },
      {
        name: `${tab}Active`,
        render: () => (
          <IconSlot>
            <BottomMenuIcon tab={tab} isActive />
          </IconSlot>
        ),
      },
    ]),
  },
  /**
   * 제품 코드 어디에도 그려지지 않는 아이콘을 모아 둔다.
   *
   * 소속은 import 여부가 아니라 "화면에 도안이 뜨는가" 로 가른다.
   * 지도 마커처럼 React 를 못 쓰는 자리는 컴포넌트 대신 같은 에셋 파일을
   * 불러 쓰기 때문에, import 만 세면 살아 있는 아이콘을 놓친다.
   */
  {
    id: "archived",
    label: "제품에서 쓰지 않음",
    entries: [
      {
        name: "search",
        render: () => <IconNavigationSearch24 tone="default" />,
      },
      {
        name: "searchFill",
        render: () => <IconNavigationSearch24 tone="active" />,
      },
      {
        name: "mapPinActive",
        render: () => <IconNavigationMapPin24 />,
      },
      {
        name: "mapPinFill",
        render: () => <IconNavigationMapPin24Fill />,
      },
      {
        name: "navigate",
        render: () => <IconNavigationNavigate24 state="default" />,
      },
      {
        name: "navigateFill",
        render: () => <IconNavigationNavigate24 state="active" />,
      },
      {
        name: "pushPin",
        render: () => <IconNavigationPushPin24 state="default" />,
      },
      {
        name: "pushPinFill",
        render: () => <IconNavigationPushPin24 state="active" />,
      },
      {
        name: "refresh20",
        render: () => <IconNavigationRefresh20 state="default" />,
      },
      {
        name: "refresh20Active",
        render: () => <IconNavigationRefresh20 state="active" />,
      },
      {
        name: "nav pin",
        ingredients: ["BrandSymbolIcon"],
        render: () => <IconNavigatePin />,
      },
      {
        name: "nav marker",
        ingredients: ["IconMarker22"],
        render: () => <IconNavigateMarker />,
      },
      {
        name: "filter",
        render: () => <IconFilter20 />,
      },
      {
        name: "marker",
        render: () => <IconMarker22 />,
      },
      {
        name: "wallet",
        render: () => <IconNormalWallet24 />,
      },
      {
        name: "capacity",
        render: () => <IconNormalCapacity24 />,
      },
      {
        name: "thumbUp",
        render: () => <IconThumbUp24 />,
      },
      {
        name: "thumbDown",
        render: () => <IconThumbDown24 />,
      },
      {
        name: "addBox",
        render: () => <IconAddBox18 />,
      },
      {
        name: "minusBox",
        render: () => <IconMinusBox18 />,
      },
      {
        name: "search.place.row",
        render: () => <IconSearchPlaceRow14 />,
      },
      {
        name: "search.place.row.closed",
        render: () => <IconSearchPlaceRow14 isClosed />,
      },
      {
        name: "search.locker.row",
        render: () => <IconSearchLockerRow14 />,
      },
      {
        name: "search.locker.row.closed",
        render: () => <IconSearchLockerRow14 isClosed />,
      },
      {
        name: "autocomplete.place",
        render: () => <IconSearchAutocompletePlace14 />,
      },
      {
        name: "autocomplete.locker",
        render: () => <IconSearchAutocompleteLocker14 />,
      },
      {
        name: "recent.item",
        render: () => <IconSearchRecentItem24 />,
      },
      {
        name: "header",
        probeTarget: "root",
        render: () => <IconLockerDetailHeader24 />,
      },
      {
        name: "thumbnail",
        probeTarget: "root",
        ingredients: ["IconMarker22"],
        render: () => <IconThumbnail24 />,
      },
      {
        name: "profile",
        probeTarget: "root",
        ingredients: ["IconMarker22"],
        render: () => <IconNormalProfile />,
      },
      {
        name: "profile-32",
        probeTarget: "root",
        ingredients: ["IconProfile32", "IconProfile22"],
        render: () => <IconProfile32 />,
      },
      {
        name: "clock",
        probeTarget: "root",
        ingredients: ["IconNavigationClock24"],
        render: () => <IconCircleboxClock32 />,
      },
      {
        name: "more",
        probeTarget: "root",
        ingredients: ["IconMore24"],
        render: () => <IconCircleboxMore32 />,
      },
      {
        name: "close",
        probeTarget: "root",
        ingredients: ["IconX24"],
        render: () => <IconCircleboxClose32 />,
      },
      {
        name: "mike",
        probeTarget: "root",
        ingredients: ["IconNavigationPushPin24"],
        render: () => <IconCircleboxMike32 />,
      },
      {
        name: "chevron",
        probeTarget: "root",
        ingredients: ["IconChevronLeft13"],
        render: () => <IconCircleboxChevron32 />,
      },
      {
        name: "unhappy",
        probeTarget: "root",
        ingredients: ["IconCaution24(error)"],
        render: () => <IconCircleboxUnhappy32 />,
      },
      {
        name: "happy",
        probeTarget: "root",
        ingredients: ["IconCaution24(correct)"],
        render: () => <IconCircleboxHappy32 />,
      },
      {
        name: "filter28",
        probeTarget: "root",
        ingredients: ["IconFilter14"],
        render: () => <IconCircleboxFilter28 />,
      },
      {
        name: "filter",
        probeTarget: "root",
        ingredients: ["IconFilter20"],
        render: () => <IconCircleboxFilter32 />,
      },
      {
        name: "thumbUp",
        probeTarget: "root",
        ingredients: ["IconThumbUp24"],
        render: () => <IconCircleboxThumbUp32 />,
      },
      {
        name: "thumbDown",
        probeTarget: "root",
        ingredients: ["IconThumbDown24"],
        render: () => <IconCircleboxThumbDown32 />,
      },
      {
        name: "crosshairActiveDeprecated",
        probeTarget: "root",
        ingredients: ["IconCircleboxCrosshair48(active)"],
        render: () => <IconCircleboxCrosshairActive48 />,
      },
      {
        name: "refresh",
        probeTarget: "root",
        render: () => <IconCircleboxRefresh48 state="refresh" />,
      },
      {
        name: "refreshActive",
        probeTarget: "root",
        render: () => <IconCircleboxRefresh48 state="refreshActive" />,
      },
      {
        name: "save-map-pin.png",
        probeTarget: "root",
        render: () => <StaticAsset name="save-map-pin" src={saveMapPin} />,
      },
      {
        name: "selected-map-pin.png",
        probeTarget: "root",
        render: () => (
          <StaticAsset name="selected-map-pin" src={selectedMapPin} />
        ),
      },
    ],
  },
] as const satisfies readonly IconCategory[];

/** 카탈로그에 실제로 있는 id 만 받는다. 오타는 타입 검사에서 걸린다. */
type IconCategoryId = (typeof ICON_CATALOG)[number]["id"];

const categoryOf = (id: IconCategoryId) =>
  ICON_CATALOG.find((category) => category.id === id) as IconCategory;

const renderEntry = (entry: IconEntry, key: string) => (
  <Cell
    key={key}
    name={entry.name}
    spanColumns={entry.spanColumns}
    ingredients={entry.ingredients}
    probeTarget={entry.probeTarget}
    style={entry.style}
  >
    {entry.render()}
  </Cell>
);

/**
 * 카테고리 하나를 그린다.
 *
 * 격자는 그대로 두고 화면 가운데에 놓는다. all 은 카테고리가 여럿이라 가로로
 * 늘어놓지만, 개별 카테고리는 격자로 보는 편이 한눈에 들어온다.
 *
 * 사이드바 이름은 export 이름을 그대로 쓴다. Storybook 인덱서는 소스를 정적으로
 * 읽어서, 헬퍼가 돌려주는 객체의 name 은 보지 못한다.
 */
const categoryStory = (id: IconCategoryId): Story => ({
  render: () => (
    <div style={categoryColumn}>
      <div style={categoryTitle}>{categoryOf(id).label}</div>
      <div style={grid}>
        {categoryOf(id).entries.map((entry, index) =>
          renderEntry(entry, `${id}-${index}`),
        )}
      </div>
    </div>
  ),
});

export const Common: Story = categoryStory("common");

export const Brand: Story = categoryStory("brand");

export const AppIcon: Story = categoryStory("app");

export const Auth: Story = categoryStory("auth");

export const MapIcons: Story = categoryStory("map");

export const Search: Story = categoryStory("search");

export const Locker: Story = categoryStory("locker");

export const User: Story = categoryStory("user");

export const BottomNavigation: Story = categoryStory("navigation");

export const Archived: Story = categoryStory("archived");

export const Gallery: Story = {
  name: "all",
  render: () => (
    <div style={galleryColumn}>
      {ICON_CATALOG.map((category) => (
        <RowSection key={category.id} title={category.label}>
          {category.entries.map((entry, index) =>
            renderEntry(entry, `${category.id}-${index}`),
          )}
        </RowSection>
      ))}
    </div>
  ),
};
