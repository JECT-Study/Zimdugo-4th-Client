import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NoticeListPage } from "#/features/settings/legal/ui/NoticePages";
import type { ClientDocumentResponse } from "#/shared/api/documents";

export const Route = createFileRoute("/notices")({
  component: NoticesPage,
});

function NoticesPage() {
  const navigate = useNavigate();

  const handleSelect = (doc: ClientDocumentResponse) => {
    void navigate({
      to: "/notices/$noticeId",
      params: { noticeId: String(doc.id) },
    });
  };

  return <NoticeListPage onSelect={handleSelect} />;
}
