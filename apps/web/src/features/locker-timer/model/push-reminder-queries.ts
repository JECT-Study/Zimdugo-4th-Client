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
    // 다른 탭에서 바뀔 수 있는 값이라 짧게 잡는다.
    staleTime: 30 * 1000,
    /*
     * 포커스가 돌아오면 신선도와 무관하게 다시 읽는다.
     *
     * staleTime 은 낡음을 표시할 시점만 정할 뿐이라, 기본 포커스 재조회는 그
     * 시간이 지나야 걸린다. 두 탭을 열어 둔 채 한쪽에서 타이머를 만들고 30초
     * 안에 다른 탭으로 넘어가면, 그 탭은 도는 타이머를 숨긴 채 새로 켜게 하고
     * 서버의 한도 오류만 보여 준다.
     *
     * 주기 폴링이 아니라 사용자가 화면으로 돌아오는 순간에만 걸린다. 서버의
     * 요청 한도(PUSH-429-1)를 갉아먹지 않는다.
     */
    refetchOnWindowFocus: "always",
    select: (reminders: PushReminder[]) => reminders.at(0) ?? null,
  });

export const useCreateReminderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PushReminderCreateBody) => postPushReminder(body),
    /*
     * 진행 중인 조회를 먼저 끊는다.
     *
     * 기기 초기화의 무효화나 포커스 재조회가 도는 사이에 생성이 끝나면, 생성
     * 전의 빈 목록을 읽은 응답이 아래 setQueryData 보다 늦게 도착해 방금 넣은
     * 값을 덮어쓴다. 서버에는 타이머가 도는데 화면에서만 사라진다.
     */
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: PUSH_REMINDER_QUERY_KEY }),
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
    // 생성과 같은 이유다. 늦게 도착한 조회가 지운 결과를 되살린다.
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: PUSH_REMINDER_QUERY_KEY }),
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
