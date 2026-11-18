import { SITE_ORIGIN } from "#/shared/lib/site-url";

export const createLockerOgImageUrl = (lockerId: number): string =>
  new URL(`/og/lockers/${lockerId}/map.png`, SITE_ORIGIN).toString();
