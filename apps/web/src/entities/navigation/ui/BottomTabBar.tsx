import { BottomBarFrame } from "@repo/ui/components/layout/bottom-bar-frame";
import { BottomMenuIcon, type BottomTabKey } from "@repo/ui/tokens/icons";
import { Link } from "@tanstack/react-router";
import { memo, type ReactNode } from "react";
import {
  type AppLanguage,
  useAppLanguageStore,
} from "../../../shared/store/language.ts";
import {
  active,
  iconWrapper,
  inactive,
  labelText,
  tabItem,
} from "./BottomTabBarIcon.css.ts";

export type { BottomTabKey };

const TAB_ORDER: BottomTabKey[] = ["home", "report", "my", "settings"];

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
  const defaultLabels = DEFAULT_LABELS_BY_LANGUAGE[appLanguage];

  const getLabel = (key: BottomTabKey) => labels?.[key] ?? defaultLabels[key];

  return (
    <BottomBarFrame className={className}>
      {TAB_ORDER.map((tabKey) => {
        const isActive = activeTab === tabKey;
        const href = links[tabKey];

        return (
          <BottomTabBarIcon
            key={tabKey}
            to={href}
            isActive={isActive}
            label={getLabel(tabKey)}
            icon={<BottomMenuIcon tab={tabKey} isActive={isActive} />}
          />
        );
      })}
    </BottomBarFrame>
  );
}

export const BottomTabBar = memo(BottomTabBarComponent);

interface BottomTabBarIconProps {
  to: string;
  isActive: boolean;
  label: string;
  icon: ReactNode;
}

function BottomTabBarIconComponent({
  to,
  isActive,
  label,
  icon,
}: BottomTabBarIconProps) {
  return (
    <Link to={to} className={tabItem}>
      <div className={iconWrapper}>{icon}</div>
      <span className={[labelText, isActive ? active : inactive].join(" ")}>
        {label}
      </span>
    </Link>
  );
}

const BottomTabBarIcon = memo(BottomTabBarIconComponent);
