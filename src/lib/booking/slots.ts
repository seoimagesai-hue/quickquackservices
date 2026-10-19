import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parse,
  startOfDay,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type { DayOfWeek, TimeRange, WeeklyHours } from "@/types";

export interface BusyInterval {
  startAt: Date;
  endAt: Date;
}

export interface SlotInput {
  dateYmd: string; // YYYY-MM-DD in business timezone
  timezone: string;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  slotIntervalMinutes: number;
  weeklyHours: WeeklyHours[];
  breaks?: Array<{ day: DayOfWeek; start: string; end: string }>;
  holidays?: string[]; // YYYY-MM-DD
  timeOff?: BusyInterval[];
  existingAppointments: BusyInterval[];
  activeHolds: BusyInterval[];
  minLeadTimeMinutes: number;
  maxAdvanceDays: number;
  now?: Date;
}

export interface AvailableSlot {
  startAt: Date;
  endAt: Date;
  label: string;
}

function parseHmOnDate(
  dateYmd: string,
  hm: string,
  timezone: string
): Date {
  const local = parse(`${dateYmd} ${hm}`, "yyyy-MM-dd HH:mm", new Date());
  return fromZonedTime(local, timezone);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function dayOfWeekInTz(dateYmd: string, timezone: string): DayOfWeek {
  const noon = fromZonedTime(
    parse(`${dateYmd} 12:00`, "yyyy-MM-dd HH:mm", new Date()),
    timezone
  );
  const zoned = toZonedTime(noon, timezone);
  return zoned.getDay() as DayOfWeek;
}

/**
 * Pure slot calculator — unit-testable without DB.
 */
export function calculateAvailableSlots(input: SlotInput): AvailableSlot[] {
  const now = input.now ?? new Date();
  const {
    dateYmd,
    timezone,
    durationMinutes,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    slotIntervalMinutes,
    weeklyHours,
    breaks = [],
    holidays = [],
    timeOff = [],
    existingAppointments,
    activeHolds,
    minLeadTimeMinutes,
    maxAdvanceDays,
  } = input;

  if (holidays.includes(dateYmd)) return [];

  const zonedNow = toZonedTime(now, timezone);
  const maxDate = addDays(startOfDay(zonedNow), maxAdvanceDays);
  const targetLocal = parse(dateYmd, "yyyy-MM-dd", new Date());
  if (isBefore(maxDate, targetLocal)) return [];

  const dow = dayOfWeekInTz(dateYmd, timezone);
  const dayHours = weeklyHours.find((h) => h.day === dow);
  if (!dayHours?.enabled || !dayHours.ranges.length) return [];

  const dayBreaks = breaks.filter((b) => b.day === dow);
  const busy: BusyInterval[] = [
    ...existingAppointments,
    ...activeHolds,
    ...timeOff,
  ];

  const earliestBookable = addMinutes(now, minLeadTimeMinutes);
  const slots: AvailableSlot[] = [];
  const interval = Math.max(5, slotIntervalMinutes);

  for (const range of dayHours.ranges as TimeRange[]) {
    let cursor = parseHmOnDate(dateYmd, range.start, timezone);
    const rangeEnd = parseHmOnDate(dateYmd, range.end, timezone);

    while (true) {
      const slotEnd = addMinutes(cursor, durationMinutes);
      if (slotEnd > rangeEnd) break;

      const blockStart = addMinutes(cursor, -bufferBeforeMinutes);
      const blockEnd = addMinutes(slotEnd, bufferAfterMinutes);

      const inBreak = dayBreaks.some((b) => {
        const bStart = parseHmOnDate(dateYmd, b.start, timezone);
        const bEnd = parseHmOnDate(dateYmd, b.end, timezone);
        return overlaps(cursor, slotEnd, bStart, bEnd);
      });

      const conflicts = busy.some((b) =>
        overlaps(blockStart, blockEnd, b.startAt, b.endAt)
      );

      if (!inBreak && !conflicts && cursor >= earliestBookable) {
        slots.push({
          startAt: cursor,
          endAt: slotEnd,
          label: format(toZonedTime(cursor, timezone), "h:mm a"),
        });
      }

      cursor = addMinutes(cursor, interval);
    }
  }

  return slots;
}

export function makeSlotKey(staffMemberId: string, startAt: Date): string {
  return `${staffMemberId}:${startAt.toISOString()}`;
}
