import { Button } from "@repo/ui/components/button";
import { LockerImageReportFrame } from "#/entities/locker/ui/image-report-frame";
import {
  bodyRow,
  cardButton,
  detailColumn,
  helperText,
  imageFrameSlot,
  metaRow,
  reportStatus,
  root,
  statusVariants,
  textColumn,
  titleLabel,
} from "./ReportListItem.css.ts";

export type ReportListItemStatus = "pending" | "approved" | "rejected";

export interface ReportListItemProps {
  titleText: string;
  locationLabel: string;
  detailText: string;
  updatedLabel: string;
  status?: ReportListItemStatus;
  statusLabel?: string;
  imageTitleText?: string;
  imageHelperText?: string;
  onPress?: () => void;
  className?: string;
}

export function ReportListItem({
  titleText,
  locationLabel,
  detailText,
  updatedLabel,
  status,
  statusLabel,
  imageTitleText,
  imageHelperText,
  onPress,
  className,
}: ReportListItemProps) {
  const resolvedStatusLabel =
    status != null && statusLabel ? statusLabel : undefined;

  const content = (
    <>
      <span className={textColumn}>
        <span className={titleLabel}>{titleText}</span>
        <span className={metaRow}>
          <span>{locationLabel}</span>
          <span>{updatedLabel}</span>
        </span>
      </span>
      {status && resolvedStatusLabel ? (
        <span className={[reportStatus, statusVariants[status]].join(" ")}>
          {resolvedStatusLabel}
        </span>
      ) : null}
      <span className={bodyRow}>
        <LockerImageReportFrame
          size="compact"
          titleText={imageTitleText}
          helperText={imageHelperText}
          className={imageFrameSlot}
        />
        <span className={detailColumn}>
          <span className={helperText}>{detailText}</span>
        </span>
      </span>
    </>
  );

  return onPress ? (
    <Button
      variant="ghost"
      intent="neutral"
      size="L"
      className={[root, cardButton, className].filter(Boolean).join(" ")}
      onPress={onPress}
      aria-label={`${titleText} ${locationLabel} ${updatedLabel}`}
    >
      {content}
    </Button>
  ) : (
    <article className={[root, className].filter(Boolean).join(" ")}>
      {content}
    </article>
  );
}
