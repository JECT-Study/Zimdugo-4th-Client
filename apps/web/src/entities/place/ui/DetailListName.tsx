import { Button } from "react-aria-components";
import {
  englishCaptionText,
  metaDot,
  metaRow,
  pressableRoot,
  root,
  title,
  titleRow,
} from "./DetailListName.css.ts";

export interface DetailListNameProps {
  titleText: string;
  englishCaption?: string;
  distanceLabel: string;
  categoryLabel: string;
  detailLabel: string;
  onPress?: () => void;
  className?: string;
}

export function DetailListName({
  titleText,
  englishCaption,
  distanceLabel,
  categoryLabel,
  detailLabel,
  onPress,
  className,
}: DetailListNameProps) {
  const content = (
    <>
      <div className={titleRow}>
        <span className={title}>{titleText}</span>
        {englishCaption ? (
          <span className={englishCaptionText}>{englishCaption}</span>
        ) : null}
      </div>
      <div className={metaRow}>
        {[distanceLabel, categoryLabel, detailLabel]
          .filter(Boolean)
          .flatMap((label, index) =>
            index > 0
              ? [
                  <span
                    key={`dot-${index}`}
                    className={metaDot}
                    aria-hidden="true"
                  >
                    ·
                  </span>,
                  <span key={`label-${index}`}>{label}</span>,
                ]
              : [<span key={`label-${index}`}>{label}</span>],
          )}
      </div>
    </>
  );

  if (onPress) {
    return (
      <Button
        className={[pressableRoot, className].filter(Boolean).join(" ")}
        onPress={onPress}
      >
        {content}
      </Button>
    );
  }

  return (
    <div className={[root, className].filter(Boolean).join(" ")}>{content}</div>
  );
}

export type SearchListNameProps = DetailListNameProps;
