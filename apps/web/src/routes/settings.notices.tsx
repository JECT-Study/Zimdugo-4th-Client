import { createFileRoute, redirect } from "@tanstack/react-router";

type NoticesSearch = {
  id?: number;
};

const parseNoticesSearch = (search: Record<string, unknown>): NoticesSearch => {
  const id =
    typeof search.id === "number" && Number.isInteger(search.id)
      ? search.id
      : typeof search.id === "string" && /^\d+$/.test(search.id)
        ? Number(search.id)
        : undefined;
  return id !== undefined ? { id } : {};
};

export const Route = createFileRoute("/settings/notices")({
  validateSearch: parseNoticesSearch,
  beforeLoad: ({ search }) => {
    if (search.id !== undefined) {
      throw redirect({
        to: "/notices/$noticeId",
        params: { noticeId: String(search.id) },
        replace: true,
      });
    }

    throw redirect({
      to: "/notices",
      replace: true,
    });
  },
});
