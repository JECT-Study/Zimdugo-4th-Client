import { m } from "@repo/i18n";
import { IconNavigationClock24 } from "@repo/ui/tokens/icons";
import { useEffect, useState } from "react";
import { getRemainingTimeParts } from "../model/locker-timer-format";
import {
  type ActiveLockerTimer,
  getActiveLockerTimer,
  removeLockerTimer,
  subscribeLockerTimerStorage,
} from "../model/locker-timer-storage";
import { control, remainingBadge } from "./LockerTimerMapControl.css";
import { LockerTimerModal } from "./LockerTimerModal";

const formatEndTime = (endAt: number) => {
  const endTime = new Date(endAt);
  return `${String(endTime.getHours()).padStart(2, "0")}:${String(
    endTime.getMinutes(),
  ).padStart(2, "0")}`;
};

const formatRemainingTime = (remainingTimeInSeconds: number) => {
  const { hours, minutes } = getRemainingTimeParts(remainingTimeInSeconds);
  return `${String(hours).padStart(2, "0")} : ${String(minutes).padStart(2, "0")}`;
};

const formatRemainingBadge = (remainingTimeInSeconds: number) => {
  const { hours, minutes } = getRemainingTimeParts(remainingTimeInSeconds);

  return hours > 0
    ? m.locker_timer_remaining_hours_minutes({ hours, minutes })
    : m.locker_timer_remaining_minutes({ minutes });
};

export function LockerTimerMapControl({
  buttonClassName,
}: {
  buttonClassName: string;
}) {
  const [activeTimer, setActiveTimer] = useState<ActiveLockerTimer | null>(
    null,
  );
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [isOpen, setIsOpen] = useState(false);
  const remainingTimeInSeconds = activeTimer
    ? Math.max(0, Math.ceil((activeTimer.endAt - currentTime) / 1000))
    : 0;

  const handleOpen = () => setIsOpen(true);

  const handleStop = () => {
    if (!activeTimer) return;

    removeLockerTimer(activeTimer.lockerId);
    setActiveTimer(null);
    setIsOpen(false);
  };

  useEffect(() => {
    const refreshTimer = () => {
      setActiveTimer(getActiveLockerTimer());
      setCurrentTime(Date.now());
    };

    refreshTimer();
    return subscribeLockerTimerStorage(refreshTimer);
  }, []);

  useEffect(() => {
    if (!activeTimer) return;

    const intervalId = window.setInterval(() => {
      const nextTime = Date.now();
      setCurrentTime(nextTime);

      if (activeTimer.endAt <= nextTime) {
        removeLockerTimer(activeTimer.lockerId);
        setActiveTimer(getActiveLockerTimer());
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeTimer]);

  if (!activeTimer || remainingTimeInSeconds <= 0) return null;

  return (
    <>
      <button
        type="button"
        className={[buttonClassName, control].join(" ")}
        style={{ width: 40, height: 40 }}
        onClick={handleOpen}
        aria-label={m.locker_timer_map_control_aria()}
      >
        <IconNavigationClock24 />
        <span className={remainingBadge}>
          {formatRemainingBadge(remainingTimeInSeconds)}
        </span>
      </button>
      <LockerTimerModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        mode="running"
        remainingTimeLabel={formatRemainingTime(remainingTimeInSeconds)}
        endTimeLabel={formatEndTime(activeTimer.endAt)}
        remainingTimeInSeconds={remainingTimeInSeconds}
        configuredTimeInSeconds={activeTimer.configuredTimeInSeconds}
        onStop={handleStop}
      />
    </>
  );
}
