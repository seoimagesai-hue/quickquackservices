"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CalendarAppointment = {
  _id: string;
  startAt: string;
  endAt: string;
  status: string;
  serviceId?: { name?: string };
  customerId?: { name?: string };
  staffMemberId?:
    | {
        _id?: string;
        title?: string;
        name?: string;
        userId?: { name?: string; email?: string } | string;
      }
    | string;
};

export type CalendarStaff = {
  id: string;
  name: string;
};

type ViewMode = "day" | "week" | "month";

function staffIdOf(a: CalendarAppointment): string {
  if (!a.staffMemberId) return "";
  if (typeof a.staffMemberId === "string") return a.staffMemberId;
  return String(a.staffMemberId._id || "");
}

function staffLabel(a: CalendarAppointment, staff: CalendarStaff[]): string {
  const id = staffIdOf(a);
  const match = staff.find((s) => s.id === id);
  if (match) return match.name;
  if (typeof a.staffMemberId === "object" && a.staffMemberId) {
    const user =
      typeof a.staffMemberId.userId === "object"
        ? a.staffMemberId.userId
        : null;
    return (
      a.staffMemberId.name ||
      user?.name ||
      a.staffMemberId.title ||
      "Staff"
    );
  }
  return "Staff";
}

export function CalendarView({
  appointments,
  staff,
}: {
  appointments: CalendarAppointment[];
  staff: CalendarStaff[];
}) {
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [staffFilter, setStaffFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (staffFilter === "all") return appointments;
    return appointments.filter((a) => staffIdOf(a) === staffFilter);
  }, [appointments, staffFilter]);

  const rangeDays = useMemo(() => {
    if (view === "day") return [cursor];
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [cursor, view]);

  function shift(dir: -1 | 1) {
    if (view === "day") setCursor((c) => addDays(c, dir));
    else if (view === "week") setCursor((c) => addDays(c, dir * 7));
    else setCursor((c) => addDays(startOfMonth(c), dir > 0 ? 32 : -1));
  }

  const title =
    view === "day"
      ? format(cursor, "EEEE, MMM d yyyy")
      : view === "week"
        ? `Week of ${format(startOfWeek(cursor, { weekStartsOn: 1 }), "MMM d")}`
        : format(cursor, "MMMM yyyy");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["day", "week", "month"] as ViewMode[]).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={view === v ? "default" : "outline"}
              onClick={() => setView(v)}
            >
              {v[0]!.toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => shift(-1)}>
            Prev
          </Button>
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button size="sm" variant="ghost" onClick={() => shift(1)}>
            Next
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          Staff
          <select
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
          >
            <option value="all">All staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-1">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {rangeDays.map((day) => {
            const dayAppts = filtered.filter((a) =>
              isSameDay(new Date(a.startAt), day)
            );
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  setCursor(day);
                  setView("day");
                }}
                className={cn(
                  "min-h-24 rounded-xl border border-border p-2 text-left transition hover:border-primary/40",
                  !isSameMonth(day, cursor) && "opacity-40",
                  isSameDay(day, new Date()) && "ring-2 ring-primary/30"
                )}
              >
                <p className="text-xs font-medium">{format(day, "d")}</p>
                <div className="mt-1 space-y-0.5">
                  {dayAppts.slice(0, 3).map((a) => (
                    <p
                      key={a._id}
                      className="truncate rounded bg-primary/10 px-1 text-[10px] text-primary"
                    >
                      {format(new Date(a.startAt), "HH:mm")}{" "}
                      {a.serviceId?.name || "Appt"}
                    </p>
                  ))}
                  {dayAppts.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{dayAppts.length - 3} more
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3",
            view === "week" ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
          )}
        >
          {rangeDays.map((day) => {
            const dayAppts = filtered
              .filter((a) => isSameDay(new Date(a.startAt), day))
              .sort(
                (a, b) =>
                  new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
              );
            return (
              <Card key={day.toISOString()}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {format(day, "EEE, MMM d")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayAppts.map((a) => (
                    <div
                      key={a._id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm dark:border-white/15"
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(a.startAt), "h:mm a")} –{" "}
                          {format(new Date(a.endAt), "h:mm a")}
                        </p>
                        <p className="text-muted-foreground">
                          {a.serviceId?.name || "Service"} ·{" "}
                          {a.customerId?.name || "Customer"} ·{" "}
                          {staffLabel(a, staff)}
                        </p>
                      </div>
                      <Badge>{a.status}</Badge>
                    </div>
                  ))}
                  {!dayAppts.length && (
                    <p className="text-sm text-muted-foreground">No appointments.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
