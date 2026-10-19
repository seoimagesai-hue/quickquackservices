import { listAppointmentsAction } from "@/lib/actions/appointments";
import { listStaffAction } from "@/lib/actions/staff";
import {
  CalendarView,
  type CalendarAppointment,
  type CalendarStaff,
} from "@/components/dashboard/calendar-view";

export default async function CalendarPage() {
  const [apptsResult, staffResult] = await Promise.all([
    listAppointmentsAction({ limit: 100 }),
    listStaffAction(),
  ]);

  const items = (
    apptsResult.ok && apptsResult.data?.items ? apptsResult.data.items : []
  ).map((raw) => {
    const a = raw as CalendarAppointment & {
      staffMemberId?: {
        _id?: unknown;
        title?: string;
        userId?: { name?: string } | string;
      };
    };
    const sm = a.staffMemberId;
    if (sm && typeof sm === "object") {
      const user = typeof sm.userId === "object" ? sm.userId : null;
      return {
        ...a,
        staffMemberId: {
          _id: String(sm._id || ""),
          title: sm.title,
          name: user?.name || sm.title,
          userId: sm.userId,
        },
      } satisfies CalendarAppointment;
    }
    return a as CalendarAppointment;
  });

  const staffRaw =
    staffResult.ok && staffResult.data?.staff ? staffResult.data.staff : [];

  const staff: CalendarStaff[] = (
    staffRaw as Array<{
      _id: string;
      title?: string;
      userId?: { name?: string; email?: string } | string;
    }>
  ).map((m) => {
    const user =
      typeof m.userId === "object" && m.userId ? m.userId : null;
    return {
      id: String(m._id),
      name: user?.name || m.title || user?.email || "Staff",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Day, week, and month views with staff filtering. Conflict checks run
          on the server when bookings change.
        </p>
      </div>
      {!apptsResult.ok && (
        <p className="text-sm text-red-600">{apptsResult.error}</p>
      )}
      <CalendarView appointments={items} staff={staff} />
    </div>
  );
}
