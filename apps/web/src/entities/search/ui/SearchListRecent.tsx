import {
  IconLockerDetailHeader24,
  IconSearchAutocompletePlace14,
  IconSearchRecentItem24,
  IconX16,
} from "@repo/ui/tokens/icons";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "react-aria-components";
import {
  recentDate,
  recentIconSlot,
  recentLabel,
  recentLeft,
  recentPlaceIcon,
  recentRight,
  recentRow,
  recentTextCol,
  removeBtn,
} from "./SearchList.css.ts";

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
    case "locker":
      return <IconLockerDetailHeader24 />;
    case "place":
      return (
        <span className={recentPlaceIcon}>
          <IconSearchAutocompletePlace14 />
        </span>
      );
    default:
      return <IconSearchRecentItem24 />;
  }
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
