import type { Key } from "react";
import {
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagList as AriaTagList,
  type Selection,
} from "react-aria-components";
import { chipGroupItem, groupRoot, staggeredRoot } from "./ChipGroup.css.ts";

export interface ChipGroupOption {
  label: string;
  value: string;
}

export interface ChipGroupProps {
  /** 렌더링할 chip 옵션 목록 */
  options: ChipGroupOption[];
  /** 현재 선택된 값 */
  selectedKeys?: Selection;
  /** 호환용 value API */
  value?: string[];
  /** 선택 값이 변경될 때 호출되는 핸들러 */
  onSelectionChange?: (keys: Selection) => void;
  /** 호환용 onChange API */
  onChange?: (keys: string[]) => void;
  /** 단일 선택 또는 다중 선택 모드 */
  selectionMode?: "single" | "multiple" | "none";
  /** 그룹 접근성 레이블 */
  ariaLabel?: string;
  /** 추가 클래스 이름 */
  className?: string;
  /** chip 크기 */
  chipSize?: "small" | "medium";
  /** 비활성화 여부 */
  isDisabled?: boolean;
  /** 레이아웃 모드: 기본 wrap / 1,2행 엇갈림 배치 */
  layout?: "wrap" | "staggered";
}

/**
 * react-aria-components TagGroup으로 상태 관리와 접근성을 제공하는 ChipGroup 컴포넌트.
 */
export function ChipGroup({
  options,
  selectedKeys,
  value,
  onSelectionChange,
  onChange,
  selectionMode = "single",
  ariaLabel,
  className,
  chipSize = "medium",
  isDisabled = false,
  layout = "wrap",
}: ChipGroupProps) {
  const resolvedSelectedKeys =
    selectedKeys ?? (value ? new Set(value) : undefined);
  const resolvedAriaLabel = ariaLabel ?? "chip options";

  const handleSelectionChange = (keys: Selection) => {
    onSelectionChange?.(keys);
    if (!onChange) return;
    if (keys === "all") {
      onChange(options.map((option) => option.value));
      return;
    }
    onChange(Array.from(keys as Set<Key>).map((key) => String(key)));
  };

  const containerClassName = [
    layout === "staggered" ? staggeredRoot : groupRoot,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AriaTagGroup
      aria-label={resolvedAriaLabel}
      selectionMode={selectionMode}
      selectedKeys={resolvedSelectedKeys}
      onSelectionChange={handleSelectionChange}
      disabledKeys={isDisabled ? options.map((option) => option.value) : undefined}
      className={containerClassName}
    >
      <AriaTagList items={options} className={containerClassName}>
        {(item: ChipGroupOption) => (
          <AriaTag id={item.value} className={chipGroupItem({ size: chipSize })}>
            {item.label}
          </AriaTag>
        )}
      </AriaTagList>
    </AriaTagGroup>
  );
}
