import { createFileRoute } from "@tanstack/react-router";
import { getLockerPins } from "../shared/api/lockers";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        let lockerIds: number[] = [];
        try {
          // 1,000km 반경으로 한국 전역의 모든 물품보관함 핀 데이터를 긁어옵니다.
          const pins = await getLockerPins({
            lat: 36.5, // 대한민국 중심 좌표
            lng: 127.5,
            radius: 1000, // 1,000km 반경
          });

          lockerIds = pins
            .filter((pin: any) => pin.pinType === "LOCKER")
            .map((pin: any) => pin.lockerId)
            .filter((id: any): id is number => typeof id === "number" && id > 0);
        } catch (error) {
          console.error("Failed to fetch locker pins for sitemap:", error);
        }

        const url = new URL(request.url);
        const baseUrl = url.origin;

        // 기본 정적 페이지 목록
        const staticPaths = [
          "",
          "/login",
          "/my",
          "/report",
          "/settings",
          "/settings/terms",
          "/settings/privacy",
          "/settings/language",
          "/settings/notices",
        ];
        // 다국어 접두사 목록
        const languages = ["", "/en", "/ja", "/zh", "/zh-TW"];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

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

        // 2. 동적 물품보관함 상세 페이지들을 추가합니다 (쿼리 파라미터 적용).
        for (const lockerId of lockerIds) {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/?locker=${lockerId}</loc>\n`;
          xml += `    <priority>0.8</priority>\n`;
          xml += `  </url>\n`;
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
