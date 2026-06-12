import { useQuery } from "@tanstack/react-query";
import { getMyPageSummary } from "#/shared/api/my-page";

export const MY_PAGE_SUMMARY_QUERY_KEY = "my-page-summary";

export function useMyPageSummary() {
  return useQuery({
    queryKey: [MY_PAGE_SUMMARY_QUERY_KEY],
    queryFn: ({ signal }) => getMyPageSummary(signal),
    staleTime: 30_000,
  });
}
