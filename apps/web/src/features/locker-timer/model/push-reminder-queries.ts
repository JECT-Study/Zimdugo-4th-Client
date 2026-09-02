import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deletePushReminder,
  getPushReminders,
  type PushReminder,
  type PushReminderCreateBody,
  postPushReminder,
} from "#/shared/api/push";

export const PUSH_REMINDER_QUERY_KEY = ["push", "reminders"] as const;

/**
 * 현재 기기의 활성 리마인더.
 *
 * 서버가 소스다. 로컬 저장소에 복제하지 않는다. 기기당 하나라 배열의 첫 항목만
 * 의미가 있지만, 응답 형태를 그대로 두고 꺼내 쓰는 쪽에서 고른다.
 *
 * `remainingMinutes` 는 응답 생성 시점 기준이라 화면에서 매초 세는 데 쓰지
 * 않는다. 카운트다운은 `endAt` 으로 한다.
 */
export const useActiveReminderQuery = () =>
  useQuery({
    queryKey: PUSH_REMINDER_QUERY_KEY,
    queryFn: ({ signal }) => getPushReminders(signal),
    // 다른 탭이나 기기에서 바뀔 수 있는 값이라 짧게 잡는다.
    staleTime: 30 * 1000,
    select: (reminders: PushReminder[]) => reminders.at(0) ?? null,
  });

export const useCreateReminderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PushReminderCreateBody) => postPushReminder(body),
    onSuccess: (created) => {
      // 응답이 곧 새 상태다. 재조회를 기다리지 않고 바로 화면에 반영한다.
      queryClient.setQueryData(PUSH_REMINDER_QUERY_KEY, [created]);
    },
  });
};

export const useDeleteReminderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: number) => deletePushReminder(reminderId),
    onSuccess: () => {
      queryClient.setQueryData(PUSH_REMINDER_QUERY_KEY, []);
    },
    onSettled: () => {
      // 삭제가 서버에서 실제로 반영됐는지 다시 확인한다. 지금 서버는 삭제 뒤
      // 재생성이 COMMON-500 으로 막히는 상태라, 로컬 낙관값만 믿으면 그 사실이
      // 화면에서 가려진다.
      queryClient.invalidateQueries({ queryKey: PUSH_REMINDER_QUERY_KEY });
    },
  });
};
