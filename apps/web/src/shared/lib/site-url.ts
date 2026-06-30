export const SITE_ORIGIN = "https://zimdugo.com";

export const SITE_SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

export const SEO_LOCALE_PREFIXES = ["", "/en", "/ja", "/zh", "/zh-TW"] as const;

export type SeoLocalePrefix = (typeof SEO_LOCALE_PREFIXES)[number];
