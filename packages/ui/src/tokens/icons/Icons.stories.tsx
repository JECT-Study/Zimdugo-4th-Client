import type { Meta, StoryObj } from "@storybook/react";
import { type CSSProperties, type ReactNode, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { color } from "../color/color.css.ts";
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
  IconCircleboxCrosshair48,
  IconCircleboxCrosshairActive48,
  IconCircleboxFilter32,
  IconCircleboxHappy32,
  IconCircleboxMike32,
  IconCircleboxRefresh48,
  IconCircleboxThumbDown32,
  IconCircleboxThumbUp32,
  IconCircleboxUnhappy32,
  IconFilter20,
  IconGoogle24,
  IconKakao24,
  IconMarker22,
  IconMinusBox18,
  IconNaver19,
  IconNavigateMarker,
  IconNavigatePin,
  IconNavigationClock24,
  IconNavigationCrosshair24,
  IconNavigationMapPin24,
  IconNavigationMapPin24Fill,
  IconNavigationNavigate24,
  IconNavigationPushPin24,
  IconNavigationRefresh24,
  IconNavigationSearch24,
  IconNormalArrow24,
  IconNormalMapPin24,
  IconNormalProfile,
  IconNormalSearch24,
  IconPencil24,
  IconShare24,
  IconSizeL,
  IconSizeM,
  IconSizeS,
  IconStarFilled24,
  IconStarOutline24,
  IconThumbDown24,
  IconThumbnail24,
  IconThumbUp24,
  IconX16,
} from "./Icons.tsx";

const meta = {
  title: "Foundation/Icons",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Figma `137:118` 분류(네비게이션/노말/브랜드/소셜/메뉴/사이즈) 기반 아이콘 스토리.",
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
  maxWidth: 980,
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
  ingredients?: string[];
  probeTarget?: "svg" | "root";
}) {
  const computedWidth =
    spanColumns === 2 ? CELL_WIDTH * 2 + CELL_GAP : CELL_WIDTH;
  const [isHovered, setIsHovered] = useState(false);
  const [summary, setSummary] = useState("");
  const [materialList, setMaterialList] = useState<string[]>([]);
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

export const Navigation: Story = {
  name: "icon.navigation",
  render: () => (
    <div style={grid}>
      <Cell name="search">
        <IconNavigationSearch24 tone="default" />
      </Cell>
      <Cell name="searchFill">
        <IconNavigationSearch24 tone="active" />
      </Cell>
      <Cell name="star">
        <IconStarOutline24 size={24} />
      </Cell>
      <Cell name="starFill">
        <IconStarFilled24 size={24} />
      </Cell>
      <Cell name="mapPinActive">
        <IconNavigationMapPin24 />
      </Cell>
      <Cell name="mapPinFill">
        <IconNavigationMapPin24Fill />
      </Cell>
      <Cell name="navigate">
        <IconNavigationNavigate24 state="default" />
      </Cell>
      <Cell name="navigateFill">
        <IconNavigationNavigate24 state="active" />
      </Cell>
      <Cell name="clock">
        <IconNavigationClock24 state="default" />
      </Cell>
      <Cell name="clockFill">
        <IconNavigationClock24 state="active" />
      </Cell>
      <Cell name="pushPin">
        <IconNavigationPushPin24 state="default" />
      </Cell>
      <Cell name="pushPinFill">
        <IconNavigationPushPin24 state="active" />
      </Cell>
      <Cell name="crosshair">
        <IconNavigationCrosshair24 state="default" />
      </Cell>
      <Cell name="crosshairActive">
        <IconNavigationCrosshair24 state="active" />
      </Cell>
      <Cell name="refresh">
        <IconNavigationRefresh24 state="refresh" />
      </Cell>
      <Cell name="refreshActive">
        <IconNavigationRefresh24 />
      </Cell>
      <Cell name="nav pin" ingredients={["BrandSymbolIcon"]}>
        <IconNavigatePin />
      </Cell>
      <Cell name="nav marker" ingredients={["IconMarker22"]}>
        <IconNavigateMarker />
      </Cell>
    </div>
  ),
};

export const Normal: Story = {
  name: "icon.normal",
  render: () => (
    <div style={grid}>
      <Cell name="search">
        <IconNormalSearch24 size={20} />
      </Cell>
      <Cell name="searchActive">
        <IconNormalSearch24 size={20} tone="active" />
      </Cell>
      <Cell name="filter">
        <IconFilter20 />
      </Cell>
      <Cell name="x">
        <IconX16 />
      </Cell>
      <Cell name="marker">
        <IconMarker22 />
      </Cell>
      <Cell name="chevronLeft">
        <IconChevronLeft13 />
      </Cell>
      <Cell name="check">
        <IconCheck24 />
      </Cell>
      <Cell name="camera">
        <IconCamera24 />
      </Cell>
      <Cell name="share">
        <IconShare24 />
      </Cell>
      <Cell name="thumbUp">
        <IconThumbUp24 />
      </Cell>
      <Cell name="thumbDown">
        <IconThumbDown24 />
      </Cell>
      <Cell name="arrowLeft">
        <IconNormalArrow24 direction="left" />
      </Cell>
      <Cell name="arrowRight">
        <IconNormalArrow24 direction="right" />
      </Cell>
      <Cell name="arrowUp">
        <IconNormalArrow24 direction="up" />
      </Cell>
      <Cell name="arrowDown">
        <IconNormalArrow24 direction="down" />
      </Cell>
      <Cell name="caution.correct">
        <IconCaution24 state="correct" />
      </Cell>
      <Cell name="caution.error">
        <IconCaution24 state="error" />
      </Cell>
      <Cell name="pencil">
        <IconPencil24 />
      </Cell>
      <Cell name="mapPin">
        <IconNormalMapPin24 />
      </Cell>
      <Cell name="addBox">
        <IconAddBox18 />
      </Cell>
      <Cell name="minusBox">
        <IconMinusBox18 />
      </Cell>
    </div>
  ),
};

export const Brand: Story = {
  name: "icon.brand",
  render: () => (
    <div style={grid}>
      <Cell name="symbol">
        <div style={{ width: 80, height: 80 }}>
          <BrandSymbolIcon />
        </div>
      </Cell>
      <Cell name="large" spanColumns={2} style={{ gridColumn: "span 2" }}>
        <div style={{ width: 158, height: 28 }}>
          <BrandTextLogoLarge />
        </div>
      </Cell>
      <Cell name="small" spanColumns={2} style={{ gridColumn: "span 2" }}>
        <BrandTextLogoSmall />
      </Cell>
    </div>
  ),
};

export const Social: Story = {
  name: "icon.social",
  render: () => (
    <div style={grid}>
      <Cell name="naver">
        <SocialBadge provider="naver">
          <IconNaver19 />
        </SocialBadge>
      </Cell>
      <Cell name="kakao">
        <SocialBadge provider="kakao">
          <IconKakao24 />
        </SocialBadge>
      </Cell>
      <Cell name="google">
        <SocialBadge provider="google">
          <IconGoogle24 />
        </SocialBadge>
      </Cell>
    </div>
  ),
};

export const Circlebox: Story = {
  name: "icon.circlebox",
  render: () => (
    <div style={grid}>
      <Cell name="thumbnail" ingredients={["IconMarker22"]} probeTarget="root">
        <IconThumbnail24 />
      </Cell>
      <Cell name="profile" ingredients={["IconMarker22"]} probeTarget="root">
        <IconNormalProfile />
      </Cell>
      <Cell
        name="clock"
        ingredients={["IconNavigationClock24"]}
        probeTarget="root"
      >
        <IconCircleboxClock32 />
      </Cell>
      <Cell
        name="mike"
        ingredients={["IconNavigationPushPin24"]}
        probeTarget="root"
      >
        <IconCircleboxMike32 />
      </Cell>
      <Cell name="check" ingredients={["IconCheck24"]} probeTarget="root">
        <IconCircleboxCheck32 />
      </Cell>
      <Cell
        name="chevron"
        ingredients={["IconChevronLeft13"]}
        probeTarget="root"
      >
        <IconCircleboxChevron32 />
      </Cell>
      <Cell
        name="unhappy"
        ingredients={["IconCaution24(error)"]}
        probeTarget="root"
      >
        <IconCircleboxUnhappy32 />
      </Cell>
      <Cell
        name="happy"
        ingredients={["IconCaution24(correct)"]}
        probeTarget="root"
      >
        <IconCircleboxHappy32 />
      </Cell>
      <Cell name="filter" ingredients={["IconFilter20"]} probeTarget="root">
        <IconCircleboxFilter32 />
      </Cell>
      <Cell name="thumbUp" ingredients={["IconThumbUp24"]} probeTarget="root">
        <IconCircleboxThumbUp32 />
      </Cell>
      <Cell
        name="thumbDown"
        ingredients={["IconThumbDown24"]}
        probeTarget="root"
      >
        <IconCircleboxThumbDown32 />
      </Cell>
      <Cell
        name="crosshair"
        ingredients={["IconNavigationCrosshair24"]}
        probeTarget="root"
      >
        <IconCircleboxCrosshair48 />
      </Cell>
      <Cell
        name="crosshairActive"
        ingredients={["IconNavigationCrosshair24(active)"]}
        probeTarget="root"
      >
        <IconCircleboxCrosshairActive48 />
      </Cell>
      <Cell name="refresh" probeTarget="root">
        <IconCircleboxRefresh48 state="refresh" />
      </Cell>
      <Cell name="refreshActive" probeTarget="root">
        <IconCircleboxRefresh48 />
      </Cell>
    </div>
  ),
};

export const BottomsheetMenuIcons: Story = {
  name: "icon.bottomsheet.menu",
  render: () => (
    <div style={grid}>
      {(["home", "report", "my", "settings"] as const).flatMap((tab) => [
        <Cell key={`${tab}-off`} name={`${tab}`}>
          <IconSlot>
            <BottomMenuIcon tab={tab} isActive={false} />
          </IconSlot>
        </Cell>,
        <Cell key={`${tab}-on`} name={`${tab}Active`}>
          <IconSlot>
            <BottomMenuIcon tab={tab} isActive />
          </IconSlot>
        </Cell>,
      ])}
    </div>
  ),
};

export const SizeSet: Story = {
  name: "icon.size.s/m/l",
  render: () => (
    <div style={grid}>
      <Cell name="size.s / default">
        <IconSizeS state="default" />
      </Cell>
      <Cell name="size.s / selected">
        <IconSizeS state="selected" />
      </Cell>
      <Cell name="size.s / disabled">
        <IconSizeS state="disabled" />
      </Cell>
      <Cell name="size.m / default">
        <IconSizeM state="default" />
      </Cell>
      <Cell name="size.m / selected">
        <IconSizeM state="selected" />
      </Cell>
      <Cell name="size.m / disabled">
        <IconSizeM state="disabled" />
      </Cell>
      <Cell name="size.l / default">
        <IconSizeL state="default" />
      </Cell>
      <Cell name="size.l / selected">
        <IconSizeL state="selected" />
      </Cell>
      <Cell name="size.l / disabled">
        <IconSizeL state="disabled" />
      </Cell>
    </div>
  ),
};

export const Gallery: Story = {
  name: "all",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 1020,
        margin: "0 auto",
      }}
    >
      <RowSection title="icon.navigation">
        <Cell name="search">
          <IconNavigationSearch24 tone="default" />
        </Cell>
        <Cell name="searchFill">
          <IconNavigationSearch24 tone="active" />
        </Cell>
        <Cell name="star">
          <IconStarOutline24 size={24} />
        </Cell>
        <Cell name="starFill">
          <IconStarFilled24 size={24} />
        </Cell>
        <Cell name="mapPinActive">
          <IconNavigationMapPin24 />
        </Cell>
        <Cell name="mapPinFill">
          <IconNavigationMapPin24Fill />
        </Cell>
        <Cell name="navigate">
          <IconNavigationNavigate24 state="default" />
        </Cell>
        <Cell name="navigateFill">
          <IconNavigationNavigate24 state="active" />
        </Cell>
        <Cell name="clock">
          <IconNavigationClock24 state="default" />
        </Cell>
        <Cell name="clockFill">
          <IconNavigationClock24 state="active" />
        </Cell>
        <Cell name="pushPin">
          <IconNavigationPushPin24 state="default" />
        </Cell>
        <Cell name="pushPinFill">
          <IconNavigationPushPin24 state="active" />
        </Cell>
        <Cell name="crosshair">
          <IconNavigationCrosshair24 state="default" />
        </Cell>
        <Cell name="crosshairActive">
          <IconNavigationCrosshair24 state="active" />
        </Cell>
        <Cell name="refresh">
          <IconNavigationRefresh24 state="refresh" />
        </Cell>
        <Cell name="refreshActive">
          <IconNavigationRefresh24 />
        </Cell>
        <Cell name="nav pin" ingredients={["BrandSymbolIcon"]}>
          <IconNavigatePin />
        </Cell>
        <Cell name="nav marker" ingredients={["IconMarker22"]}>
          <IconNavigateMarker />
        </Cell>
      </RowSection>

      <RowSection title="icon.normal">
        <Cell name="search">
          <IconNormalSearch24 size={24} />
        </Cell>
        <Cell name="searchActive">
          <IconNormalSearch24 size={24} tone="active" />
        </Cell>
        <Cell name="filter">
          <IconFilter20 />
        </Cell>
        <Cell name="x">
          <IconX16 />
        </Cell>
        <Cell name="marker">
          <IconMarker22 />
        </Cell>
        <Cell name="chevronLeft">
          <IconChevronLeft13 />
        </Cell>
        <Cell name="check">
          <IconCheck24 />
        </Cell>
        <Cell name="camera">
          <IconCamera24 />
        </Cell>
        <Cell name="share">
          <IconShare24 />
        </Cell>
        <Cell name="thumbUp">
          <IconThumbUp24 />
        </Cell>
        <Cell name="thumbDown">
          <IconThumbDown24 />
        </Cell>
        <Cell name="arrowLeft">
          <IconNormalArrow24 direction="left" />
        </Cell>
        <Cell name="arrowRight">
          <IconNormalArrow24 direction="right" />
        </Cell>
        <Cell name="arrowUp">
          <IconNormalArrow24 direction="up" />
        </Cell>
        <Cell name="arrowDown">
          <IconNormalArrow24 direction="down" />
        </Cell>
        <Cell name="caution.correct">
          <IconCaution24 state="correct" />
        </Cell>
        <Cell name="caution.error">
          <IconCaution24 state="error" />
        </Cell>
        <Cell name="pencil">
          <IconPencil24 />
        </Cell>
        <Cell name="mapPin">
          <IconNormalMapPin24 />
        </Cell>
        <Cell name="addBox">
          <IconAddBox18 />
        </Cell>
        <Cell name="minusBox">
          <IconMinusBox18 />
        </Cell>
      </RowSection>

      <RowSection title="icon.brand / icon.social">
        <Cell name="symbol">
          <div style={{ width: 80, height: 80 }}>
            <BrandSymbolIcon />
          </div>
        </Cell>
        <Cell name="naver">
          <SocialBadge provider="naver">
            <IconNaver19 />
          </SocialBadge>
        </Cell>
        <Cell name="kakao">
          <SocialBadge provider="kakao">
            <IconKakao24 />
          </SocialBadge>
        </Cell>
        <Cell name="google">
          <SocialBadge provider="google">
            <IconGoogle24 />
          </SocialBadge>
        </Cell>
        <Cell name="large" spanColumns={2}>
          <div style={{ width: 158, height: 28 }}>
            <BrandTextLogoLarge />
          </div>
        </Cell>
        <Cell name="small" spanColumns={2}>
          <BrandTextLogoSmall />
        </Cell>
      </RowSection>

      <RowSection title="icon.circlebox">
        <Cell
          name="thumbnail"
          ingredients={["IconMarker22"]}
          probeTarget="root"
        >
          <IconThumbnail24 />
        </Cell>
        <Cell name="profile" ingredients={["IconMarker22"]} probeTarget="root">
          <IconNormalProfile />
        </Cell>
        <Cell
          name="clock"
          ingredients={["IconNavigationClock24"]}
          probeTarget="root"
        >
          <IconCircleboxClock32 />
        </Cell>
        <Cell
          name="mike"
          ingredients={["IconNavigationPushPin24"]}
          probeTarget="root"
        >
          <IconCircleboxMike32 />
        </Cell>
        <Cell name="check" ingredients={["IconCheck24"]} probeTarget="root">
          <IconCircleboxCheck32 />
        </Cell>
        <Cell
          name="chevron"
          ingredients={["IconChevronLeft13"]}
          probeTarget="root"
        >
          <IconCircleboxChevron32 />
        </Cell>
        <Cell
          name="unhappy"
          ingredients={["IconCaution24(error)"]}
          probeTarget="root"
        >
          <IconCircleboxUnhappy32 />
        </Cell>
        <Cell
          name="happy"
          ingredients={["IconCaution24(correct)"]}
          probeTarget="root"
        >
          <IconCircleboxHappy32 />
        </Cell>
        <Cell name="filter" ingredients={["IconFilter20"]} probeTarget="root">
          <IconCircleboxFilter32 />
        </Cell>
        <Cell name="thumbUp" ingredients={["IconThumbUp24"]} probeTarget="root">
          <IconCircleboxThumbUp32 />
        </Cell>
        <Cell
          name="thumbDown"
          ingredients={["IconThumbDown24"]}
          probeTarget="root"
        >
          <IconCircleboxThumbDown32 />
        </Cell>
        <Cell
          name="crosshair"
          ingredients={["IconNavigationCrosshair24"]}
          probeTarget="root"
        >
          <IconCircleboxCrosshair48 />
        </Cell>
        <Cell
          name="crosshairActive"
          ingredients={["IconNavigationCrosshair24(active)"]}
          probeTarget="root"
        >
          <IconCircleboxCrosshairActive48 />
        </Cell>
        <Cell name="refresh" probeTarget="root">
          <IconCircleboxRefresh48 state="refresh" />
        </Cell>
        <Cell name="refreshActive" probeTarget="root">
          <IconCircleboxRefresh48 />
        </Cell>
      </RowSection>

      <RowSection title="icon.bottomsheet.menu">
        {(["home", "report", "my", "settings"] as const).flatMap((tab) => [
          <Cell key={`${tab}-off`} name={`${tab}`}>
            <IconSlot>
              <BottomMenuIcon tab={tab} isActive={false} />
            </IconSlot>
          </Cell>,
          <Cell key={`${tab}-on`} name={`${tab}Active`}>
            <IconSlot>
              <BottomMenuIcon tab={tab} isActive />
            </IconSlot>
          </Cell>,
        ])}
      </RowSection>

      <RowSection title="icon.size.s/m/l">
        <Cell name="s.default">
          <IconSizeS state="default" />
        </Cell>
        <Cell name="s.selected">
          <IconSizeS state="selected" />
        </Cell>
        <Cell name="s.disabled">
          <IconSizeS state="disabled" />
        </Cell>
        <Cell name="m.default">
          <IconSizeM state="default" />
        </Cell>
        <Cell name="m.selected">
          <IconSizeM state="selected" />
        </Cell>
        <Cell name="m.disabled">
          <IconSizeM state="disabled" />
        </Cell>
        <Cell name="l.default">
          <IconSizeL state="default" />
        </Cell>
        <Cell name="l.selected">
          <IconSizeL state="selected" />
        </Cell>
        <Cell name="l.disabled">
          <IconSizeL state="disabled" />
        </Cell>
      </RowSection>
    </div>
  ),
};
