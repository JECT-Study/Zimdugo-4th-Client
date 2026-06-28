import { IconX16 } from "@repo/ui/tokens/icons";
import { vars } from "@repo/ui/vars";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import {
  recentDate,
  recentIconSlot,
  recentLabel,
  recentLeft,
  recentRight,
  recentRow,
  recentTextCol,
  removeBtn,
} from "./SearchList.css.ts";
import { SearchMarkerIcon } from "./SearchMarkerIcon";

export type SearchListRecentKind = "keyword" | "locker" | "place";

export interface SearchListRecentProps {
  children: ReactNode;
  dateLabel: string;
  historyKind?: SearchListRecentKind;
  onPress?: () => void;
  onRemove?: () => void;
  className?: string;
  removeAriaLabel?: string;
}

function RecentHistoryIcon({ kind }: { kind: SearchListRecentKind }) {
  switch (kind) {
    case "keyword":
      return <RecentKeywordIcon />;
    case "locker":
      return <SearchMarkerIcon kind="locker" />;
    case "place":
      return <SearchMarkerIcon kind="place" />;
  }
}

function RecentKeywordIcon() {
  return (
    <svg
      aria-hidden="true"
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="20" fill={vars.color.palette.gray[500]} />
      <path
        d="M25.5 24.1L30 28.6L28.6 30L24.1 25.5C22.8 26.5 21.2 27.1 19.5 27.1C15.3 27.1 11.9 23.7 11.9 19.5C11.9 15.3 15.3 11.9 19.5 11.9C23.7 11.9 27.1 15.3 27.1 19.5C27.1 21.2 26.5 22.8 25.5 24.1ZM19.5 25.1C22.6 25.1 25.1 22.6 25.1 19.5C25.1 16.4 22.6 13.9 19.5 13.9C16.4 13.9 13.9 16.4 13.9 19.5C13.9 22.6 16.4 25.1 19.5 25.1Z"
        fill={vars.color.bg.surface}
      />
    </svg>
  );
}

export function SearchListRecent({
  children,
  dateLabel,
  historyKind = "keyword",
  onPress,
  onRemove,
  className,
  removeAriaLabel = "최근 검색어 삭제",
}: SearchListRecentProps) {
  const handlePress: NonNullable<ButtonProps["onPress"]> = () => {
    onPress?.();
  };

  const handleRemovePress: NonNullable<ButtonProps["onPress"]> = () => {
    onRemove?.();
  };

  return (
    <div className={[recentRow, className].filter(Boolean).join(" ")}>
      <Button className={recentLeft} onPress={handlePress}>
        <span className={recentIconSlot}>
          <RecentHistoryIcon kind={historyKind} />
        </span>
        <div className={recentTextCol}>
          <span className={recentLabel}>{children}</span>
        </div>
      </Button>
      <div className={recentRight}>
        <span className={recentDate}>{dateLabel}</span>
        <Button
          type="button"
          className={removeBtn}
          aria-label={removeAriaLabel}
          onPress={handleRemovePress}
        >
          <IconX16 />
        </Button>
      </div>
    </div>
  );
}
