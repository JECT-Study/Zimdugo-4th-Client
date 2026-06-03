import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { BottomBarFrame } from "@repo/ui/components/layout/bottom-bar-frame";
import { BottomMenuIcon, type BottomTabKey } from "@repo/ui/tokens/icons";
import { Link, useRouterState } from "@tanstack/react-router";
import { type CSSProperties, memo, useEffect } from "react";
import {
  type AppLanguage,
  useAppLanguageStore,
} from "@/shared/store/language.ts";
import { SKELETON_SURFACE_STYLE } from "@/shared/ui/skeleton-style.ts";
import {
  type StyleReadyProbe,
  useStyleReadyProbe,
} from "@/shared/ui/useStyleReadyProbe.ts";
import {
  active,
  iconWrapper,
  inactive,
  labelText,
  skeletonLabel,
  skeletonTabItem,
  tabItem,
} from "./BottomTabBarIcon.css.ts";
import { getActiveBottomTab } from "./bottom-tab-routing.ts";

export type { BottomTabKey };

const TAB_ORDER: BottomTabKey[] = ["home", "report", "my", "settings"];

const skeletonFallbackStyle: CSSProperties = SKELETON_SURFACE_STYLE;

const skeletonTabItemFallbackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  flex: 1,
  height: "100%",
  minWidth: 48,
  gap: 4,
};

const bottomTabItemFallbackStyle: CSSProperties = {
  ...skeletonTabItemFallbackStyle,
  textDecoration: "none",
  color: "inherit",
};

const iconWrapperFallbackStyle: CSSProperties = {
  width: 24,
  height: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const labelTextFallbackStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  textAlign: "center",
};

const isBottomTabStyleReady = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);

  return (
    style.display === "flex" &&
    style.flexDirection === "column" &&
    style.alignItems === "center" &&
    style.justifyContent === "center"
  );
};

const BOTTOM_TAB_STYLE_PROBES: StyleReadyProbe[] = [
  { className: tabItem, isReady: isBottomTabStyleReady },
];

let hasBottomTabStyleResolved = false;

const DEFAULT_LABELS_BY_LANGUAGE = {
  ko: { home: "홈", report: "제보", my: "MY", settings: "설정" },
  en: { home: "Home", report: "Report", my: "MY", settings: "Settings" },
  ja: { home: "ホーム", report: "通報", my: "マイ", settings: "設定" },
  zh: { home: "首页", report: "举报", my: "我的", settings: "设置" },
} satisfies Record<AppLanguage, Record<BottomTabKey, string>>;

export type BottomTabLinks = Record<BottomTabKey, string>;

export interface BottomTabBarProps {
  /**
   * Controlled active tab for stories/tests. When omitted, each link subscribes
   * to the router and only the previous/current active links update on route
   * changes instead of rerendering the whole bar.
   */
  activeTab?: BottomTabKey;
  links: BottomTabLinks;
  labels?: Partial<Record<BottomTabKey, string>>;
  className?: string;
}

function BottomTabBarComponent({
  activeTab,
  links,
  labels,
  className,
}: BottomTabBarProps) {
  const appLanguage = useAppLanguageStore((state) => state.appLanguage);
  const shouldProbeStyle = !hasBottomTabStyleResolved;
  const { isStyleReady, isStyleTimedOut } = useStyleReadyProbe({
    enabled: shouldProbeStyle,
    probes: BOTTOM_TAB_STYLE_PROBES,
  });
  const defaultLabels = DEFAULT_LABELS_BY_LANGUAGE[appLanguage];

  const getLabel = (key: BottomTabKey) => labels?.[key] ?? defaultLabels[key];

  useEffect(() => {
    if (shouldProbeStyle && isStyleReady) {
      hasBottomTabStyleResolved = true;
    }
  }, [shouldProbeStyle, isStyleReady]);

  return (
    <BottomBarFrame className={className}>
      {isStyleReady ? (
        TAB_ORDER.map((tabKey) => (
          <BottomTabBarLink
            key={tabKey}
            to={links[tabKey]}
            tabKey={tabKey}
            label={getLabel(tabKey)}
            activeOverride={
              activeTab === undefined ? undefined : activeTab === tabKey
            }
            applyFallbackStyle={isStyleTimedOut}
          />
        ))
      ) : (
        <BottomTabBarSkeletonItems />
      )}
    </BottomBarFrame>
  );
}

export const BottomTabBar = memo(BottomTabBarComponent);

export function BottomTabBarSkeleton({ className }: { className?: string }) {
  return (
    <BottomBarFrame className={className}>
      <BottomTabBarSkeletonItems />
    </BottomBarFrame>
  );
}

function BottomTabBarSkeletonItems() {
  return TAB_ORDER.map((tabKey) => (
    <div
      key={tabKey}
      className={skeletonTabItem}
      style={skeletonTabItemFallbackStyle}
      aria-hidden="true"
    >
      <Skeleton
        width={24}
        height={24}
        variant="rect"
        borderRadius={9999}
        style={skeletonFallbackStyle}
      />
      <Skeleton
        width={32}
        height={10}
        borderRadius={5}
        className={skeletonLabel}
        style={skeletonFallbackStyle}
      />
    </div>
  ));
}

interface BottomTabBarLinkProps {
  to: string;
  tabKey: BottomTabKey;
  label: string;
  /** Controlled active override. Undefined means the link subscribes to router state. */
  activeOverride?: boolean;
  applyFallbackStyle?: boolean;
}

function BottomTabBarLinkComponent(props: BottomTabBarLinkProps) {
  const { activeOverride, ...rest } = props;

  if (activeOverride !== undefined) {
    return (
      <BottomTabBarLinkControlled {...rest} activeOverride={activeOverride} />
    );
  }

  return <BottomTabBarLinkRouter {...rest} />;
}

interface BottomTabBarLinkContentProps extends BottomTabBarLinkProps {
  isActive: boolean;
}

function BottomTabBarLinkContent({
  to,
  tabKey,
  label,
  isActive,
  applyFallbackStyle = false,
}: BottomTabBarLinkContentProps) {
  return (
    <Link
      to={to}
      className={tabItem}
      style={applyFallbackStyle ? bottomTabItemFallbackStyle : undefined}
    >
      <div
        className={iconWrapper}
        style={applyFallbackStyle ? iconWrapperFallbackStyle : undefined}
      >
        <BottomMenuIcon tab={tabKey} isActive={isActive} />
      </div>
      <span
        className={[labelText, isActive ? active : inactive].join(" ")}
        style={applyFallbackStyle ? labelTextFallbackStyle : undefined}
      >
        {label}
      </span>
    </Link>
  );
}

function BottomTabBarLinkControlled({
  activeOverride,
  ...rest
}: BottomTabBarLinkProps & { activeOverride: boolean }) {
  return <BottomTabBarLinkContent {...rest} isActive={activeOverride} />;
}

/**
 * Each link selects only its own active state so route changes rerender the
 * previous and current active links instead of the whole BottomTabBar.
 */
function BottomTabBarLinkRouter(props: BottomTabBarLinkProps) {
  const routerActive = useRouterState({
    select: (state) =>
      getActiveBottomTab(state.location.pathname) === props.tabKey,
  });

  return <BottomTabBarLinkContent {...props} isActive={routerActive} />;
}

const BottomTabBarLink = memo(BottomTabBarLinkComponent);
