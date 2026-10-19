/**
 * Official brand + UK company identity for Quick Quack Services.
 *
 * Verified against Companies House company 16457419 (fetched 19 Oct 2026):
 * - Legal name, number, registered office, incorporation date, company type
 *
 * Flagged (not invented; see notes below):
 * - Companies House status includes "Active proposal to strike off"
 * - SIC code on record is 81299 (Other cleaning services) — not software
 * - Domain quickquackservices.store is client-supplied; not listed on Companies House
 * - Email addresses below are proposed mailboxes; delivery requires DNS + provider setup
 * - No telephone number has been provided — do not invent one
 */

function envOr(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

const PRODUCTION_URL = "https://quickquackservices.store";

export const brand = {
  /** Public product / website name */
  name: "Quick Quack Services",
  /** Legal entity (Companies House) */
  legalName: "QUICK QUACK SERVICES LTD",
  companyNumber: "16457419",
  companyType: "Private Limited Company",
  country: "United Kingdom",
  registeredOffice: "70 Larch Crescent, Hayes, England, UB4 9DR",
  /** Alias used by older UI copy */
  address: "70 Larch Crescent, Hayes, England, UB4 9DR",
  incorporationDate: "19 May 2025",
  companiesHouseUrl:
    "https://find-and-update.company-information.service.gov.uk/company/16457419",
  jurisdiction: "England and Wales",
  /** Companies House note — flag for operators; not hidden */
  companiesHouseStatusNote:
    "Companies House lists this company as Active with an active proposal to strike off. Confirm current status before relying on this filing.",
  /** Client-supplied production domain (not on Companies House record) */
  productionDomain: "quickquackservices.store",
  /** Always the public production site — use for About / legal / schema display */
  officialWebsiteUrl: PRODUCTION_URL,
  /** Runtime app origin (may be localhost in .env.local for local links) */
  websiteUrl:
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || PRODUCTION_URL,
  tagline: "Book appointments that run themselves",
  description:
    "Simplify appointment scheduling with Quick Quack Services. Manage online bookings, customers, staff, calendars and appointments in one modern platform.",
  seoTitle: "Appointment Booking Software | Quick Quack Services",
  seoDescription:
    "Simplify appointment scheduling with Quick Quack Services. Manage online bookings, customers, staff, calendars and appointments in one modern platform.",
  /** Proposed emails — configurable; not confirmed active until DNS/provider verified */
  supportEmail: envOr(
    "NEXT_PUBLIC_SUPPORT_EMAIL",
    "support@quickquackservices.store"
  ),
  infoEmail: envOr("NEXT_PUBLIC_INFO_EMAIL", "info@quickquackservices.store"),
  billingEmail: envOr(
    "NEXT_PUBLIC_BILLING_EMAIL",
    "billing@quickquackservices.store"
  ),
  contactEmail: envOr(
    "NEXT_PUBLIC_CONTACT_EMAIL",
    "contact@quickquackservices.store"
  ),
  noreplyEmail: envOr(
    "EMAIL_FROM_ADDRESS",
    "noreply@quickquackservices.store"
  ),
  /** No verified phone — leave empty; UI must not invent one */
  supportPhone: envOr("NEXT_PUBLIC_SUPPORT_PHONE", ""),
  social: {
    twitter: "",
    linkedin: "",
  },
  emailsConfiguredNote:
    "Company email addresses are proposed. Do not treat delivery as working until the email provider, domain verification and DNS records are configured and tested.",
} as const;

/** Setmore-inspired light palette (visual only). */
export const colors = {
  primary: "#1B3D32",
  secondary: "#2D6A4F",
  dark: "#3B4C66",
  background: "#FFFFFF",
  accent: "#F0F5F3",
  hero: "#FFFFFF",
  success: "#2D6A4F",
} as const;
