import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { SizeList } from "#/entities/locker/ui/size-card/SizeList";
import { useIsomorphicLayoutEffect } from "#/shared/hooks/useIsomorphicLayoutEffect";
import {
  applyButton,
  bottomActionBar,
  indoorOutdoor,
  resetButton,
  scrollArea,
  section,
  sectionGap24,
  sheetColumn,
  sizeCardSlot,
  sizeGuideBox,
  sizeGuideList,
} from "./SearchFilterBottomSheet.css.ts";

/**
 * 필터 화면. 무엇을 담고 있는지만 안다.
 *
 * 어떤 표면에 얹히는지 — 바텀시트인지, 넓은 화면의 패널인지 — 는 모른다. 경로 라우트
 * 전환(#215)에서 화면은 Outlet 의 자식이 되고 표면은 레이아웃이 고른다. 화면이 표면을
 * 직접 렌더하면 그 선택이 라우트에 박혀, 표면을 바꿀 때 라우트를 다시 뜯게 된다.
 *
 * 표면과 주고받는 것은 두 가지뿐이다. 잰 높이를 올려보내고, 얼마나 펼쳐졌는지를 받는다.
 */

export interface SearchFilterAppliedState {
  regionActive: boolean;
  sizeActive: boolean;
  placeTypeActive: boolean;
  indoorOutdoorState: string[];
  placeTypeState: string[];
  selectedSizes: SizeCardType[];
}

export const createDefaultSearchFilters = (): SearchFilterAppliedState => ({
  regionActive: false,
  sizeActive: false,
  placeTypeActive: false,
  indoorOutdoorState: [],
  placeTypeState: [],
  selectedSizes: [],
});

export interface SearchFilterScreenProps {
  className?: string;
  initialFilters?: SearchFilterAppliedState;
  onReset?: () => void;
  onApply?: (filters: SearchFilterAppliedState) => void;
  /**
   * 화면이 차지하는 높이. 표면이 자리를 정하는 데 쓴다.
   *
   * 화면 자신의 것만 잰다. 표면이 위아래에 더 두는 자리는 표면이 더한다. 여기서
   * 함께 더하면 화면이 특정 표면의 치수를 알게 된다.
   */
  onContentHeightChange?: (contentHeightPx: number) => void;
  /**
   * 표면이 얼마나 펼쳐졌는지. 0 이면 접힌 자리, 1 이면 다 펼친 자리다.
   *
   * 펼침이라는 개념이 없는 표면(늘 같은 자리에 있는 패널 등)은 기본값 1 을 그대로
   * 둔다. 화면은 이 값을 액션 바를 부드럽게 띄우는 데만 쓴다.
   */
  expandedProgress?: number;
}

export function SearchFilterScreen({
  className,
  initialFilters,
  onReset,
  onApply,
  onContentHeightChange,
  expandedProgress = 1,
}: SearchFilterScreenProps) {
  const restoredFilters = initialFilters ?? createDefaultSearchFilters();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  /** 늘어나지 않는 내용 자체. 스크롤 영역을 재면 시트가 준 높이가 돌아온다. */
  const contentMeasureRef = useRef<HTMLDivElement>(null);
  const actionBarRef = useRef<HTMLDivElement>(null);
  const [indoorOutdoorState, setIndoorOutdoor] = useState<string[]>(
    restoredFilters.indoorOutdoorState,
  );
  const [placeTypeState, setPlaceType] = useState<string[]>(
    restoredFilters.placeTypeState,
  );
  const [selectedSizes, setSelectedSizes] = useState<SizeCardType[]>(
    restoredFilters.selectedSizes,
  );
  /*
   * 측정 이펙트는 한 번만 붙는다. 콜백을 의존성에 넣으면 부모가 매 렌더 새 함수를
   * 주는 순간 ResizeObserver 가 매번 다시 붙는다.
   */
  const contentHeightChangeRef = useRef(onContentHeightChange);
  contentHeightChangeRef.current = onContentHeightChange;

  const indoorOutdoorOptions = [
    { label: m.search_filter_indoor_short(), value: "indoor" },
    { label: m.search_filter_outdoor_short(), value: "outdoor" },
  ];
  const placeTypeOptions = [
    { label: m.search_filter_place_museum_short(), value: "museum" },
    { label: m.search_filter_place_subway_short(), value: "subway" },
    { label: m.search_filter_place_department_short(), value: "department" },
    { label: m.search_filter_place_convenience_short(), value: "convenience" },
    { label: m.search_filter_place_public_short(), value: "public" },
    { label: m.search_filter_place_private_short(), value: "private" },
    { label: m.search_filter_place_train_short(), value: "train" },
    { label: m.search_filter_place_other_short(), value: "other" },
  ];
  const actionBarStyle: CSSProperties = {
    opacity: 0.88 + expandedProgress * 0.12,
    transform: `translateY(${(1 - expandedProgress) * 8}px)`,
  };

  const handleReset = () => {
    setIndoorOutdoor([]);
    setPlaceType([]);
    setSelectedSizes([]);
    onReset?.();
  };

  const handleApply = () => {
    onApply?.({
      regionActive: indoorOutdoorState.length > 0,
      sizeActive: selectedSizes.length > 0,
      placeTypeActive: placeTypeState.length > 0,
      indoorOutdoorState,
      placeTypeState,
      selectedSizes,
    });
  };

  useIsomorphicLayoutEffect(() => {
    const updateContentHeight = () => {
      const scrollAreaElement = scrollAreaRef.current;
      const actionBar = actionBarRef.current;
      const content = contentMeasureRef.current;

      if (!scrollAreaElement || !actionBar || !content) return;

      /*
       * 스크롤 영역은 flex 로 늘어나서, 내용이 짧으면 scrollHeight 가 "지금 시트가
       * 준 높이" 를 돌려준다. 그 값으로 시트 높이를 정하면 내용이 짧아도 시트가
       * 그대로 커져 아래가 텅 빈다.
       */
      const scrollAreaStyle = window.getComputedStyle(scrollAreaElement);

      contentHeightChangeRef.current?.(
        Math.ceil(
          content.offsetHeight +
            Number.parseFloat(scrollAreaStyle.paddingTop) +
            Number.parseFloat(scrollAreaStyle.paddingBottom) +
            actionBar.offsetHeight,
        ),
      );
    };

    updateContentHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (contentMeasureRef.current)
      resizeObserver.observe(contentMeasureRef.current);
    if (actionBarRef.current) resizeObserver.observe(actionBarRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!initialFilters) return;

    setIndoorOutdoor(initialFilters.indoorOutdoorState);
    setPlaceType(initialFilters.placeTypeState);
    setSelectedSizes(initialFilters.selectedSizes);
  }, [initialFilters]);

  return (
    <div className={[sheetColumn, className].filter(Boolean).join(" ")}>
      <div ref={scrollAreaRef} className={scrollArea}>
        <div ref={contentMeasureRef}>
          <div className={section}>
            <LabelTitle size="small">
              {m.search_filter_section_size()}
            </LabelTitle>
            <div className={sizeCardSlot}>
              <SizeList
                labels={{
                  S: m.search_filter_size_small(),
                  M: m.search_filter_size_medium(),
                  L: m.search_filter_size_large(),
                }}
                value={selectedSizes}
                onChange={setSelectedSizes}
              />
            </div>
            <div className={sizeGuideBox}>
              <ul className={sizeGuideList}>
                <li>
                  <b>{m.report_size_s()}</b>: {m.report_size_guide_s()}
                </li>
                <li>
                  <b>{m.report_size_m()}</b>: {m.report_size_guide_m()}
                </li>
                <li>
                  <b>{m.report_size_l()}</b>: {m.report_size_guide_l()}
                </li>
              </ul>
            </div>
          </div>

          <div className={[section, sectionGap24].join(" ")}>
            <LabelTitle size="small">
              {m.search_filter_section_indoor_outdoor_short()}
            </LabelTitle>
            <div className={indoorOutdoor}>
              <ControlChipGroup
                options={indoorOutdoorOptions}
                value={indoorOutdoorState}
                onChange={setIndoorOutdoor}
                selectionMode="multiple"
                ariaLabel={m.search_filter_section_indoor_outdoor_short()}
              />
            </div>
          </div>

          <div className={[section, sectionGap24].join(" ")}>
            <LabelTitle size="small">
              {m.search_filter_section_locker_type_short()}
            </LabelTitle>
            <div className={indoorOutdoor}>
              <ControlChipGroup
                options={placeTypeOptions}
                value={placeTypeState}
                onChange={setPlaceType}
                selectionMode="multiple"
                ariaLabel={m.search_filter_section_locker_type_short()}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        ref={actionBarRef}
        className={bottomActionBar}
        style={actionBarStyle}
      >
        <Button
          className={resetButton}
          variant="filled"
          intent="neutral"
          size="L"
          onPress={handleReset}
        >
          {m.search_filter_reset()}
        </Button>
        <Button
          className={applyButton}
          variant="filled"
          intent="primary"
          size="L"
          onPress={handleApply}
        >
          {m.search_filter_view_lockers()}
        </Button>
      </div>
    </div>
  );
}
