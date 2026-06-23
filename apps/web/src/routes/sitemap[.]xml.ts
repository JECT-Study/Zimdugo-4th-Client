import { createFileRoute } from "@tanstack/react-router";
import { getSeoLockers, type SeoLockerItem } from "../shared/api/lockers";

const getLockerTitleByLang = (
  names: SeoLockerItem["names"],
  langPrefix: string,
): string => {
  if (langPrefix === "/en") return names.en || names.ko || "";
  if (langPrefix === "/ja") return names.ja || names.ko || "";
  if (langPrefix === "/zh") return names.zh || names.ko || "";
  if (langPrefix === "/zh-TW") {
    return names["zh-TW"] || names["zh-tw"] || names.ko || "";
  }
  return names.ko || "";
};

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        let seoLockers: SeoLockerItem[] = [];
        try {
          seoLockers = await getSeoLockers();
        } catch (error) {
          console.error("Failed to fetch lockers for sitemap:", error);
        }

        const url = new URL(request.url);
        const baseUrl = url.origin;

        // 기본 정적 페이지 목록
        const staticPaths = [
          "",
          "/settings/terms",
          "/settings/privacy",
          "/settings/notices",
        ];
        // 다국어 접두사 목록
        const languages = ["", "/en", "/ja", "/zh", "/zh-TW"];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
        xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

        // 1. 다국어 정적 페이지들을 추가합니다.
        for (const lang of languages) {
          for (const path of staticPaths) {
            const priority = path === "" ? "1.0" : "0.5";
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${lang}${path}</loc>\n`;
            xml += `    <priority>${priority}</priority>\n`;
            xml += `  </url>\n`;
          }
        }

        // 2. 동적 물품보관함 상세 페이지들을 추가합니다 (다국어 및 Hreflang 적용).
        for (const locker of seoLockers) {
          // 각 언어별 슬러그 URL 미리 매핑해두기
          const langUrls = languages.map((lang) => {
            const title = getLockerTitleByLang(locker.names, lang);
            const cleanName = title
              ? title.replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-")
              : "";
            const lockerSlug = cleanName
              ? `${locker.lockerId}-${cleanName}`
              : String(locker.lockerId);

            return {
              lang,
              url: `${baseUrl}${lang}/?locker=${lockerSlug}`,
            };
          });

          // x-default는 기본 언어인 한국어 URL로 지정
          const defaultUrl = langUrls.find((lu) => lu.lang === "")?.url || "";

          // 각 언어별로 각각의 <url> 블록을 생성하고 교차 참조 링크 추가
          for (const current of langUrls) {
            xml += `  <url>\n`;
            xml += `    <loc>${current.url}</loc>\n`;
            xml += `    <priority>0.8</priority>\n`;

            // 모든 번역 버전에 대해 xhtml:link 추가
            for (const item of langUrls) {
              const hreflang =
                item.lang === "" ? "ko" : item.lang.replace("/", "");
              xml += `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${item.url}" />\n`;
            }
            // x-default 링크 추가
            if (defaultUrl) {
              xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}" />\n`;
            }

            xml += `  </url>\n`;
          }
        }

        xml += `</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
