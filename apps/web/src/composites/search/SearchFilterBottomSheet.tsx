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

  const indoorOutdoorOptions = [
    {
      label:
        m.search_filter_indoor_short(),
      value: "indoor",
    },
    {
      label:
        m.search_filter_outdoor_short(),
      value: "outdoor",
    },
  ];
  const placeTypeOptions = [
    {
      label:
        m.search_filter_place_museum_short(),
      value: "museum",
    },
    {
      label:
        m.search_filter_place_subway_short(),
      value: "subway",
    },
    {
      label:
        m.search_filter_place_department_short(),
      value: "department",
    },
    {
      label:
        m.search_filter_place_convenience_short(),
      value: "convenience",
    },
    {
      label:
        m.search_filter_place_public_short(),
      value: "public",
    },
    {
      label:
        m.search_filter_place_private_short(),
      value: "private",
    },
    {
      label:
        m.search_filter_place_train_short(),
      value: "train",
    },
    {
      label:
        m.search_filter_place_other_short(),
      value: "other",
    },
  ];

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
                  S: m.search_filter_size_small(),
                  M: m.search_filter_size_medium(),
                  L: m.search_filter_size_large(),
                }}
                value={selectedSizes}
                onChange={setSelectedSizes}
              />
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
                ariaLabel={
                  m.search_filter_section_indoor_outdoor_short()
                }
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
                ariaLabel={
                  m.search_filter_section_locker_type_short()
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
    </DraggableBottomSheet>
  );
}
