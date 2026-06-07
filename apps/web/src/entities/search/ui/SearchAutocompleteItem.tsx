import { IconMarker22 } from "@repo/ui/tokens/icons";
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

export interface SearchAutocompleteItemData {
  id: string;
  suggestType: "PLACE" | "LOCKER";
  title: string;
  address: string;
  updatedLabel: string;
  categoryLabel: string;
  distanceLabel: string;
}

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

  return (
    <Button
      className={[root, className].filter(Boolean).join(" ")}
      onPress={handlePress}
      aria-label={ariaLabel}
    >
      <span className={leadingContent}>
        <span
          className={[marker, item.suggestType === "PLACE" ? placeMarker : ""]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          <IconMarker22 size={14} />
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
