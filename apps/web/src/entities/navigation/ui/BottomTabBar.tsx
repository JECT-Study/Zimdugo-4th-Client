import { BottomBarFrame } from "@repo/ui/components/layout/bottom-bar-frame";
import { Skeleton } from "@repo/ui/components/feedback/skeleton";
import { BottomMenuIcon, type BottomTabKey } from "@repo/ui/tokens/icons";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  memo,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type AppLanguage,
  useAppLanguageStore,
} from "../../../shared/store/language.ts";
import { SKELETON_SURFACE_STYLE } from "../../../shared/ui/skeleton-style.ts";
import { getActiveBottomTab } from "./bottom-tab-routing.ts";
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

const DEFAULT_LABELS_BY_LANGUAGE = {
  ko: { home: "홈", report: "제보", my: "MY", settings: "설정" },
  en: { home: "Home", report: "Report", my: "MY", settings: "Settings" },
  ja: { home: "ホーム", report: "通報", my: "マイ", settings: "設定" },
  zh: { home: "首页", report: "举报", my: "我的", settings: "设置" },
} satisfies Record<AppLanguage, Record<BottomTabKey, string>>;

export type BottomTabLinks = Record<BottomTabKey, string>;

export interface BottomTabBarProps {
  /**
   * 활성 탭. 미지정(기본)이면 각 탭이 라우터 상태를 자체 구독한다.
   * → 탭 이동 시 BottomTabBar 래퍼는 리렌더되지 않고, 상태가 바뀐 탭만 갱신된다.
   * 값을 지정하면 제어형으로 동작한다(스토리북/테스트 등 라우터가 없거나 강제 지정이 필요한 경우).
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
        TAB_ORDER.map((tabKey) => (
          <BottomTabBarLink
            key={tabKey}
            to={links[tabKey]}
            tabKey={tabKey}
            label={getLabel(tabKey)}
            // 제어형(activeTab 지정)일 때만 override; 미지정이면 링크가 라우터를 자체 구독
            activeOverride={activeTab === undefined ? undefined : activeTab === tabKey}
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
  /** 제어형 override. undefined면 라우터 상태를 자체 구독한다. */
  activeOverride?: boolean;
  applyFallbackStyle?: boolean;
}

/**
 * 탭 1개. 라우터 상태를 "이 탭이 활성인지"라는 boolean으로만 구독하므로,
 * 탭 이동 시 활성 상태가 바뀐 탭(이전/현재)만 리렌더되고 부모(BottomTabBar)는 리렌더되지 않는다.
 */
function BottomTabBarLinkComponent({
  to,
  tabKey,
  label,
  activeOverride,
  applyFallbackStyle = false,
}: BottomTabBarLinkProps) {
  const routerActive = useRouterState({
    select: (state) => getActiveBottomTab(state.location.pathname) === tabKey,
  });
  const isActive = activeOverride ?? routerActive;

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

const BottomTabBarLink = memo(BottomTabBarLinkComponent);
