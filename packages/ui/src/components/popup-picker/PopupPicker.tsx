import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { Button } from "../button/Button.tsx";
import {
  action,
  columnDivider,
  dialColumn,
  dialItem,
  dialList,
  dialog,
  overlay,
  pickerCenterAccessory,
  pickerFrame,
  selection,
  title,
} from "./PopupPicker.css.ts";

const DEFAULT_DIAL_ITEM_HEIGHT = 32;
const DEFAULT_DIAL_VIEWPORT_HEIGHT = 96;
const DEFAULT_DIAL_SELECTION_HEIGHT = 40;
const DEFAULT_DIAL_SELECTION_TOP = 24;
const DEFAULT_DIAL_EDGE_SPACER_HEIGHT = 32;

export interface DialPickerOption {
  value: string;
  label: string;
}

export interface DialPickerColumn {
  id: string;
  value: string;
  options: DialPickerOption[];
  ariaLabel: string;
  isCircular?: boolean;
}

export interface DialPickerProps {
  columns: DialPickerColumn[];
  onColumnChange: (columnId: string, value: string) => void;
  className?: string;
  centerAccessory?: ReactNode;
  itemHeight?: number;
  viewportHeight?: number;
  selectionHeight?: number;
  selectionTop?: number;
  edgeSpacerHeight?: number;
  columnTemplate?: string;
  centerAccessoryLeft?: number;
  centerAccessoryTop?: number;
  centerAccessoryHeight?: number;
  selectedFontSize?: number;
}

export type PopupPickerOption = DialPickerOption;
export type PopupPickerColumn = DialPickerColumn;

export interface PopupPickerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  titleText: string;
  columns: DialPickerColumn[];
  onColumnChange: (columnId: string, value: string) => void;
  primaryAction: {
    label: string;
    onPress: () => void;
  };
  className?: string;
  centerAccessory?: ReactNode;
}

const getOptionIndex = (column: DialPickerColumn) => {
  const selectedIndex = column.options.findIndex(
    (option) => option.value === column.value,
  );

  return selectedIndex === -1 ? 0 : selectedIndex;
};

const getClampedIndex = (index: number, length: number) => {
  return Math.min(Math.max(index, 0), Math.max(length - 1, 0));
};

const getCircularIndex = (index: number, length: number) => {
  if (length <= 0) return 0;

  return ((index % length) + length) % length;
};

interface DialPickerColumnViewProps {
  column: DialPickerColumn;
  hasDivider: boolean;
  itemHeight: number;
  edgeSpacerHeight: number;
  onChange: (columnId: string, value: string) => void;
}

function DialPickerColumnView({
  column: pickerColumn,
  hasDivider,
  itemHeight,
  edgeSpacerHeight,
  onChange,
}: DialPickerColumnViewProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecenteringRef = useRef(false);
  const shouldSkipValueScrollRef = useRef(false);

  const selectedIndex = getOptionIndex(pickerColumn);
  const selectedOption = pickerColumn.options[selectedIndex];
  const isCircular = pickerColumn.isCircular && pickerColumn.options.length > 1;
  const visibleOptions = isCircular
    ? [
        ...pickerColumn.options,
        ...pickerColumn.options,
        ...pickerColumn.options,
      ]
    : pickerColumn.options;
  const selectedVisibleIndex = isCircular
    ? selectedIndex + pickerColumn.options.length
    : selectedIndex;
  const selectedElementId =
    selectedOption &&
    `${pickerColumn.id}-${selectedOption.value}-${selectedVisibleIndex}`;

  const commitIndex = (
    index: number,
    options: { skipValueScroll?: boolean } = {},
  ) => {
    const nextIndex = isCircular
      ? getCircularIndex(index, pickerColumn.options.length)
      : getClampedIndex(index, pickerColumn.options.length);
    const nextOption = pickerColumn.options[nextIndex];

    if (nextOption && nextOption.value !== pickerColumn.value) {
      shouldSkipValueScrollRef.current = options.skipValueScroll ?? false;
      onChange(pickerColumn.id, nextOption.value);
    }
  };

  const recenterCircularIndex = (visibleIndex: number) => {
    const optionCount = pickerColumn.options.length;
    if (!isCircular || optionCount <= 0) return;

    const middleIndex =
      getCircularIndex(visibleIndex, optionCount) + optionCount;
    if (middleIndex === visibleIndex) return;

    const listElement = listRef.current;
    if (!listElement) return;

    isRecenteringRef.current = true;
    listElement.scrollTop = middleIndex * itemHeight;
    requestAnimationFrame(() => {
      isRecenteringRef.current = false;
    });
  };

  const handleScroll = () => {
    if (isRecenteringRef.current) return;

    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }

    scrollEndTimerRef.current = setTimeout(() => {
      const listElement = listRef.current;

      if (!listElement) return;

      const visibleIndex = Math.round(listElement.scrollTop / itemHeight);
      commitIndex(visibleIndex, { skipValueScroll: true });
      recenterCircularIndex(visibleIndex);
    }, 120);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      commitIndex(selectedIndex - 1);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      commitIndex(selectedIndex + 1);
    }
  };

  useEffect(() => {
    const listElement = listRef.current;

    if (!listElement) return;

    if (shouldSkipValueScrollRef.current) {
      shouldSkipValueScrollRef.current = false;
      return;
    }

    listElement.scrollTo({
      top: selectedVisibleIndex * itemHeight,
      behavior: isCircular ? "auto" : "smooth",
    });
  }, [isCircular, itemHeight, selectedVisibleIndex]);

  useEffect(() => {
    return () => {
      if (scrollEndTimerRef.current) {
        clearTimeout(scrollEndTimerRef.current);
      }
    };
  }, []);

  return (
    <fieldset className={dialColumn} aria-label={pickerColumn.ariaLabel}>
      {hasDivider && <div className={columnDivider} />}
      <div
        ref={listRef}
        className={dialList}
        role="listbox"
        tabIndex={0}
        aria-label={pickerColumn.ariaLabel}
        aria-activedescendant={selectedElementId}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
      >
        <div style={{ height: edgeSpacerHeight }} aria-hidden="true" />
        {visibleOptions.map((option, visibleIndex) => {
          const isSelected =
            option.value === pickerColumn.value &&
            visibleIndex === selectedVisibleIndex;

          return (
            <div
              key={`${option.value}-${visibleIndex}`}
              id={`${pickerColumn.id}-${option.value}-${visibleIndex}`}
              className={dialItem}
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
              data-selected={isSelected || undefined}
              style={{ height: itemHeight }}
            >
              {option.label}
            </div>
          );
        })}
        <div style={{ height: edgeSpacerHeight }} aria-hidden="true" />
      </div>
    </fieldset>
  );
}

export function DialPicker({
  columns,
  onColumnChange,
  className,
  centerAccessory,
  itemHeight = DEFAULT_DIAL_ITEM_HEIGHT,
  viewportHeight = DEFAULT_DIAL_VIEWPORT_HEIGHT,
  selectionHeight = DEFAULT_DIAL_SELECTION_HEIGHT,
  selectionTop = DEFAULT_DIAL_SELECTION_TOP,
  edgeSpacerHeight = DEFAULT_DIAL_EDGE_SPACER_HEIGHT,
  columnTemplate,
  centerAccessoryLeft,
  centerAccessoryTop,
  centerAccessoryHeight,
  selectedFontSize,
}: DialPickerProps) {
  const shouldShowColumnDividers = !centerAccessory;

  return (
    <div
      className={[pickerFrame, className].filter(Boolean).join(" ")}
      style={
        {
          "--popup-picker-column-count": String(columns.length),
          "--popup-picker-item-height": `${itemHeight}px`,
          "--popup-picker-viewport-height": `${viewportHeight}px`,
          "--popup-picker-selection-height": `${selectionHeight}px`,
          "--popup-picker-selection-top": `${selectionTop}px`,
          "--popup-picker-column-template": columnTemplate,
          "--popup-picker-accessory-left": centerAccessoryLeft
            ? `${centerAccessoryLeft}px`
            : undefined,
          "--popup-picker-accessory-top": centerAccessoryTop
            ? `${centerAccessoryTop}px`
            : undefined,
          "--popup-picker-accessory-height": centerAccessoryHeight
            ? `${centerAccessoryHeight}px`
            : undefined,
          "--popup-picker-selected-font-size": selectedFontSize
            ? `${selectedFontSize}px`
            : undefined,
        } as CSSProperties
      }
    >
      <div className={selection} aria-hidden="true" />
      {centerAccessory ? (
        <span className={pickerCenterAccessory} aria-hidden="true">
          {centerAccessory}
        </span>
      ) : null}
      {columns.map((pickerColumn, index) => (
        <DialPickerColumnView
          key={pickerColumn.id}
          column={pickerColumn}
          hasDivider={shouldShowColumnDividers && index > 0}
          itemHeight={itemHeight}
          edgeSpacerHeight={edgeSpacerHeight}
          onChange={onColumnChange}
        />
      ))}
    </div>
  );
}

export function PopupPicker({
  isOpen,
  onOpenChange,
  titleText,
  columns,
  onColumnChange,
  primaryAction,
  className,
  centerAccessory,
}: PopupPickerProps) {
  const handlePrimaryPress = () => {
    primaryAction.onPress();
    onOpenChange(false);
  };

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={overlay}
    >
      <Modal className={className}>
        <Dialog className={dialog} aria-label={titleText}>
          <h2 className={title}>{titleText}</h2>
          <DialPicker
            columns={columns}
            onColumnChange={onColumnChange}
            centerAccessory={centerAccessory}
          />
          <Button
            className={action}
            variant="filled"
            intent="primary"
            size="L"
            onPress={handlePrimaryPress}
          >
            {primaryAction.label}
          </Button>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
