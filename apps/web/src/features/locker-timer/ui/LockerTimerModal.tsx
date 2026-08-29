import { m } from "@repo/i18n";
import { Button } from "@repo/ui/components/button";
import {
  DialPicker,
  type DialPickerColumn,
} from "@repo/ui/components/popup-picker";
import {
  IconLockerTimerClose28,
  IconLockerTimerLarge,
  IconTimerEnd28,
  IconTimerPreview24,
  IconTimerStart20,
  IconTimerStop20,
} from "@repo/ui/tokens/icons";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import {
  Button as AriaButton,
  Dialog,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  actionButton,
  actionRow,
  actionRowMode,
  closeActionButton,
  closeButton,
  dialog,
  dialogMode,
  endTime,
  header,
  helper,
  lockerIcon,
  overlay,
  preview,
  progressGauge,
  progressRing,
  remainingTime,
  startButton,
  timePicker,
  title,
} from "./LockerTimerModal.css";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour).padStart(2, "0"),
  label: String(hour).padStart(2, "0"),
}));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => ({
  value: String(minute).padStart(2, "0"),
  label: String(minute).padStart(2, "0"),
}));

interface LockerTimerModalBaseProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

interface LockerTimerSetupModalProps extends LockerTimerModalBaseProps {
  mode: "setup";
  hours: string;
  minutes: string;
  currentTime?: Date;
  onDurationChange: (hours: string, minutes: string) => void;
  onStart: () => void;
}

interface LockerTimerRunningModalProps extends LockerTimerModalBaseProps {
  mode: "running";
  remainingTimeLabel: string;
  endTimeLabel: string;
  remainingTimeInSeconds: number;
  configuredTimeInSeconds: number;
  onStop: () => void;
}

export type LockerTimerModalProps =
  | LockerTimerSetupModalProps
  | LockerTimerRunningModalProps;

const getEndTimeLabel = (currentTime: Date, hours: string, minutes: string) => {
  const durationInMinutes = Number(hours) * 60 + Number(minutes);
  const endTime = new Date(
    currentTime.getTime() + durationInMinutes * 60 * 1000,
  );

  return `${String(endTime.getHours()).padStart(2, "0")}:${String(
    endTime.getMinutes(),
  ).padStart(2, "0")}`;
};

const GAUGE_PATH =
  "M51.374 259C30.1862 238.355 15.757 212.052 9.91123 183.417C4.06542 154.782 7.06552 125.101 18.5321 98.1271C29.9988 71.1534 49.4169 48.0986 74.331 31.878C99.245 15.6575 128.536 6.99982 158.5 6.99982C188.464 6.99982 217.755 15.6575 242.669 31.878C267.583 48.0986 287.001 71.1534 298.468 98.1271C309.934 125.101 312.935 154.782 307.089 183.417C301.243 212.052 286.814 238.355 265.626 259";

const getProgressRatio = (
  remainingTimeInSeconds: number,
  configuredTimeInSeconds: number,
) => {
  if (configuredTimeInSeconds <= 0) return 0;

  return Math.min(
    1,
    Math.max(0, remainingTimeInSeconds / configuredTimeInSeconds),
  );
};

function LockerTimerGauge({ progress }: { progress: number }) {
  const gradientId = useId().replaceAll(":", "");
  const isReducedMotion = useReducedMotion();
  const transition = isReducedMotion
    ? { duration: 0 }
    : { duration: 0.8, ease: "easeOut" as const };

  return (
    <svg
      className={progressGauge}
      viewBox="0 0 315 265.638"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={GAUGE_PATH}
        stroke="#E6EFE9"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <motion.path
        d={GAUGE_PATH}
        pathLength={1}
        stroke={`url(#${gradientId})`}
        strokeWidth="14"
        strokeLinecap="round"
        initial={isReducedMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: progress }}
        transition={transition}
      />
      <defs>
        <linearGradient
          id={gradientId}
          x1="265.256"
          y1="258.638"
          x2="13.7025"
          y2="0.469269"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3BD569" />
          <stop offset="1" stopColor="#21C95A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LockerTimerModal(props: LockerTimerModalProps) {
  const isSetup = props.mode === "setup";
  const isStartDisabled =
    isSetup && props.hours === "00" && props.minutes === "00";
  const setupEndTimeLabel =
    props.mode === "setup" && !isStartDisabled
      ? getEndTimeLabel(
          props.currentTime ?? new Date(),
          props.hours,
          props.minutes,
        )
      : undefined;
  const columns: DialPickerColumn[] = isSetup
    ? [
        {
          id: "hours",
          value: props.hours,
          options: HOUR_OPTIONS,
          ariaLabel: m.locker_timer_hour_aria(),
        },
        {
          id: "minutes",
          value: props.minutes,
          options: MINUTE_OPTIONS,
          ariaLabel: m.locker_timer_minute_aria(),
        },
      ]
    : [];
  const progressRatio =
    props.mode === "running"
      ? getProgressRatio(
          props.remainingTimeInSeconds,
          props.configuredTimeInSeconds,
        )
      : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const handleClose = () => {
    props.onOpenChange(false);
  };

  const handleColumnChange = (columnId: string, value: string) => {
    if (props.mode !== "setup") return;

    props.onDurationChange(
      columnId === "hours" ? value : props.hours,
      columnId === "minutes" ? value : props.minutes,
    );
  };

  return (
    <ModalOverlay
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      isDismissable
      className={overlay}
    >
      <Modal className={[dialog, dialogMode[props.mode]].join(" ")}>
        <Dialog aria-label={m.locker_timer_title()}>
          <div className={header}>
            <h2 className={title}>{m.locker_timer_title()}</h2>
            <p className={helper}>{m.locker_timer_helper()}</p>
          </div>

          <AriaButton
            className={closeButton}
            onPress={handleClose}
            aria-label={m.locker_timer_close_aria()}
          >
            <IconLockerTimerClose28 />
          </AriaButton>

          {props.mode === "setup" ? (
            <>
              <div className={preview}>
                <IconTimerPreview24 />
                <span>
                  {setupEndTimeLabel
                    ? m.locker_timer_end_scheduled({
                        time: setupEndTimeLabel,
                      })
                    : m.locker_timer_unset()}
                </span>
              </div>

              <DialPicker
                className={timePicker}
                columns={columns}
                onColumnChange={handleColumnChange}
                centerAccessory=":"
                itemHeight={43}
                viewportHeight={195}
                selectionHeight={54}
                selectionTop={72}
                edgeSpacerHeight={76}
                columnTemplate="189px 117px"
                centerAccessoryLeft={172.5}
                centerAccessoryTop={86}
                centerAccessoryHeight={22}
                selectedFontSize={18}
              />
            </>
          ) : (
            <>
              <div
                className={progressRing}
                role="progressbar"
                aria-label={m.locker_timer_title()}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <LockerTimerGauge progress={progressRatio} />
                <IconLockerTimerLarge className={lockerIcon} />
              </div>
              <strong className={remainingTime}>
                {props.remainingTimeLabel}
              </strong>
              <span className={endTime}>
                <IconTimerEnd28 />
                {m.locker_timer_end({ time: props.endTimeLabel })}
              </span>
            </>
          )}

          <div className={[actionRow, actionRowMode[props.mode]].join(" ")}>
            <Button
              variant="outline"
              intent="primary"
              size="L"
              className={[actionButton, closeActionButton].join(" ")}
              onPress={handleClose}
            >
              {m.locker_timer_close()}
            </Button>
            {props.mode === "setup" ? (
              <Button
                variant="filled"
                intent="primary"
                size="L"
                className={[actionButton, startButton].join(" ")}
                isDisabled={isStartDisabled}
                onPress={props.onStart}
              >
                <IconTimerStart20 />
                {m.locker_timer_start()}
              </Button>
            ) : (
              <Button
                variant="filled"
                intent="primary"
                size="L"
                className={[actionButton, startButton].join(" ")}
                onPress={props.onStop}
              >
                <IconTimerStop20 />
                {m.locker_timer_stop()}
              </Button>
            )}
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
