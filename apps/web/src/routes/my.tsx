import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createNoIndexNoFollowHead } from "#/features/seo/model/robots-meta";
import { stripLocalePathPrefix } from "#/shared/i18n/locales";
import { requireAuthenticatedMyRoute } from "./-my-auth";

export const Route = createFileRoute("/my")({
  head: createNoIndexNoFollowHead,
  beforeLoad: ({ location, preload }) => {
    const normalizedPath = stripLocalePathPrefix(location.pathname);

    if (normalizedPath === "/my") {
      throw redirect({ to: "/settings", replace: true });
    }

    return requireAuthenticatedMyRoute({ location, preload });
  },
  component: MyRoute,
});

function MyRoute() {
  return <Outlet />;
}
