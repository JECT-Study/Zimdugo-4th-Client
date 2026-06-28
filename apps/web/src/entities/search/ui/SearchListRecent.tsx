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
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="44.5"
        cy="44.5"
        r="28.5"
        fill={vars.color.palette.gray[500]}
      />
      <path
        d="M53.273 50.293L62.728 59.748L59.748 62.728L50.293 53.273C47.561 55.373 44.201 56.633 40.631 56.633C31.806 56.633 24.661 49.488 24.661 40.663C24.661 31.838 31.806 24.693 40.631 24.693C49.456 24.693 56.601 31.838 56.601 40.663C56.601 44.233 55.341 47.561 53.273 50.293ZM40.631 52.433C47.141 52.433 52.401 47.173 52.401 40.663C52.401 34.153 47.141 28.893 40.631 28.893C34.121 28.893 28.861 34.153 28.861 40.663C28.861 47.173 34.121 52.433 40.631 52.433Z"
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
