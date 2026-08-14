import { m } from "@repo/i18n";
import { useId } from "react";
import type { LockerRealtimeAvailability } from "#/entities/locker/model/locker-detail";
import { formatLastUpdatedLabel } from "#/shared/lib/format-updated-label";
import {
  card,
  cardState,
  count,
  countItem,
  countList,
  separator,
  sizeLabel,
  title,
  updatedAt,
} from "./LockerRealtimeAvailabilityCard.css";

export interface LockerRealtimeAvailabilityCardProps {
  availability?: LockerRealtimeAvailability | null;
  className?: string;
}

interface AvailabilityCountProps {
  size: "S" | "M" | "L";
  value: number | null;
}

function AvailabilityCount({ size, value }: AvailabilityCountProps) {
  return (
    <li className={countItem} aria-label={`${size} ${value ?? "-"}`}>
      <span className={sizeLabel} aria-hidden="true">
        {size}
      </span>
      <span className={count} aria-hidden="true">
        {value ?? "-"}
      </span>
    </li>
  );
}

export function LockerRealtimeAvailabilityCard({
  availability,
  className,
}: LockerRealtimeAvailabilityCardProps) {
  const titleId = useId();
  const isAvailable = availability?.isAvailable === true;
  const availabilityCounts = isAvailable
    ? [
        availability.smallAvailableCount,
        availability.mediumAvailableCount,
        availability.largeAvailableCount,
      ]
    : [null, null, null];
  const updatedLabel = isAvailable
    ? formatLastUpdatedLabel(availability.fetchedAt)
    : "";

  return (
    <section
      className={[
        card,
        cardState[isAvailable ? "available" : "unavailable"],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={titleId}
    >
      <h3 id={titleId} className={title}>
        {m.locker_detail_realtime_availability()}
      </h3>
      <ul className={countList}>
        <AvailabilityCount size="S" value={availabilityCounts[0]} />
        <li className={separator} aria-hidden="true">
          ·
        </li>
        <AvailabilityCount size="M" value={availabilityCounts[1]} />
        <li className={separator} aria-hidden="true">
          ·
        </li>
        <AvailabilityCount size="L" value={availabilityCounts[2]} />
      </ul>
      {updatedLabel ? <span className={updatedAt}>{updatedLabel}</span> : null}
    </section>
  );
}
