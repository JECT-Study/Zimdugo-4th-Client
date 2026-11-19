import { m } from "@repo/i18n";
import type { SearchFilterAppliedState } from "#/composites/search/SearchFilterBottomSheet";
import type { SizeCardType } from "#/entities/locker/ui/size-card/SizeCard";

/**
 * 적용된 필터를 목록에 뱃지로 늘어놓기 위한 모양.
 *
 * 필터 상태는 묶음(크기·실내외·유형)별 배열이라, 목록 쪽은 "하나씩 보이고 하나씩 지우는"
 * 단위로 펴서 받는다. 뱃지 하나를 지운 결과도 여기서 필터 상태로 되돌려, 화면이 묶음의
 * 생김새를 알지 않게 한다.
 */

type SearchFilterBadgeGroup = "size" | "indoorOutdoor" | "placeType";

export interface SearchFilterBadge {
  /** 목록 안에서 겹치지 않는 키. `묶음:값` 꼴이다. */
  key: string;
  group: SearchFilterBadgeGroup;
  value: string;
  label: string;
}

/*
 * 보이는 순서는 필터 화면의 순서를 따른다. 고른 순서대로 두면 같은 조합이 매번 다르게
 * 늘어서 무엇을 골랐는지 한눈에 들어오지 않는다.
 */
const SIZE_ORDER: SizeCardType[] = ["S", "M", "L"];
const INDOOR_OUTDOOR_ORDER = ["indoor", "outdoor"];
const PLACE_TYPE_ORDER = [
  "museum",
  "subway",
  "department",
  "convenience",
  "public",
  "private",
  "train",
  "other",
];

const SIZE_LABELS: Record<SizeCardType, () => string> = {
  S: m.search_filter_size_small,
  M: m.search_filter_size_medium,
  L: m.search_filter_size_large,
};

const INDOOR_OUTDOOR_LABELS: Record<string, () => string> = {
  indoor: m.search_filter_indoor_short,
  outdoor: m.search_filter_outdoor_short,
};

const PLACE_TYPE_LABELS: Record<string, () => string> = {
  museum: m.search_filter_place_museum_short,
  subway: m.search_filter_place_subway_short,
  department: m.search_filter_place_department_short,
  convenience: m.search_filter_place_convenience_short,
  public: m.search_filter_place_public_short,
  private: m.search_filter_place_private_short,
  train: m.search_filter_place_train_short,
  other: m.search_filter_place_other_short,
};

const toBadges = (
  group: SearchFilterBadgeGroup,
  order: string[],
  selected: string[],
  labels: Record<string, () => string>,
): SearchFilterBadge[] =>
  order
    .filter((value) => selected.includes(value))
    .map((value) => ({
      key: `${group}:${value}`,
      group,
      value,
      label: labels[value]?.() ?? value,
    }));

export const toSearchFilterBadges = (
  filters: SearchFilterAppliedState,
): SearchFilterBadge[] => [
  ...toBadges("size", SIZE_ORDER, filters.selectedSizes, SIZE_LABELS),
  ...toBadges(
    "indoorOutdoor",
    INDOOR_OUTDOOR_ORDER,
    filters.indoorOutdoorState,
    INDOOR_OUTDOOR_LABELS,
  ),
  ...toBadges(
    "placeType",
    PLACE_TYPE_ORDER,
    filters.placeTypeState,
    PLACE_TYPE_LABELS,
  ),
];

/**
 * 뱃지 하나를 뺀 필터 상태.
 *
 * 묶음의 활성 여부도 함께 다시 센다. 배열만 비우고 플래그를 두면 "필터 켜짐" 표시와
 * 요청 파라미터가 어긋난다.
 */
export const removeSearchFilterBadge = (
  filters: SearchFilterAppliedState,
  badge: Pick<SearchFilterBadge, "group" | "value">,
): SearchFilterAppliedState => {
  const selectedSizes =
    badge.group === "size"
      ? filters.selectedSizes.filter((size) => size !== badge.value)
      : filters.selectedSizes;
  const indoorOutdoorState =
    badge.group === "indoorOutdoor"
      ? filters.indoorOutdoorState.filter((value) => value !== badge.value)
      : filters.indoorOutdoorState;
  const placeTypeState =
    badge.group === "placeType"
      ? filters.placeTypeState.filter((value) => value !== badge.value)
      : filters.placeTypeState;

  return {
    regionActive: indoorOutdoorState.length > 0,
    sizeActive: selectedSizes.length > 0,
    placeTypeActive: placeTypeState.length > 0,
    indoorOutdoorState,
    placeTypeState,
    selectedSizes,
  };
};
