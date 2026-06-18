import { useQuery } from "@tanstack/react-query";
import {
  type DocumentType,
  getDocuments,
} from "#/shared/api/documents";

export const DOCUMENTS_QUERY_KEY = "documents";

export function useDocuments(type: DocumentType) {
  return useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, type],
    queryFn: ({ signal }) => getDocuments(type, signal),
    staleTime: 5 * 60 * 1000,
  });
}
