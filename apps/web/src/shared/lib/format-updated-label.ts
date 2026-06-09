import { m } from "@repo/i18n";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const JUST_NOW_THRESHOLD_MS = 5 * MINUTE_MS;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

const normalizeUpdatedAtForParsing = (updatedAt: string): string =>
  updatedAt.replace(
    /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})\.(\d+)(.*)$/,
    (_match, dateTime: string, fraction: string, rest: string) =>
      `${dateTime}.${fraction.slice(0, 3).padEnd(3, "0")}${rest}`,
  );

const parseUpdatedTimestamp = (
  updatedAt: string | undefined,
): number | null => {
  if (!updatedAt) return null;

  const timestamp = Date.parse(normalizeUpdatedAtForParsing(updatedAt));
  return Number.isFinite(timestamp) ? timestamp : null;
};

const formatAbsoluteDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

export const formatUpdatedLabel = (
  updatedAt: string | undefined,
  now: Date = new Date(),
): string => {
  const timestamp = parseUpdatedTimestamp(updatedAt);
  if (timestamp === null) return "";

  const diffMs = Math.max(0, now.getTime() - timestamp);
  if (diffMs < JUST_NOW_THRESHOLD_MS) {
    return m.time_updated_just_now();
  }

  const minutes = Math.floor(diffMs / MINUTE_MS);
  if (minutes < 60) {
    return m.time_updated_minutes_ago({ minutes: String(minutes) });
  }

  const hours = Math.floor(diffMs / HOUR_MS);
  if (hours < 24) {
    return m.time_updated_hours_ago({ hours: String(hours) });
  }

  const days = Math.floor(diffMs / DAY_MS);
  if (days < DAYS_PER_MONTH) {
    return m.time_updated_days_ago({ days: String(days) });
  }

  if (days < DAYS_PER_YEAR) {
    return m.time_updated_months_ago({
      months: String(Math.floor(days / DAYS_PER_MONTH)),
    });
  }

  return m.time_updated_years_ago({
    years: String(Math.floor(days / DAYS_PER_YEAR)),
  });
};

export const formatLastUpdatedLabel = (
  updatedAt: string | undefined,
): string => {
  const timestamp = parseUpdatedTimestamp(updatedAt);
  if (timestamp === null) return "";

  return m.locker_detail_last_updated({
    datetime: formatAbsoluteDateTime(timestamp),
  });
};
