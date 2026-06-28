import { m } from "@repo/i18n";
import {
  IconNormalArrow24,
  IconStarFilled24,
  IconStarOutline24,
} from "@repo/ui/tokens/icons";
import { useState } from "react";
import { Button } from "react-aria-components";
import type {
  SearchLockerResultItem,
  SearchPlaceResultItem,
  SearchResultItem,
} from "#/composites/search/search-list-model";
import {
  getNextExpandedPlaceId,
  getSearchResultKey,
} from "#/composites/search/search-list-model";
import {
  accordionChildren,
  accordionGroup,
  addressText,
  arrowExpanded,
  arrowSlot,
  categoryText,
  closedOpacity,
  detailMetaRow,
  favoriteBtn,
  lockerMain,
  lockerRow,
  markerBadge,
  metaDot,
  nestedLockerRow,
  placeMain,
  placeRow,
  resultContent,
  resultTextColumn,
  titleText,
  updatedText,
} from "./SearchList.css.ts";
import { SearchMarkerIcon } from "./SearchMarkerIcon";

export interface SearchListResultsProps {
  items: SearchResultItem[];
  onLockerPress?: (item: SearchLockerResultItem) => void;
  onFavoriteChange?: (item: SearchLockerResultItem, next: boolean) => void;
  favoriteAddLabel?: string;
  favoriteRemoveLabel?: string;
}

export interface SearchListResultProps {
  item: SearchPlaceResultItem;
  isExpanded: boolean;
  onToggle: () => void;
  onLockerPress?: (item: SearchLockerResultItem) => void;
  onFavoriteChange?: (item: SearchLockerResultItem, next: boolean) => void;
  favoriteAddLabel?: string;
  favoriteRemoveLabel?: string;
}

interface SearchLockerResultProps {
  item: SearchLockerResultItem;
  isNested?: boolean;
  onPress?: (item: SearchLockerResultItem) => void;
  onFavoriteChange?: (item: SearchLockerResultItem, next: boolean) => void;
  favoriteAddLabel?: string;
  favoriteRemoveLabel?: string;
}

export function SearchListResults({
  items,
  onLockerPress,
  onFavoriteChange,
  favoriteAddLabel,
  favoriteRemoveLabel,
}: SearchListResultsProps) {
  const [expandedPlaceId, setExpandedPlaceId] = useState<number | null>(null);

  return items.map((item) =>
    item.itemType === "PLACE" ? (
      <SearchListResult
        key={getSearchResultKey(item)}
        item={item}
        isExpanded={expandedPlaceId === item.placeId}
        onToggle={() =>
          setExpandedPlaceId((currentId) =>
            getNextExpandedPlaceId(currentId, item.placeId),
          )
        }
        onLockerPress={onLockerPress}
        onFavoriteChange={onFavoriteChange}
        favoriteAddLabel={favoriteAddLabel}
        favoriteRemoveLabel={favoriteRemoveLabel}
      />
    ) : (
      <SearchLockerResult
        key={getSearchResultKey(item)}
        item={item}
        onPress={onLockerPress}
        onFavoriteChange={onFavoriteChange}
        favoriteAddLabel={favoriteAddLabel}
        favoriteRemoveLabel={favoriteRemoveLabel}
      />
    ),
  );
}

export function SearchListResult({
  item,
  isExpanded,
  onToggle,
  onLockerPress,
  onFavoriteChange,
  favoriteAddLabel,
  favoriteRemoveLabel,
}: SearchListResultProps) {
  const childrenId = `search-place-lockers-${item.placeId}`;

  return (
    <div className={accordionGroup}>
      <div
        className={[placeRow, item.isOpen === false ? closedOpacity : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <Button
          className={placeMain}
          onPress={onToggle}
          aria-expanded={isExpanded}
          aria-controls={childrenId}
          aria-label={`${item.title} ${item.distanceLabel} · ${item.address}`}
        >
          <span className={resultContent}>
            <ResultMarker tone="place" />
            <span className={resultTextColumn}>
              <span className={titleText}>{item.title}</span>
              <span className={detailMetaRow}>
                <span>{item.distanceLabel}</span>
                <span className={metaDot} aria-hidden="true">
                  ·
                </span>
                <span className={addressText}>{item.address}</span>
              </span>
            </span>
          </span>
          <span
            className={[arrowSlot, isExpanded ? arrowExpanded : ""]
              .filter(Boolean)
              .join(" ")}
          >
            <IconNormalArrow24 direction="down" />
          </span>
        </Button>
      </div>

      {isExpanded ? (
        <section
          id={childrenId}
          className={accordionChildren}
          aria-label={`${item.title} 보관함 목록`}
        >
          {item.lockers.map((locker) => (
            <SearchLockerResult
              key={getSearchResultKey(locker)}
              item={locker}
              isNested
              onPress={onLockerPress}
              onFavoriteChange={onFavoriteChange}
              favoriteAddLabel={favoriteAddLabel}
              favoriteRemoveLabel={favoriteRemoveLabel}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

export function SearchLockerResult({
  item,
  isNested = false,
  onPress,
  onFavoriteChange,
  favoriteAddLabel,
  favoriteRemoveLabel,
}: SearchLockerResultProps) {
  const favoriteLabel = item.isFavorite
    ? (favoriteRemoveLabel ?? m.search_favorite_remove())
    : (favoriteAddLabel ?? m.search_favorite_add());

  const handleFavoritePress = () => {
    onFavoriteChange?.(item, !item.isFavorite);
  };

  return (
    <div
      className={[
        lockerRow,
        isNested ? nestedLockerRow : "",
        item.isOpen === false ? closedOpacity : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Button
        className={lockerMain}
        onPress={() => onPress?.(item)}
        aria-label={`${item.title} ${item.distanceLabel} · ${item.address}`}
      >
        <span className={resultContent}>
          <ResultMarker tone={isNested ? "locker" : "standalone"} />
          <span className={resultTextColumn}>
            <span className={titleText}>{item.title}</span>
            <span className={detailMetaRow}>
              <span className={categoryText}>{item.categoryLabel}</span>
              <span className={metaDot} aria-hidden="true">
                ·
              </span>
              <span className={updatedText}>{item.updatedLabel}</span>
            </span>
            <span className={detailMetaRow}>
              <span>{item.distanceLabel}</span>
              <span className={metaDot} aria-hidden="true">
                ·
              </span>
              <span className={addressText}>{item.address}</span>
            </span>
          </span>
        </span>
      </Button>

      <Button
        className={favoriteBtn}
        onPress={handleFavoritePress}
        aria-label={favoriteLabel}
      >
        {item.isFavorite ? (
          <IconStarFilled24 size={24} />
        ) : (
          <IconStarOutline24 size={24} />
        )}
      </Button>
    </div>
  );
}

function ResultMarker({ tone }: { tone: "place" | "locker" | "standalone" }) {
  return (
    <span className={markerBadge} aria-hidden="true">
      <SearchMarkerIcon
        kind={tone === "place" ? "place" : "locker"}
        tone="brand"
      />
    </span>
  );
}
