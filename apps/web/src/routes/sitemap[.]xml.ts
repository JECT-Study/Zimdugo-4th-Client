import { createFileRoute } from "@tanstack/react-router";
import { createSitemapXml } from "#/features/seo/model/sitemap";
import { getSeoLockers, type SeoLockerItem } from "#/shared/api/lockers";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const seoLockers: SeoLockerItem[] = await getSeoLockers();
          return new Response(createSitemapXml(seoLockers), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          });
        } catch (error) {
          console.error("Failed to fetch lockers for sitemap:", error);
          return new Response("Sitemap is temporarily unavailable.", {
            status: 503,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-store",
            },
          });
        }
      },
    },
  },
});
