export const formatDistanceMeters = (distanceMeters: number): string => {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return "";
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)}m`;
  }

  const kilometers = distanceMeters / 1000;
  if (kilometers >= 10) {
    return `${Math.round(kilometers)}km`;
  }

  const rounded = Math.round(kilometers * 10) / 10;
  return `${rounded.toString().replace(/\.0$/, "")}km`;
};
