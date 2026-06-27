import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import { IconChevronLeft13 } from "@repo/ui/tokens/icons";
import { LockerImageReportFrame } from "#/entities/locker/ui/image-report-frame";
import {
  address,
  bodyContent,
  cardButton,
  chevron,
  content,
  imageFrameSlot,
  metaDetail,
  metaDot,
  metaRow,
  metaTime,
  root,
  statusRow,
  textColumn,
  thumbnailImage,
  titleLabel,
} from "./ReportListItem.css.ts";
import { ReportStatusBadge } from "./ReportStatusBadge";

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
  imageUrl?: string | null;
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
  imageUrl,
  onPress,
  className,
}: ReportListItemProps) {
  const resolvedStatusLabel =
    status != null && statusLabel ? statusLabel : undefined;

  const itemContent = (
    <span className={content}>
      {resolvedStatusLabel && status ? (
        <span className={statusRow} data-slot="status-row">
          <ReportStatusBadge status={status} label={resolvedStatusLabel} />
        </span>
      ) : null}

      <span className={bodyContent}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className={thumbnailImage} />
        ) : (
          <LockerImageReportFrame
            size="compact"
            titleText={imageTitleText}
            helperText={imageHelperText}
            className={imageFrameSlot}
          />
        )}
        <span className={textColumn}>
          <span className={titleLabel} title={titleText}>
            {titleText}
          </span>
          <span className={address} title={locationLabel}>
            {locationLabel}
          </span>
          <span className={metaRow} data-slot="meta-row">
            <span className={metaDetail} title={detailText}>
              {detailText}
            </span>
            <span className={metaDot} aria-hidden="true">
              ·
            </span>
            <span className={metaTime}>{updatedLabel}</span>
          </span>
        </span>
        <span className={chevron} data-slot="chevron" aria-hidden="true">
          <IconChevronLeft13 />
        </span>
      </span>
    </span>
  );

  return onPress ? (
    <Button
      variant="ghost"
      intent="neutral"
      size="L"
      className={[root, cardButton, className].filter(Boolean).join(" ")}
      onPress={onPress}
      aria-label={m.report_item_aria_label({
        title: titleText,
        location: locationLabel,
        updated: updatedLabel,
      })}
    >
      {itemContent}
    </Button>
  ) : (
    <article className={[root, className].filter(Boolean).join(" ")}>
      {itemContent}
    </article>
  );
}
