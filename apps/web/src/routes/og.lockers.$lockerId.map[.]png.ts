import { createFileRoute } from "@tanstack/react-router";
import { createLockerOgImageResponse } from "#/features/seo/model/locker-og-image";

export const Route = createFileRoute("/og/lockers/$lockerId/map.png")({
  server: {
    handlers: {
      GET: ({ params, request }) =>
        createLockerOgImageResponse({
          rawLockerId: params.lockerId,
          requestUrl: request.url,
        }),
    },
  },
});
