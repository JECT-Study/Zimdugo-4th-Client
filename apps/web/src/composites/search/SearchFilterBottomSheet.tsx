import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { ControlChipGroup } from "@repo/ui/components/control-chip-group";
import { LabelTitle } from "@repo/ui/components/label-title";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";
import { SizeList } from "#/entities/locker/ui/size-card/SizeList";
import {
  type BottomSheetLiveOffsetState,
  DraggableBottomSheet,
  resolveBottomSheetExpandedProgress,
} from "#/shared/ui/DraggableBottomSheet";
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
  snapBehavior?: SearchBottomSheetSnapBehavior;
  animateOnMount?: boolean;
  initialSnapPoint?: number;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  onCollapseToResults?: () => void;
  onReset?: () => void;
  onApply?: (filters: SearchFilterAppliedState) => void;
  onSnapChange?: (nextSnap: number) => void;
}

const SEARCH_FILTER_FULL_TOP_OFFSET = 112;
const LEGACY_SEARCH_FILTER_FULL_TOP_OFFSET = 52;
const SEARCH_FILTER_DISMISS_VISIBLE_HEIGHT = 24;
const SEARCH_FILTER_DRAG_SENSITIVITY = 1.2;
const SEARCH_FILTER_SHEET_TOP_PADDING = 16;

export type SearchBottomSheetSnapBehavior = "detail" | "legacy";
export const SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR: SearchBottomSheetSnapBehavior =
  "detail";

interface ResolveSearchFilterSnapPointsOptions {
  windowHeight: number;
  behavior?: SearchBottomSheetSnapBehavior;
  minSnapPoint?: number;
  snapPoint?: number;
  maxSnapPoint?: number;
  contentHeight?: number;
}

export const resolveLegacySearchFilterSnapPoints = ({
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
}: Omit<ResolveSearchFilterSnapPointsOptions, "behavior">) => {
  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - SEARCH_FILTER_DISMISS_VISIBLE_HEIGHT;
  const resolvedMinSnapPoint =
    minSnapPoint ?? LEGACY_SEARCH_FILTER_FULL_TOP_OFFSET;
  const resolvedSnapPoint = snapPoint ?? resolvedMinSnapPoint;
  const resolvedMiniSnapPoint =
    resolvedSnapPoint + (resolvedMaxSnapPoint - resolvedSnapPoint) / 2;

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

export const resolveSearchFilterSnapPoints = ({
  behavior = SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR,
  maxSnapPoint,
  minSnapPoint,
  snapPoint,
  windowHeight,
  contentHeight,
}: ResolveSearchFilterSnapPointsOptions) => {
  if (behavior === "legacy") {
    return resolveLegacySearchFilterSnapPoints({
      maxSnapPoint,
      minSnapPoint,
      snapPoint,
      windowHeight,
    });
  }

  const resolvedMaxSnapPoint =
    maxSnapPoint ?? windowHeight - SEARCH_FILTER_DISMISS_VISIBLE_HEIGHT;
  const maxFullVisibleHeight = windowHeight - SEARCH_FILTER_FULL_TOP_OFFSET;
  const resolvedContentHeight =
    contentHeight !== undefined
      ? Math.min(contentHeight, maxFullVisibleHeight)
      : maxFullVisibleHeight;
  const contentBasedTopOffset = windowHeight - resolvedContentHeight;
  const resolvedMinSnapPoint =
    minSnapPoint ??
    Math.max(SEARCH_FILTER_FULL_TOP_OFFSET, contentBasedTopOffset);
  const resolvedSnapPoint = snapPoint ?? resolvedMinSnapPoint;

  return {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: undefined,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  };
};

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
  snapBehavior = SEARCH_BOTTOM_SHEET_SNAP_BEHAVIOR,
  animateOnMount = false,
  initialSnapPoint,
  minSnapPoint,
  snapPoint,
  maxSnapPoint,
  onCollapseToResults,
  onReset,
  onApply,
  onSnapChange,
}: SearchFilterBottomSheetProps) {
  const restoredFilters = initialFilters ?? createDefaultSearchFilters();
  const [windowHeight, setWindowHeight] = useState(812);
  const [contentHeight, setContentHeight] = useState<number | undefined>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const actionBarRef = useRef<HTMLDivElement>(null);
  const {
    maxSnapPoint: resolvedMaxSnapPoint,
    miniSnapPoint: resolvedMiniSnapPoint,
    minSnapPoint: resolvedMinSnapPoint,
    snapPoint: resolvedSnapPoint,
  } = resolveSearchFilterSnapPoints({
    behavior: snapBehavior,
    maxSnapPoint,
    minSnapPoint,
    snapPoint,
    windowHeight,
    contentHeight,
  });
  const resolvedInitialSnapPoint =
    initialSnapPoint !== undefined
      ? Math.min(
          resolvedMaxSnapPoint,
          Math.max(resolvedMinSnapPoint, initialSnapPoint),
        )
      : resolvedSnapPoint;
  const [expandedProgress, setExpandedProgress] = useState(() =>
    resolveBottomSheetExpandedProgress({
      maxSnapPoint: resolvedMaxSnapPoint,
      minSnapPoint: resolvedMinSnapPoint,
      offset: resolvedInitialSnapPoint,
    }),
  );
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
    const handleResize = () => setWindowHeight(window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateContentHeight = () => {
      const scrollArea = scrollAreaRef.current;
      const actionBar = actionBarRef.current;

      if (!scrollArea || !actionBar) return;

      setContentHeight(
        scrollArea.scrollHeight +
          actionBar.offsetHeight +
          SEARCH_FILTER_SHEET_TOP_PADDING,
      );
    };

    updateContentHeight();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (scrollAreaRef.current) resizeObserver.observe(scrollAreaRef.current);
    if (actionBarRef.current) resizeObserver.observe(actionBarRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!initialFilters) return;

    setIndoorOutdoor(initialFilters.indoorOutdoorState);
    setPlaceType(initialFilters.placeTypeState);
    setSelectedSizes(initialFilters.selectedSizes);
  }, [initialFilters]);

  const indoorOutdoorOptions = [
    {
      label: m.search_filter_indoor_short(),
      value: "indoor",
    },
    {
      label: m.search_filter_outdoor_short(),
      value: "outdoor",
    },
  ];
  const placeTypeOptions = [
    {
      label: m.search_filter_place_museum_short(),
      value: "museum",
    },
    {
      label: m.search_filter_place_subway_short(),
      value: "subway",
    },
    {
      label: m.search_filter_place_department_short(),
      value: "department",
    },
    {
      label: m.search_filter_place_convenience_short(),
      value: "convenience",
    },
    {
      label: m.search_filter_place_public_short(),
      value: "public",
    },
    {
      label: m.search_filter_place_private_short(),
      value: "private",
    },
    {
      label: m.search_filter_place_train_short(),
      value: "train",
    },
    {
      label: m.search_filter_place_other_short(),
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
  const handleLiveOffsetChange = ({
    expandedProgress,
  }: BottomSheetLiveOffsetState) => {
    setExpandedProgress(expandedProgress);
  };
  const actionBarStyle: CSSProperties = {
    opacity: 0.88 + expandedProgress * 0.12,
    transform: `translateY(${(1 - expandedProgress) * 8}px)`,
  };

  useEffect(() => {
    setExpandedProgress(
      resolveBottomSheetExpandedProgress({
        maxSnapPoint: resolvedMaxSnapPoint,
        minSnapPoint: resolvedMinSnapPoint,
        offset: resolvedInitialSnapPoint,
      }),
    );
  }, [resolvedMaxSnapPoint, resolvedMinSnapPoint, resolvedInitialSnapPoint]);

  return (
    <DraggableBottomSheet
      snapPoint={resolvedSnapPoint}
      initialSnapPoint={resolvedInitialSnapPoint}
      minSnapPoint={resolvedMinSnapPoint}
      miniSnapPoint={resolvedMiniSnapPoint}
      maxSnapPoint={resolvedMaxSnapPoint}
      dragSensitivity={SEARCH_FILTER_DRAG_SENSITIVITY}
      animateOnMount={animateOnMount}
      showHomeIndicator={false}
      onSnapChange={onSnapChange}
      onLiveOffsetChange={handleLiveOffsetChange}
      onDismiss={onCollapseToResults}
    >
      <div className={[sheetColumn, className].filter(Boolean).join(" ")}>
        <div ref={scrollAreaRef} className={scrollArea}>
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
    </DraggableBottomSheet>
  );
}
