import { m } from "@repo/i18n";
import { useId } from "react";
import type { LockerRealtimeAvailability } from "#/entities/locker/model/locker-detail";
import { formatLastUpdatedLabel } from "#/shared/lib/format-updated-label";
import {
  card,
  cardState,
  countText,
  countTextState,
  labelColumn,
  title,
  titleState,
  updatedAt,
} from "./LockerRealtimeAvailabilityCard.css";

export interface LockerRealtimeAvailabilityCardProps {
  availability?: LockerRealtimeAvailability | null;
  className?: string;
}

export function LockerRealtimeAvailabilityCard({
  availability,
  className,
}: LockerRealtimeAvailabilityCardProps) {
  const titleId = useId();
  const isAvailable = availability?.isAvailable === true;
  const state = isAvailable ? "available" : "unavailable";
  const countLabel = isAvailable
    ? `S ${availability.smallAvailableCount} · M ${availability.mediumAvailableCount} · L ${availability.largeAvailableCount}`
    : "S - · M - · L -";
  const updatedLabel = isAvailable
    ? formatLastUpdatedLabel(availability.fetchedAt)
    : "";

  return (
    <section
      className={[card, cardState[state], className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <div className={labelColumn}>
        <h3 id={titleId} className={[title, titleState[state]].join(" ")}>
          {isAvailable
            ? m.locker_detail_realtime_availability()
            : m.locker_detail_realtime_unavailable()}
        </h3>
        {updatedLabel ? (
          <span className={updatedAt}>{updatedLabel}</span>
        ) : null}
      </div>
      <span className={[countText, countTextState[state]].join(" ")}>
        {countLabel}
      </span>
    </section>
  );
}
