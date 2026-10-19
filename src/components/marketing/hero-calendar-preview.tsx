"use client";

import { motion, useReducedMotion } from "framer-motion";
import { addDays, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

const slots = [
  {
    time: "09:00",
    label: "Client consultation",
    client: "Booked",
    color: "border-border bg-muted text-foreground",
  },
  {
    time: "10:30",
    label: "On-site service",
    client: "Booked",
    color: "border-secondary/40 bg-secondary/10 text-foreground",
  },
  {
    time: "13:00",
    label: "Follow-up appointment",
    client: "Booked",
    color: "border-border bg-accent text-foreground",
  },
  {
    time: "15:30",
    label: "Open slot",
    client: null,
    color: "border-dashed border-border bg-transparent text-muted-foreground",
  },
];

export function HeroCalendarPreview({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const focusDay =
    weekDays.find((d) => format(d, "yyyy-MM-dd") === todayKey) || weekDays[3]!;

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-border bg-background p-4 sm:p-6",
        className
      )}
    >
      <div className="relative flex items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <p className="label-caps text-muted-foreground">Week view</p>
          <p className="mt-1 font-display text-xl text-foreground">
            {format(focusDay, "MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="border border-border p-2 text-muted-foreground" aria-hidden>
            <ChevronLeft className="size-4" />
          </span>
          <span className="border border-border p-2 text-muted-foreground" aria-hidden>
            <ChevronRight className="size-4" />
          </span>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="relative mt-1 grid grid-cols-7 gap-1">
        {weekDays.map((day, i) => {
          const isToday = format(day, "yyyy-MM-dd") === todayKey;
          return (
            <motion.div
              key={day.toISOString()}
              initial={reduce ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduce ? 0 : i * 0.04, duration: 0.3 }}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-start border p-2 text-sm",
                isToday
                  ? "border-[var(--cream)] bg-[var(--cream)]/10 font-medium text-[var(--cream)]"
                  : "border-border bg-muted/40 text-foreground/80"
              )}
            >
              <span>{format(day, "d")}</span>
              {isToday && (
                <span className="mt-1 border border-[var(--cream)]/40 px-1.5 py-0 text-[9px] uppercase tracking-wider text-[var(--cream)]">
                  Today
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="relative mt-5 space-y-2">
        <p className="label-caps text-muted-foreground">
          {format(focusDay, "EEEE · MMM d")}
        </p>
        {slots.map((slot, i) => (
          <motion.div
            key={slot.time}
            initial={reduce ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduce ? 0 : 0.15 + i * 0.06, duration: 0.35 }}
            className={cn(
              "flex items-center gap-3 border px-3 py-2.5 text-sm",
              slot.color
            )}
          >
            <Clock className="size-4 shrink-0 opacity-70" aria-hidden />
            <span className="w-12 shrink-0 font-mono text-xs font-medium">
              {slot.time}
            </span>
            <span className="min-w-0 flex-1 truncate">{slot.label}</span>
            {slot.client ? (
              <span className="ml-auto flex shrink-0 items-center gap-1 text-xs opacity-80">
                <User className="size-3" aria-hidden />
                {slot.client}
              </span>
            ) : (
              <span className="ml-auto shrink-0 text-xs">Available</span>
            )}
          </motion.div>
        ))}
      </div>

      {!reduce && (
        <motion.div
          className="absolute bottom-5 right-5 hidden max-w-[11rem] border border-border bg-background px-3 py-2.5 sm:block"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <p className="label-caps text-muted-foreground">Live booking</p>
          <p className="mt-1 text-sm text-success">Confirmed</p>
        </motion.div>
      )}
    </div>
  );
}
