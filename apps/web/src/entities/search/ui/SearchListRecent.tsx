import { IconThumbnail24, IconX16 } from "@repo/ui/tokens/icons";
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

export interface SearchListRecentProps {
  children: ReactNode; // query -> children
  dateLabel: string;
  onPress?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function SearchListRecent({
  children,
  dateLabel,
  onPress,
  onRemove,
  className,
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
          <IconThumbnail24 />
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
          aria-label="최근 검색 삭제"
          onPress={handleRemovePress}
        >
          <IconX16 />
        </Button>
      </div>
    </div>
  );
}
