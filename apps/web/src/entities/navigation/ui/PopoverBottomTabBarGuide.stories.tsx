import type { Meta, StoryObj } from "@storybook/react";
import { setLanguageTag } from "@repo/i18n";
import { Popover } from "@repo/ui/components/popover";
import { vars } from "@repo/ui/vars";
import type React from "react";
import { useLayoutEffect, useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import { useAppLanguageStore } from "@/shared/store/language.ts";
import { BottomTabBar, type BottomTabKey } from "./BottomTabBar.tsx";
import { storyRelativeFrame } from "./BottomTabBar.stories.css.ts";

const meta = {
  title: "Shared/Layout/Popover",
  component: Popover,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultLinks = {
  home: "#",
  report: "#",
  my: "#",
  settings: "#",
} satisfies Record<BottomTabKey, string>;

const TAB_ORDER = ["home", "report", "my", "settings"] as const;

const TAB_LABELS = {
  home: "홈",
  report: "제보",
  my: "마이",
  settings: "설정",
} satisfies Record<BottomTabKey, string>;

const GUIDE_TEXT =
  "선택한 하단 탭을 안내하는 말풍선입니다. 탭 위치에 따라 꼬리 위치를 0~100 값으로 조정합니다.";

const FRAME_WIDTH = 375;
const POPOVER_WIDTH = 240;
const TAB_COUNT = TAB_ORDER.length;
const TAB_BAR_HEIGHT = 60;
const POPOVER_EDGE_PADDING = 12;

const ensureKoreanHydrated = () => {
  setLanguageTag("ko");
  useAppLanguageStore.setState({
    appLanguage: "ko",
    hasHydrated: true,
    hasInitialized: true,
  });
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getFallbackTabCenterX = (tab: BottomTabKey) => {
  const index = TAB_ORDER.indexOf(tab);
  const tabWidth = FRAME_WIDTH / TAB_COUNT;

  return index * tabWidth + tabWidth / 2;
};

const getPopoverLeft = (anchorCenterX: number) =>
  clamp(
    anchorCenterX - POPOVER_WIDTH / 2,
    POPOVER_EDGE_PADDING,
    FRAME_WIDTH - POPOVER_WIDTH - POPOVER_EDGE_PADDING,
  );

const getTailPosition = (anchorCenterX: number, popoverLeft: number) => {
  const tailPosition =
    ((anchorCenterX - popoverLeft) / POPOVER_WIDTH) * 100;

  return clamp(tailPosition, 0, 100);
};

interface PopoverMetrics {
  popoverLeft: number;
  tailPosition: number;
}

const getFallbackMetrics = (tab: BottomTabKey): PopoverMetrics => {
  const anchorCenterX = getFallbackTabCenterX(tab);
  const popoverLeft = getPopoverLeft(anchorCenterX);

  return {
    popoverLeft,
    tailPosition: getTailPosition(anchorCenterX, popoverLeft),
  };
};

const getGuideTriggerStyle = ({
  popoverLeft,
}: PopoverMetrics): React.CSSProperties => {
  return {
    position: "absolute",
    left: popoverLeft + POPOVER_WIDTH / 2,
    bottom: TAB_BAR_HEIGHT,
    width: 1,
    height: 1,
    padding: 0,
    border: 0,
    background: "transparent",
    color: "transparent",
    cursor: "default",
  };
};

function BottomTabPopoverPreview({ activeTab }: { activeTab: BottomTabKey }) {
  const [metrics, setMetrics] = useState<PopoverMetrics>(() =>
    getFallbackMetrics(activeTab),
  );
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!portalContainer) return;

    const tabIndex = TAB_ORDER.indexOf(activeTab);
    const tabElement = portalContainer.querySelectorAll("a").item(tabIndex);
    const iconElement = tabElement?.querySelector("svg");

    if (!iconElement) {
      setMetrics(getFallbackMetrics(activeTab));
      return;
    }

    const frameRect = portalContainer.getBoundingClientRect();
    const iconRect = iconElement.getBoundingClientRect();
    const anchorCenterX =
      iconRect.left + iconRect.width / 2 - frameRect.left;
    const popoverLeft = getPopoverLeft(anchorCenterX);

    setMetrics({
      popoverLeft,
      tailPosition: getTailPosition(anchorCenterX, popoverLeft),
    });
  }, [activeTab, portalContainer]);

  return (
    <div
      ref={setPortalContainer}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        width: 375,
        height: 360,
        overflow: "visible",
        borderRadius: 24,
        backgroundColor: vars.color.bg.surface,
        boxShadow: "0 16px 48px rgba(22, 24, 28, 0.18)",
      }}
    >
      {portalContainer ? (
        <Popover
          isOpen
          placement="top"
          offset={12}
          tailPosition={metrics.tailPosition}
          portalContainer={portalContainer}
          trigger={
            <AriaButton
              aria-label={`${TAB_LABELS[activeTab]} 탭 안내 기준점`}
              style={getGuideTriggerStyle(metrics)}
            />
          }
          titleText={`${TAB_LABELS[activeTab]} 탭 안내`}
          bodyText={GUIDE_TEXT}
          primaryAction={{ label: "Button" }}
        />
      ) : null}
      <BottomTabBar
        activeTab={activeTab}
        links={defaultLinks}
        labels={TAB_LABELS}
        className={storyRelativeFrame}
      />
    </div>
  );
}

ensureKoreanHydrated();

function BottomTabBarGuideGrid() {
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        padding: "48px 32px",
        backgroundColor: vars.color.bg.default,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, 375px)",
          placeItems: "center",
          justifyContent: "center",
          gap: 32,
          width: "100%",
          maxWidth: 820,
          margin: "0 auto",
          overflow: "visible",
        }}
      >
        {TAB_ORDER.map((tab) => (
          <BottomTabPopoverPreview key={tab} activeTab={tab} />
        ))}
      </div>
    </div>
  );
}

export const BottomTabBarGuide: Story = {
  name: "BottomTabBar Guide",
  render: () => <BottomTabBarGuideGrid />,
};
