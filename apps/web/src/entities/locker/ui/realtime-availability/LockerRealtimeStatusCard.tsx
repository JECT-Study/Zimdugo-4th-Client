import { m } from "@repo/i18n";
import type { LockerRealtimeAvailability } from "#/entities/locker/model/locker-detail";
import { formatUpdatedLabel } from "#/shared/lib/format-updated-label";
import {
  card,
  cardVariant,
  liveIndicator,
  sizeItem,
  sizeItemState,
  sizeLabel,
  sizeList,
  sizeValue,
  statusHeader,
  statusLabel,
  updatedLabel,
} from "./LockerRealtimeStatusCard.css";
import liveIndicatorUrl from "./live-indicator.svg";

export type LockerRealtimeStatusCardVariant = "floating" | "inline";

export interface LockerRealtimeStatusCardProps {
  availability: LockerRealtimeAvailability;
  className?: string;
  variant?: LockerRealtimeStatusCardVariant;
}

export function LockerRealtimeStatusCard({
  availability,
  className,
  variant = "floating",
}: LockerRealtimeStatusCardProps) {
  const statusText = m.locker_detail_realtime_status();
  const updatedText = formatUpdatedLabel(availability.fetchedAt);
  const closedLabel = m.locker_detail_realtime_full();
  const items = [
    {
      label: m.search_filter_size_small(),
      availableCount: availability.smallAvailableCount,
    },
    {
      label: m.search_filter_size_medium(),
      availableCount: availability.mediumAvailableCount,
    },
    {
      label: m.search_filter_size_large(),
      availableCount: availability.largeAvailableCount,
    },
  ];

  return (
    <section
      className={[card, cardVariant[variant], className]
        .filter(Boolean)
        .join(" ")}
      aria-label={statusText}
    >
      <div className={statusHeader}>
        <img
          src={liveIndicatorUrl}
          alt=""
          className={liveIndicator}
          aria-hidden="true"
        />
        <span className={statusLabel}>{statusText}</span>
        <span className={updatedLabel}>{updatedText}</span>
      </div>

      <div className={sizeList}>
        {items.map((item) => {
          const isClosed = item.availableCount <= 0;

          return (
            <span
              key={item.label}
              className={[
                sizeItem,
                sizeItemState[isClosed ? "closed" : "available"],
              ].join(" ")}
            >
              <span className={sizeLabel}>{item.label}</span>
              <span className={sizeValue}>
                {isClosed ? closedLabel : item.availableCount}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
