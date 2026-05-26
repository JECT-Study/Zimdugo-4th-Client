import { BottomBarFrame } from "@repo/ui/components/layout/bottom-bar-frame";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { BottomMenuIcon, type BottomTabKey } from "@repo/ui/tokens/icons";
import { Link } from "@tanstack/react-router";
import {
  memo,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type AppLanguage,
  useAppLanguageStore,
} from "../../../shared/store/language.ts";
import {
  active,
  iconWrapper,
  inactive,
  labelText,
  skeletonLabel,
  skeletonTabItem,
  tabItem,
} from "./BottomTabBarIcon.css.ts";

export type { BottomTabKey };

const TAB_ORDER: BottomTabKey[] = ["home", "report", "my", "settings"];
const STYLE_READY_CHECK_LIMIT = 20;

const bottomTabStyleProbe: CSSProperties = {
  position: "absolute",
  width: 0,
  height: 0,
  overflow: "hidden",
  pointerEvents: "none",
  visibility: "hidden",
};

const skeletonFallbackStyle: CSSProperties = {
  background: "rgba(230, 232, 235, 0.6)",
};

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

const DEFAULT_LABELS_BY_LANGUAGE = {
  ko: { home: "홈", report: "제보", my: "MY", settings: "설정" },
  en: { home: "Home", report: "Report", my: "MY", settings: "Settings" },
  ja: { home: "ホーム", report: "通報", my: "マイ", settings: "設定" },
  zh: { home: "首页", report: "举报", my: "我的", settings: "设置" },
} satisfies Record<AppLanguage, Record<BottomTabKey, string>>;

export type BottomTabLinks = Record<BottomTabKey, string>;

export interface BottomTabBarProps {
  activeTab: BottomTabKey;
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
  const probeRef = useRef<HTMLDivElement>(null);
  const [isStyleReady, setIsStyleReady] = useState(false);
  const [isStyleTimedOut, setIsStyleTimedOut] = useState(false);
  const defaultLabels = DEFAULT_LABELS_BY_LANGUAGE[appLanguage];

  const getLabel = (key: BottomTabKey) => labels?.[key] ?? defaultLabels[key];

  useEffect(() => {
    let frameId = 0;
    let checkCount = 0;

    const checkStyleReady = () => {
      const probe = probeRef.current;
      if (!probe) return;

      if (isBottomTabStyleReady(probe)) {
        setIsStyleReady(true);
        return;
      }

      if (checkCount >= STYLE_READY_CHECK_LIMIT) {
        setIsStyleTimedOut(true);
        setIsStyleReady(true);
        return;
      }

      checkCount += 1;
      frameId = window.requestAnimationFrame(checkStyleReady);
    };

    frameId = window.requestAnimationFrame(checkStyleReady);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <BottomBarFrame className={className}>
      <div ref={probeRef} className={tabItem} style={bottomTabStyleProbe} />
      {isStyleReady ? (
        TAB_ORDER.map((tabKey) => {
          const isActive = activeTab === tabKey;
          const href = links[tabKey];

          return (
            <BottomTabBarIcon
              key={tabKey}
              to={href}
              isActive={isActive}
              label={getLabel(tabKey)}
              icon={<BottomMenuIcon tab={tabKey} isActive={isActive} />}
              applyFallbackStyle={isStyleTimedOut}
            />
          );
        })
      ) : (
        <BottomTabBarSkeletonItems />
      )}
    </BottomBarFrame>
  );
}

export const BottomTabBar = memo(BottomTabBarComponent);

export function BottomTabBarSkeleton({
  className,
}: {
  className?: string;
}) {
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
        variant="circle"
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

interface BottomTabBarIconProps {
  to: string;
  isActive: boolean;
  label: string;
  icon: ReactNode;
  applyFallbackStyle?: boolean;
}

function BottomTabBarIconComponent({
  to,
  isActive,
  label,
  icon,
  applyFallbackStyle = false,
}: BottomTabBarIconProps) {
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
        {icon}
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

const BottomTabBarIcon = memo(BottomTabBarIconComponent);
