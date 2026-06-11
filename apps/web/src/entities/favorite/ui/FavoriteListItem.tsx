import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import {
  IconMarker22,
  IconStarFilled24,
  IconStarOutline24,
} from "@repo/ui/tokens/icons";
import {
  favoriteButton,
  markerBadge,
  metaDot,
  metaRow,
  primaryMetaText,
  root,
  textColumn,
  titleCaption,
  titleGroup,
  titleLabel,
  touchTarget,
} from "./FavoriteListItem.css.ts";

export interface FavoriteListItemProps {
  titleText: string;
  englishCaption?: string;
  distanceLabel: string;
  updatedLabel: string;
  isFavorite?: boolean;
  onPress?: () => void;
  onFavoriteChange?: (next: boolean) => void;
  favoriteAddLabel?: string;
  favoriteRemoveLabel?: string;
  className?: string;
}

export function FavoriteListItem({
  titleText,
  englishCaption,
  distanceLabel,
  updatedLabel,
  isFavorite = true,
  onPress,
  onFavoriteChange,
  favoriteAddLabel = m.search_favorite_add(),
  favoriteRemoveLabel = m.search_favorite_remove(),
  className,
}: FavoriteListItemProps) {
  const favoriteLabel = isFavorite ? favoriteRemoveLabel : favoriteAddLabel;

  const handleFavoritePress = () => {
    onFavoriteChange?.(!isFavorite);
  };

  const content = (
    <>
      <span className={markerBadge} aria-hidden="true">
        <IconMarker22 size={24} />
      </span>
      <span className={textColumn}>
        <span className={titleGroup}>
          <span className={titleLabel}>{titleText}</span>
          {englishCaption ? (
            <span className={titleCaption}>{englishCaption}</span>
          ) : null}
        </span>
        <span className={metaRow}>
          <span className={primaryMetaText}>{distanceLabel}</span>
          <span className={metaDot} aria-hidden="true">
            ·
          </span>
          <span>{updatedLabel}</span>
        </span>
      </span>
    </>
  );

  return (
    <div className={[root, className].filter(Boolean).join(" ")}>
      {onPress ? (
        <Button
          variant="ghost"
          intent="neutral"
          size="S"
          className={touchTarget}
          onPress={onPress}
        >
          {content}
        </Button>
      ) : (
        <div className={touchTarget}>{content}</div>
      )}
      <Button
        variant="ghost"
        intent="neutral"
        size="S"
        className={favoriteButton}
        onPress={handleFavoritePress}
        aria-label={favoriteLabel}
      >
        {isFavorite ? (
          <IconStarFilled24 size={24} />
        ) : (
          <IconStarOutline24 size={24} />
        )}
      </Button>
    </div>
  );
}
