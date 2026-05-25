import { languageTag } from "@repo/i18n";
import { NaverMapCanvas, NaverMapProvider } from "#/entities/map";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: IndexPage });

function IndexPage() {
  return (
    <NaverMapProvider language={languageTag()}>
      <NaverMapCanvas />
    </NaverMapProvider>
  );
}
