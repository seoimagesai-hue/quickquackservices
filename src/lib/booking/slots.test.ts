import { describe, expect, it } from "vitest";
import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { calculateAvailableSlots, makeSlotKey } from "./slots";
import type { WeeklyHours } from "@/types";

const weekdayHours: WeeklyHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  day: day as WeeklyHours["day"],
  enabled: day >= 1 && day <= 5,
  ranges: day >= 1 && day <= 5 ? [{ start: "09:00", end: "12:00" }] : [],
}));

describe("calculateAvailableSlots", () => {
  it("returns slots within business hours", () => {
    const now = fromZonedTime(
      new Date("2026-10-16T08:00:00"),
      "America/New_York"
    );
    const slots = calculateAvailableSlots({
      dateYmd: "2026-10-19", // Monday
      timezone: "America/New_York",
      durationMinutes: 60,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      slotIntervalMinutes: 30,
      weeklyHours: weekdayHours,
      existingAppointments: [],
      activeHolds: [],
      minLeadTimeMinutes: 0,
      maxAdvanceDays: 60,
      now,
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]?.label).toMatch(/9:00/i);
  });

  it("excludes holidays", () => {
    const slots = calculateAvailableSlots({
      dateYmd: "2026-10-19",
      timezone: "UTC",
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      slotIntervalMinutes: 30,
      weeklyHours: weekdayHours,
      holidays: ["2026-10-19"],
      existingAppointments: [],
      activeHolds: [],
      minLeadTimeMinutes: 0,
      maxAdvanceDays: 60,
      now: new Date("2026-10-01T00:00:00Z"),
    });
    expect(slots).toHaveLength(0);
  });

  it("prevents overlap with existing appointments including buffers", () => {
    const start = fromZonedTime(
      new Date("2026-10-19T10:00:00"),
      "America/New_York"
    );
    const slots = calculateAvailableSlots({
      dateYmd: "2026-10-19",
      timezone: "America/New_York",
      durationMinutes: 60,
      bufferBeforeMinutes: 15,
      bufferAfterMinutes: 15,
      slotIntervalMinutes: 15,
      weeklyHours: weekdayHours,
      existingAppointments: [
        { startAt: start, endAt: addMinutes(start, 60) },
      ],
      activeHolds: [],
      minLeadTimeMinutes: 0,
      maxAdvanceDays: 60,
      now: new Date("2026-10-01T00:00:00Z"),
    });
    const blocked = slots.some(
      (s) => s.startAt.getTime() === start.getTime()
    );
    expect(blocked).toBe(false);
  });

  it("returns no slots on weekend when disabled", () => {
    const slots = calculateAvailableSlots({
      dateYmd: "2026-10-18", // Sunday
      timezone: "UTC",
      durationMinutes: 30,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      slotIntervalMinutes: 30,
      weeklyHours: weekdayHours,
      existingAppointments: [],
      activeHolds: [],
      minLeadTimeMinutes: 0,
      maxAdvanceDays: 60,
      now: new Date("2026-10-01T00:00:00Z"),
    });
    expect(slots).toHaveLength(0);
  });
});

describe("makeSlotKey", () => {
  it("is stable for same staff and start", () => {
    const d = new Date("2026-10-19T14:00:00.000Z");
    expect(makeSlotKey("abc", d)).toBe("abc:2026-10-19T14:00:00.000Z");
  });
});
