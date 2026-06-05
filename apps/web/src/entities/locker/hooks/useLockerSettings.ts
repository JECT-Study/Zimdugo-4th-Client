import { useQuery } from "@tanstack/react-query";

interface LockerSettings {
  availableSizes: ("S" | "M" | "L")[];
  pricing: Record<string, number>;
}

/**
 * 보관함 설정 정보를 조회하는 엔티티 쿼리 예시
 */
export function useLockerSettings() {
  return useQuery<LockerSettings>({
    queryKey: ["locker", "settings"],
    queryFn: async () => {
      // 실제로는 API 호출 (api/get-settings.ts 활용)
      return {
        availableSizes: ["S", "M", "L"],
        pricing: { S: 2000, M: 3000, L: 5000 },
      };
    },
  });
}
