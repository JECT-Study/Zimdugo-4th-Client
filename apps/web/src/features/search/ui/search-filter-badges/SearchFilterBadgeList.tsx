import { m } from "@repo/i18n";
import { IconX16 } from "@repo/ui/assets/icons";
import { ControlChip } from "@repo/ui/components/control-chip";
import { useRef, useState } from "react";
import type { SearchFilterBadge } from "#/features/search/model/search-filter-badges";
import { useDragScroll } from "#/shared/hooks/useDragScroll";
import { badge, badgeList, moreBadge } from "./SearchFilterBadgeList.css.ts";

/** 이 개수를 넘으면 앞의 몇 개만 보이고 나머지는 `+N` 으로 접는다. */
const SEARCH_FILTER_BADGE_COLLAPSED_COUNT = 2;

export interface SearchFilterBadgeListProps {
  badges: SearchFilterBadge[];
  onRemove: (badge: SearchFilterBadge) => void;
  className?: string;
}

/**
 * 적용된 필터 뱃지 줄.
 *
 * 뱃지는 칩 전체가 지우기 버튼이다. × 만 따로 버튼으로 두면 16px 짜리 누를 자리가
 * 생기고, 칩 안에 버튼을 또 넣게 된다.
 *
 * 많으면 처음엔 접어 두고 `+N` 을 누르면 모두 펼친다. 펼친 뒤로는 다시 접지 않는다.
 * 지우다가 갑자기 접히면 방금 보던 뱃지가 사라진다.
 *
 * 펼친 줄은 마우스로도 잡아끌 수 있다. 스크롤바를 숨겨 두어 데스크톱에선 달리 밀
 * 방법이 없다. 끌고 놓은 자리의 뱃지는 지워지지 않는다.
 */
export function SearchFilterBadgeList({
  badges,
  onRemove,
  className,
}: SearchFilterBadgeListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  /* 뱃지가 없으면 줄 자체를 그리지 않는다. 다시 생길 때 리스너를 붙이라는 신호다. */
  useDragScroll(listRef, { targetKey: badges.length > 0 });

  const isCollapsed =
    !isExpanded && badges.length > SEARCH_FILTER_BADGE_COLLAPSED_COUNT;
  const visibleBadges = isCollapsed
    ? badges.slice(0, SEARCH_FILTER_BADGE_COLLAPSED_COUNT)
    : badges;
  const hiddenCount = badges.length - visibleBadges.length;

  const handleExpand = () => {
    setIsExpanded(true);
  };

  if (badges.length === 0) return null;

  return (
    <div
      ref={listRef}
      className={[badgeList, className].filter(Boolean).join(" ")}
      data-expanded={!isCollapsed}
    >
      {visibleBadges.map((item) => (
        <ControlChip
          key={item.key}
          className={badge}
          variant="filter"
          isActive
          showsIndicator={false}
          label={item.label}
          aria-label={m.search_filter_badge_remove({ label: item.label })}
          trailingIcon={<IconX16 />}
          onPress={() => onRemove(item)}
        />
      ))}
      {isCollapsed ? (
        <ControlChip
          className={moreBadge}
          variant="filter"
          isActive
          showsIndicator={false}
          label={`+${hiddenCount}`}
          aria-label={m.search_filter_badge_more({ count: hiddenCount })}
          onPress={handleExpand}
        />
      ) : null}
    </div>
  );
}
