import { stripLocalePathPrefix } from "#/shared/i18n/locales";

interface PageTransitionSnapshot {
  status: "idle" | "pending";
  currentPathname: string;
  resolvedPathname?: string;
}

export const isPathnameTransitionPending = ({
  status,
  currentPathname,
  resolvedPathname,
}: PageTransitionSnapshot) => {
  if (status !== "pending" || resolvedPathname === undefined) {
    return false;
  }

  return (
    stripLocalePathPrefix(currentPathname) !==
    stripLocalePathPrefix(resolvedPathname)
  );
};
