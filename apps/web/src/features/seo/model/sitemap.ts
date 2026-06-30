import { createLockerDeepLinkSlug } from "#/features/search/lib/open-locker-deep-link";
import type { ClientDocumentResponse } from "#/shared/api/documents";
import type { SeoLockerItem } from "#/shared/api/lockers";
import {
  SEO_LOCALE_PREFIXES,
  type SeoLocalePrefix,
  SITE_ORIGIN,
} from "#/shared/lib/site-url";

const STATIC_SITEMAP_PATHS = ["", "/notices"] as const;

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const getLockerTitleByLocalePrefix = (
  names: SeoLockerItem["names"] | null | undefined,
  localePrefix: SeoLocalePrefix,
): string => {
  if (!names) return "";
  if (localePrefix === "/en") return names.en || names.ko || "";
  if (localePrefix === "/ja") return names.ja || names.ko || "";
  if (localePrefix === "/zh") return names.zh || names.ko || "";
  if (localePrefix === "/zh-TW") {
    return names["zh-TW"] || names["zh-tw"] || names.ko || "";
  }
  return names.ko || "";
};

const createStaticUrl = (localePrefix: SeoLocalePrefix, path: string): string =>
  `${SITE_ORIGIN}${localePrefix}${path}`;

const createLockerUrl = (
  locker: SeoLockerItem,
  localePrefix: SeoLocalePrefix,
): string => {
  const url = new URL(localePrefix ? `${localePrefix}/` : "/", SITE_ORIGIN);
  url.searchParams.set(
    "locker",
    createLockerDeepLinkSlug({
      lockerId: locker.lockerId,
      title: getLockerTitleByLocalePrefix(locker.names, localePrefix),
    }),
  );

  return url.toString();
};

const getHrefLang = (localePrefix: SeoLocalePrefix): string =>
  localePrefix === "" ? "ko" : localePrefix.slice(1);

const createNoticeUrl = (notice: ClientDocumentResponse): string =>
  `${SITE_ORIGIN}/notices/${notice.id}`;

export const createSitemapXml = (
  seoLockers: SeoLockerItem[],
  notices: ClientDocumentResponse[] = [],
): string => {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const localePrefix of SEO_LOCALE_PREFIXES) {
    for (const path of STATIC_SITEMAP_PATHS) {
      lines.push(
        "  <url>",
        `    <loc>${escapeXml(createStaticUrl(localePrefix, path))}</loc>`,
        `    <priority>${path === "" ? "1.0" : "0.5"}</priority>`,
        "  </url>",
      );
    }
  }

  for (const locker of seoLockers) {
    const localizedUrls = SEO_LOCALE_PREFIXES.map((localePrefix) => {
      const url = createLockerUrl(locker, localePrefix);
      return {
        localePrefix,
        url,
        escapedUrl: escapeXml(url),
      };
    });
    const defaultUrl =
      localizedUrls.find((item) => item.localePrefix === "")?.escapedUrl ?? "";

    for (const current of localizedUrls) {
      lines.push(
        "  <url>",
        `    <loc>${current.escapedUrl}</loc>`,
        "    <priority>0.8</priority>",
      );

      for (const item of localizedUrls) {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="${getHrefLang(item.localePrefix)}" href="${item.escapedUrl}" />`,
        );
      }

      if (defaultUrl) {
        lines.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />`,
        );
      }

      lines.push("  </url>");
    }
  }

  for (const notice of notices) {
    lines.push(
      "  <url>",
      `    <loc>${escapeXml(createNoticeUrl(notice))}</loc>`,
      "    <priority>0.6</priority>",
      "  </url>",
    );
  }

  lines.push("</urlset>");
  return lines.join("\n");
};
