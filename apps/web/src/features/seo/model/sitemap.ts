import type { ClientDocumentResponse } from "#/shared/api/documents";
import type { SeoLockerItem } from "#/shared/api/lockers";
import { createLockerPath } from "#/shared/lib/map-path-url";
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

const createStaticUrl = (localePrefix: SeoLocalePrefix, path: string): string =>
  `${SITE_ORIGIN}${localePrefix}${path}`;

/** 보관함 상세의 주소. 로케일마다 경로 접두사만 다르고 경로는 id 다. */
const createLockerUrl = (
  locker: SeoLockerItem,
  localePrefix: SeoLocalePrefix,
): string =>
  new URL(
    `${localePrefix}${createLockerPath(String(locker.lockerId))}`,
    SITE_ORIGIN,
  ).toString();

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
