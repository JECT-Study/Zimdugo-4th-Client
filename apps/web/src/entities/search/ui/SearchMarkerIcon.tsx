import { vars } from "@repo/ui/vars";

export type SearchMarkerIconKind = "locker" | "place";
export type SearchMarkerIconTone = "brand" | "muted";

interface SearchMarkerIconProps {
  kind: SearchMarkerIconKind;
  tone?: SearchMarkerIconTone;
  size?: number;
}

export const SEARCH_MARKER_ICON_SIZE = {
  locker: 40.5,
  place: 40.5,
} as const;

const LOCKER_PATH =
  "M48.4398 26.0612C51.9428 25.5465 55.0768 28.3442 55.0768 31.9866V32.5677H57.9845C61.1961 32.5677 63.7998 35.2476 63.8 38.5533V55.0141C63.7998 58.3201 61.1961 61 57.9845 61H31.8152C28.6036 61 26.0001 58.3201 26 55.0141V38.5533C26.0001 35.2476 28.6036 32.5678 31.8152 32.5677H34.7231V31.9866C34.7232 28.3443 37.857 25.5466 41.3599 26.0612L44.8926 26.5805L44.9 26.5815L44.9071 26.5803L48.4398 26.0612ZM31.8152 35.5605C30.2095 35.5606 28.9077 36.9006 28.9076 38.5533V55.0141C28.9077 56.6671 30.2095 58.007 31.8152 58.007H34.7231V50.692L44.0501 46.2083C44.6491 47.3851 45.8162 48.1806 47.1522 48.1806C49.1026 48.1806 50.6999 46.4735 50.6999 44.352H50.7152C50.7152 42.247 49.1181 40.5232 47.1678 40.5231C45.2173 40.5231 43.62 42.2305 43.62 44.352C43.62 44.5509 43.6355 44.7499 43.6662 44.9487L34.7231 46.9508V35.5605H31.8152ZM55.0768 58.007H57.9845C59.5904 58.007 60.892 56.6671 60.892 55.0141V38.5533C60.892 36.9005 59.5902 35.5605 57.9845 35.5605H55.0768V58.007ZM52.1693 31.9866C52.169 30.194 50.6507 28.8105 48.9326 29.0132L48.8509 29.024L45.3112 29.5443L45.3045 29.5452L45.0987 29.5745L44.9 29.6026L44.7012 29.5745L44.4954 29.5452L44.492 29.5447L44.4885 29.5443L40.9491 29.024C39.1976 28.7667 37.6308 30.1656 37.6307 31.9866V32.5677H37.6538C37.6387 32.6466 37.6307 32.7264 37.6307 32.8068C37.6308 34.4597 40.8854 35.7999 44.9 35.7999C48.9146 35.7999 52.1688 34.4597 52.169 32.8068C52.169 32.7264 52.1611 32.6466 52.1458 32.5677H52.1693V31.9866Z";

const getMarkerColors = (
  kind: SearchMarkerIconKind,
  tone: SearchMarkerIconTone,
) => {
  const accent =
    tone === "brand"
      ? vars.color.palette.green[500]
      : vars.color.palette.gray[500];
  const placeFill =
    tone === "brand"
      ? vars.color.palette.green[500]
      : vars.color.palette.gray[500];

  if (kind === "place") {
    return {
      background: placeFill,
      symbol: vars.color.bg.surface,
    };
  }

  return {
    background: vars.color.bg.surface,
    symbol: accent,
  };
};

export function SearchMarkerIcon({
  kind,
  tone = "brand",
  size = SEARCH_MARKER_ICON_SIZE[kind],
}: SearchMarkerIconProps) {
  const colors = getMarkerColors(kind, tone);

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 90 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="44.5"
        cy="44.5"
        r="28.5"
        fill={colors.background}
        stroke={vars.color.palette.gray[500]}
        strokeWidth={3}
      />
      <path d={LOCKER_PATH} fill={colors.symbol} />
    </svg>
  );
}
