const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const formatUpdatedLabel = (
  updatedAt: string | undefined,
  now: Date = new Date(),
): string => {
  if (!updatedAt) return "";

  const timestamp = Date.parse(updatedAt);
  if (!Number.isFinite(timestamp)) return "";

  const diffMs = Math.max(0, now.getTime() - timestamp);
  if (diffMs < MINUTE_MS) return "방금 업데이트";

  const minutes = Math.floor(diffMs / MINUTE_MS);
  if (minutes < 60) return `${minutes}분 전 업데이트`;

  const hours = Math.floor(diffMs / HOUR_MS);
  if (hours < 24) return `${hours}시간 전 업데이트`;

  const days = Math.floor(diffMs / DAY_MS);
  if (days < 7) return `${days}일 전 업데이트`;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
};
