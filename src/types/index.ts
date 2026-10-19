export type PlatformRole = "platform_admin" | "user";
export type BusinessRole = "owner" | "staff";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "unpaid"
  | "none";
export type BillingInterval = "month" | "year";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type ServiceMode = "in_location" | "on_site" | "hybrid";
export type ServiceLocationType = "in_location" | "on_site" | "either";

export interface ServiceAddress {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  formatted?: string;
}

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface WeeklyHours {
  day: DayOfWeek;
  enabled: boolean;
  ranges: TimeRange[];
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  platformRole: PlatformRole;
  emailVerified: boolean;
}
