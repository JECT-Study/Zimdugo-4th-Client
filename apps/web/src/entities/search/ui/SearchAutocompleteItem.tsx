import {
  IconSearchAutocompleteLocker14,
  IconSearchAutocompletePlace14,
} from "@repo/ui/tokens/icons";
import { Button } from "react-aria-components";
import {
  address,
  leadingContent,
  marker,
  placeMarker,
  root,
  textColumn,
  title,
  trailingContent,
  updated,
} from "./SearchAutocompleteItem.css.ts";

interface SearchAutocompleteItemBase {
  title: string;
  address: string;
  updatedLabel: string;
  categoryLabel: string;
  distanceLabel: string;
  distanceMeters?: number;
}

export type SearchAutocompletePlaceItem = SearchAutocompleteItemBase & {
  itemType: "PLACE";
  placeId: number;
};

export type SearchAutocompleteLockerItem = SearchAutocompleteItemBase & {
  itemType: "LOCKER";
  lockerId: number;
};

export type SearchAutocompleteItemData =
  | SearchAutocompletePlaceItem
  | SearchAutocompleteLockerItem;

export const getSearchAutocompleteItemKey = (
  item: SearchAutocompleteItemData,
): string =>
  item.itemType === "PLACE"
    ? `place-${item.placeId}`
    : `locker-${item.lockerId}`;

export interface SearchAutocompleteItemProps {
  item: SearchAutocompleteItemData;
  onPress?: (item: SearchAutocompleteItemData) => void;
  className?: string;
}

export function SearchAutocompleteItem({
  item,
  onPress,
  className,
}: SearchAutocompleteItemProps) {
  const ariaLabel = [
    item.title,
    item.address,
    item.categoryLabel,
    item.distanceLabel,
  ].join(" ");

  const handlePress = () => {
    onPress?.(item);
  };

  const AutocompleteIcon =
    item.itemType === "PLACE"
      ? IconSearchAutocompletePlace14
      : IconSearchAutocompleteLocker14;

  return (
    <Button
      className={[root, className].filter(Boolean).join(" ")}
      onPress={handlePress}
      aria-label={ariaLabel}
    >
      <span className={leadingContent}>
        <span
          className={[marker, item.itemType === "PLACE" ? placeMarker : ""]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          <AutocompleteIcon />
        </span>

        <span className={textColumn}>
          <span className={title}>{item.title}</span>
          <span className={address}>{item.address}</span>
          <span className={updated}>{item.updatedLabel}</span>
        </span>
      </span>

      <span className={trailingContent} aria-hidden="true">
        <span>{item.categoryLabel}</span>
        <span>{item.distanceLabel}</span>
      </span>
    </Button>
  );
}
