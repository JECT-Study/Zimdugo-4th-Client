import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import { useEffect, useState } from "react";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { SizeList } from "#/entities/locker/ui/size-card/SizeList";
import { formatPriceInput } from "#/features/report/lib/sanitizePriceInput";
import { ReportPriceSectionView } from "#/features/report/ui/ReportPriceSection";
import type { LockerType } from "#/shared/types/locker-type";
import { ReportTypeSection } from "#/features/report/ui/ReportTypeSection";
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
import {
  normalizeSearchFilterPriceRange,
  validateSearchFilterPrice,
} from "./search-filter-price-validation";

type SearchFilterPriceType = "free" | "paid" | "none";

export interface SearchFilterAppliedState {
  regionActive: boolean;
  sizePriceActive: boolean;
  placeTypeActive: boolean;
  priceType: SearchFilterPriceType;
  minPrice: string;
  maxPrice: string;
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
  sizePriceActive: false,
  placeTypeActive: false,
  priceType: "none",
  minPrice: "",
  maxPrice: "",
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
  const [priceType, setPriceType] = useState<SearchFilterPriceType>(
    restoredFilters.priceType,
  );
  const [minPrice, setMinPrice] = useState(restoredFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(restoredFilters.maxPrice);
  const [indoorOutdoorState, setIndoorOutdoor] = useState<string[]>(
    restoredFilters.indoorOutdoorState,
  );
  const [placeTypeState, setPlaceType] = useState<string[]>(
    restoredFilters.placeTypeState,
  );
  const [selectedSizes, setSelectedSizes] = useState<SizeCardType[]>(
    restoredFilters.selectedSizes,
  );
  const [priceErrorMessage, setPriceErrorMessage] = useState<
    string | undefined
  >();

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

    setPriceType(initialFilters.priceType);
    setMinPrice(initialFilters.minPrice);
    setMaxPrice(initialFilters.maxPrice);
    setIndoorOutdoor(initialFilters.indoorOutdoorState);
    setPlaceType(initialFilters.placeTypeState);
    setSelectedSizes(initialFilters.selectedSizes);
  }, [initialFilters]);

  const handleReset = () => {
    setPriceType("none");
    setMinPrice("");
    setMaxPrice("");
    setPriceErrorMessage(undefined);
    setIndoorOutdoor([]);
    setPlaceType([]);
    setSelectedSizes([]);
    onReset?.();
  };

  const handleApply = () => {
    const nextPriceErrorMessage = validateSearchFilterPrice({
      priceType,
      minPrice,
      maxPrice,
      messages: {
        invalidRange: () =>
          t.search_filter_error_price_range?.() ??
          "올바른 가격 범위를 입력해주세요.",
      },
    });

    if (nextPriceErrorMessage) {
      setPriceErrorMessage(nextPriceErrorMessage);
      return;
    }

    setPriceErrorMessage(undefined);

    const hasPriceFilter =
      priceType !== "none" || minPrice.length > 0 || maxPrice.length > 0;

    onApply?.({
      regionActive: indoorOutdoorState.length > 0,
      sizePriceActive: hasPriceFilter || selectedSizes.length > 0,
      placeTypeActive: placeTypeState.length > 0,
      priceType,
      minPrice,
      maxPrice,
      indoorOutdoorState,
      placeTypeState,
      selectedSizes,
    });
  };

  const handleNormalizePriceRange = (changedField: "min" | "max") => {
    const normalizedRange = normalizeSearchFilterPriceRange({
      minPrice,
      maxPrice,
      changedField,
    });

    setMinPrice(normalizedRange.minPrice);
    setMaxPrice(normalizedRange.maxPrice);
    setPriceErrorMessage(undefined);
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

          <div className={[sectionGap24].join(" ")}>
            <ReportPriceSectionView
              priceType={priceType}
              setPriceType={(nextPriceType) => {
                setPriceType(nextPriceType);
                if (nextPriceType !== "paid") {
                  setMinPrice("");
                  setMaxPrice("");
                }
                setPriceErrorMessage(undefined);
              }}
              minPrice={minPrice}
              setMinPrice={(nextMinPrice) => {
                setMinPrice(nextMinPrice);
                setPriceErrorMessage(undefined);
              }}
              maxPrice={maxPrice}
              setMaxPrice={(nextMaxPrice) => {
                setMaxPrice(nextMaxPrice);
                setPriceErrorMessage(undefined);
              }}
              errorMessage={priceErrorMessage}
              formatPrice={formatPriceInput}
              onMinPriceBlur={() => handleNormalizePriceRange("min")}
              onMaxPriceBlur={() => handleNormalizePriceRange("max")}
            />
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
                selectionMode="single"
                ariaLabel={
                  t.search_filter_section_indoor_outdoor_short?.() ??
                  t.search_filter_section_indoor_outdoor?.() ??
                  "실내 실외 필터"
                }
              />
            </div>
          </div>

          <div className={sectionGap24}>
            <ReportTypeSection
              title={
                t.search_filter_section_locker_type_short?.() ??
                t.search_filter_section_locker_type?.() ??
                "보관함 유형"
              }
              showRequiredMark={false}
              lockerType={(placeTypeState[0] as LockerType | undefined) ?? null}
              onChange={(value) => setPlaceType(value ? [value] : [])}
              options={placeTypeOptions}
              selectionMode="single"
            />
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
