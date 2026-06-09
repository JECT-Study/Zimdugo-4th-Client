import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import { useEffect, useState } from "react";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { SizeList } from "#/entities/locker/ui/size-card/SizeList";
import { DraggableBottomSheet } from "#/shared/ui/DraggableBottomSheet";
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
} from "./SearchFilterBottomSheet.css.ts";

export interface SearchFilterAppliedState {
  regionActive: boolean;
  sizeActive: boolean;
  placeTypeActive: boolean;
  indoorOutdoorState: string[];
  placeTypeState: string[];
  selectedSizes: SizeCardType[];
}

export interface SearchFilterBottomSheetProps {
  className?: string;
  initialFilters?: SearchFilterAppliedState;
  onCollapseToResults?: () => void;
  onReset?: () => void;
  onApply?: (filters: SearchFilterAppliedState) => void;
}

const DEFAULT_SNAP_POINT = 52;

export const createDefaultSearchFilters = (): SearchFilterAppliedState => ({
  regionActive: false,
  sizeActive: false,
  placeTypeActive: false,
  indoorOutdoorState: [],
  placeTypeState: [],
  selectedSizes: [],
});

export function SearchFilterBottomSheet({
  className,
  initialFilters,
  onCollapseToResults,
  onReset,
  onApply,
}: SearchFilterBottomSheetProps) {
  const t = (m ?? {}) as unknown as Record<
    string,
    (inputs?: Record<string, string>) => string
  >;
  const restoredFilters = initialFilters ?? createDefaultSearchFilters();
  const [collapsedSnap, setCollapsedSnap] = useState(760);
  const [indoorOutdoorState, setIndoorOutdoor] = useState<string[]>(
    restoredFilters.indoorOutdoorState,
  );
  const [placeTypeState, setPlaceType] = useState<string[]>(
    restoredFilters.placeTypeState,
  );
  const [selectedSizes, setSelectedSizes] = useState<SizeCardType[]>(
    restoredFilters.selectedSizes,
  );

  const indoorOutdoorOptions = [
    {
      label:
        t.search_filter_indoor_short?.() ??
        t.search_filter_indoor?.() ??
        "실내",
      value: "indoor",
    },
    {
      label:
        t.search_filter_outdoor_short?.() ??
        t.search_filter_outdoor?.() ??
        "실외",
      value: "outdoor",
    },
  ];
  const placeTypeOptions = [
    {
      label:
        t.search_filter_place_museum_short?.() ??
        t.search_filter_place_museum?.() ??
        "박물관",
      value: "museum",
    },
    {
      label:
        t.search_filter_place_subway_short?.() ??
        t.search_filter_place_subway?.() ??
        "지하철역",
      value: "subway",
    },
    {
      label:
        t.search_filter_place_department_short?.() ??
        t.search_filter_place_department?.() ??
        "백화점",
      value: "department",
    },
    {
      label:
        t.search_filter_place_convenience_short?.() ??
        t.search_filter_place_convenience?.() ??
        "편의점",
      value: "convenience",
    },
    {
      label:
        t.search_filter_place_public_short?.() ??
        t.search_filter_place_public?.() ??
        "공공기관",
      value: "public",
    },
    {
      label:
        t.search_filter_place_private_short?.() ??
        t.search_filter_place_private?.() ??
        "사설 보관함",
      value: "private",
    },
    {
      label:
        t.search_filter_place_train_short?.() ??
        t.search_filter_place_train?.() ??
        "기차역",
      value: "train",
    },
    {
      label:
        t.search_filter_place_other_short?.() ??
        t.search_filter_place_other?.() ??
        "기타",
      value: "other",
    },
  ];

  useEffect(() => {
    const updateCollapsedSnap = () => {
      setCollapsedSnap(window.innerHeight - 24);
    };
    updateCollapsedSnap();
    window.addEventListener("resize", updateCollapsedSnap);
    return () => window.removeEventListener("resize", updateCollapsedSnap);
  }, []);

  useEffect(() => {
    if (!initialFilters) return;

    setIndoorOutdoor(initialFilters.indoorOutdoorState);
    setPlaceType(initialFilters.placeTypeState);
    setSelectedSizes(initialFilters.selectedSizes);
  }, [initialFilters]);

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

  return (
    <DraggableBottomSheet
      snapPoint={DEFAULT_SNAP_POINT}
      minSnapPoint={DEFAULT_SNAP_POINT}
      maxSnapPoint={collapsedSnap}
      onSnapChange={(nextSnap) => {
        if (nextSnap === collapsedSnap) {
          onCollapseToResults?.();
        }
      }}
    >
      <div className={[sheetColumn, className].filter(Boolean).join(" ")}>
        <div className={scrollArea}>
          <div className={section}>
            <LabelTitle size="small">사이즈</LabelTitle>
            <div className={sizeCardSlot}>
              <SizeList
                labels={{
                  S: t.search_filter_size_small?.() ?? "소형",
                  M: t.search_filter_size_medium?.() ?? "중형",
                  L: t.search_filter_size_large?.() ?? "대형",
                }}
                value={selectedSizes}
                onChange={setSelectedSizes}
              />
            </div>
          </div>

          <div className={[section, sectionGap24].join(" ")}>
            <LabelTitle size="small">
              {t.search_filter_section_indoor_outdoor_short?.() ??
                t.search_filter_section_indoor_outdoor?.() ??
                "실내/실외"}
            </LabelTitle>
            <div className={indoorOutdoor}>
              <ControlChipGroup
                options={indoorOutdoorOptions}
                value={indoorOutdoorState}
                onChange={setIndoorOutdoor}
                selectionMode="multiple"
                ariaLabel={
                  t.search_filter_section_indoor_outdoor_short?.() ??
                  t.search_filter_section_indoor_outdoor?.() ??
                  "실내 실외 필터"
                }
              />
            </div>
          </div>

          <div className={[section, sectionGap24].join(" ")}>
            <LabelTitle size="small">
              {t.search_filter_section_locker_type_short?.() ??
                t.search_filter_section_locker_type?.() ??
                "보관함 유형"}
            </LabelTitle>
            <div className={indoorOutdoor}>
              <ControlChipGroup
                options={placeTypeOptions}
                value={placeTypeState}
                onChange={setPlaceType}
                selectionMode="multiple"
                ariaLabel={
                  t.search_filter_section_locker_type_short?.() ??
                  t.search_filter_section_locker_type?.() ??
                  "보관함 유형 필터"
                }
              />
            </div>
          </div>
        </div>

        <div className={bottomActionBar}>
          <Button
            className={resetButton}
            variant="filled"
            intent="neutral"
            size="L"
            onPress={handleReset}
          >
            {t.search_filter_reset?.() ?? "초기화"}
          </Button>
          <Button
            className={applyButton}
            variant="filled"
            intent="primary"
            size="L"
            onPress={handleApply}
          >
            {t.search_filter_view_lockers?.() ?? "보관함 보기"}
          </Button>
        </div>
      </div>
    </DraggableBottomSheet>
  );
}
