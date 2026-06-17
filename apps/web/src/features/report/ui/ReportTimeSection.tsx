import { m } from "@repo/i18n";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  PopupPicker,
  type PopupPickerColumn,
} from "@repo/ui/components/popup-picker";
import { useMemo, useState } from "react";
import { useReportSectionError } from "#/features/report/model/useReportSectionError";
import { PickerTriggerButton } from "./PickerTriggerButton";
import { ReportSectionErrorReserve } from "./ReportSectionErrorReserve";
import { ReportSectionTitleRow } from "./ReportSectionTitleRow";
import {
  section,
  timeAllDayRow,
  timeRow,
  timeSeparator,
} from "./report.css.ts";

interface ReportTimeSectionProps {
  openTime: string;
  setOpenTime: (val: string) => void;
  closeTime: string;
  setCloseTime: (val: string) => void;
  sectionServerError?: string;
  onFieldChange?: () => void;
}

type TimeTarget = "open" | "close";

const parseTime = (time: string) => {
  const [hour = "00", minute = "00"] = time.split(":");

  return {
    hour: hour.padStart(2, "0").slice(0, 2),
    minute: minute.padStart(2, "0").slice(0, 2),
  };
};

export function ReportTimeSection({
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime,
  sectionServerError,
  onFieldChange,
}: ReportTimeSectionProps) {
  const errorMessage = useReportSectionError(
    ["startTime", "endTime"],
    sectionServerError,
  );
  const errorId = errorMessage ? "report-time-error" : undefined;
  const isAllDay = openTime === "00:00" && closeTime === "00:00";
  const [activeTarget, setActiveTarget] = useState<TimeTarget | null>(null);
  const [pendingHour, setPendingHour] = useState("00");
  const [pendingMinute, setPendingMinute] = useState("00");

  const hourOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => {
        const hour = String(index).padStart(2, "0");

        return { value: hour, label: hour };
      }),
    [],
  );

  const minuteOptions = useMemo(
    () =>
      Array.from({ length: 60 }, (_, index) => {
        const minute = String(index).padStart(2, "0");

        return { value: minute, label: minute };
      }),
    [],
  );

  const columns = useMemo<PopupPickerColumn[]>(
    () => [
      {
        id: "hour",
        value: pendingHour,
        options: hourOptions,
        ariaLabel: m.report_time_hour_aria(),
        isCircular: true,
      },
      {
        id: "minute",
        value: pendingMinute,
        options: minuteOptions,
        ariaLabel: m.report_time_minute_aria(),
        isCircular: true,
      },
    ],
    [hourOptions, minuteOptions, pendingHour, pendingMinute],
  );

  const handleOpenPicker = (target: TimeTarget) => {
    if (isAllDay) return;

    const currentTime = parseTime(target === "open" ? openTime : closeTime);

    setActiveTarget(target);
    setPendingHour(currentTime.hour);
    setPendingMinute(currentTime.minute);
  };

  const handleTimeChange = (columnId: string, value: string) => {
    if (columnId === "hour") {
      setPendingHour(value);
    }

    if (columnId === "minute") {
      setPendingMinute(value);
    }
  };

  const handleConfirmTime = () => {
    const nextTime = `${pendingHour}:${pendingMinute}`;

    if (activeTarget === "open") {
      setOpenTime(nextTime);
    }

    if (activeTarget === "close") {
      setCloseTime(nextTime);
    }

    onFieldChange?.();
  };

  const handleAllDayChange = (selected: boolean) => {
    if (selected) {
      setOpenTime("00:00");
      setCloseTime("00:00");
      setActiveTarget(null);
      onFieldChange?.();
      return;
    }

    setOpenTime("");
    setCloseTime("");
    onFieldChange?.();
  };

  return (
    <section className={section} data-section="time" aria-describedby={errorId}>
      <ReportSectionTitleRow errorMessage={errorMessage} errorId={errorId}>
        {m.report_section_time()}
      </ReportSectionTitleRow>
      <div className={timeRow}>
        {/* Existing Dropdown is kept aside while this section uses PopupPicker. */}
        <PickerTriggerButton
          label={openTime || m.report_time_start()}
          ariaLabel={m.report_time_start_select_aria()}
          onPress={() => handleOpenPicker("open")}
          isDisabled={isAllDay}
        />
        <span className={timeSeparator}>~</span>
        <PickerTriggerButton
          label={closeTime || m.report_time_end()}
          ariaLabel={m.report_time_end_select_aria()}
          onPress={() => handleOpenPicker("close")}
          isDisabled={isAllDay}
        />
      </div>
      <div className={timeAllDayRow}>
        <Checkbox
          labelText={m.report_time_all_day()}
          isSelected={isAllDay}
          onSelectedChange={handleAllDayChange}
          labelLocation="right"
        />
      </div>

      <PopupPicker
        isOpen={activeTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setActiveTarget(null);
        }}
        titleText={
          activeTarget === "close"
            ? m.report_time_end_picker_title()
            : m.report_time_start_picker_title()
        }
        columns={columns}
        onColumnChange={handleTimeChange}
        primaryAction={{
          label: m.report_time_picker_confirm(),
          onPress: handleConfirmTime,
        }}
      />
      <ReportSectionErrorReserve />
      {/* 롤백용: 하단 에러 영역 — Reserve 제거 후 주석 해제
      <ReportSectionError
        id={errorId}
        message={errorMessage}
        placement="bottom"
      />
      */}
    </section>
  );
}
