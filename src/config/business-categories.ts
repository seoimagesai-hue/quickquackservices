/**
 * Industry presets for independent service businesses.
 * Intake fields and booking UX adapt per category.
 */

export const BUSINESS_CATEGORIES = [
  "salon",
  "barber",
  "plumbing",
  "hvac",
  "cleaning",
  "consulting",
  "repair",
  "other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export type ServiceMode = "in_location" | "on_site" | "hybrid";

export type IntakeFieldType = "text" | "textarea" | "select";

export interface IntakeFieldDef {
  key: string;
  label: string;
  type: IntakeFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  /** When true, collected as structured service address parts */
  isAddress?: boolean;
}

export interface CategoryPreset {
  id: BusinessCategory;
  label: string;
  description: string;
  serviceMode: ServiceMode;
  staffLabel: string; // e.g. Stylist / Technician
  staffLabelPlural: string;
  requireStaffSelection: boolean;
  requireServiceAddress: boolean;
  defaultTravelBufferMinutes: number;
  suggestedServices: Array<{
    name: string;
    durationMinutes: number;
    priceCents: number;
  }>;
  intakeFields: IntakeFieldDef[];
}

export const categoryPresets: Record<BusinessCategory, CategoryPreset> = {
  salon: {
    id: "salon",
    label: "Salon",
    description: "Hair, beauty, and spa appointments at your location.",
    serviceMode: "in_location",
    staffLabel: "Stylist",
    staffLabelPlural: "Stylists",
    requireStaffSelection: true,
    requireServiceAddress: false,
    defaultTravelBufferMinutes: 0,
    suggestedServices: [
      { name: "Haircut", durationMinutes: 45, priceCents: 4500 },
      { name: "Color", durationMinutes: 90, priceCents: 12000 },
    ],
    intakeFields: [
      {
        key: "notes",
        label: "Notes for your stylist",
        type: "textarea",
        required: false,
        placeholder: "Preferences, allergies, etc.",
      },
    ],
  },
  barber: {
    id: "barber",
    label: "Barber",
    description: "Barbershop cuts and grooming at your shop.",
    serviceMode: "in_location",
    staffLabel: "Barber",
    staffLabelPlural: "Barbers",
    requireStaffSelection: true,
    requireServiceAddress: false,
    defaultTravelBufferMinutes: 0,
    suggestedServices: [
      { name: "Classic Cut", durationMinutes: 30, priceCents: 3500 },
      { name: "Cut & Beard", durationMinutes: 45, priceCents: 4500 },
    ],
    intakeFields: [
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
        required: false,
      },
    ],
  },
  plumbing: {
    id: "plumbing",
    label: "Plumbing",
    description: "Service calls and repairs at the customer location.",
    serviceMode: "on_site",
    staffLabel: "Technician",
    staffLabelPlural: "Technicians",
    requireStaffSelection: false,
    requireServiceAddress: true,
    defaultTravelBufferMinutes: 30,
    suggestedServices: [
      { name: "Diagnostic Visit", durationMinutes: 60, priceCents: 9900 },
      { name: "Drain Clearing", durationMinutes: 90, priceCents: 14900 },
    ],
    intakeFields: [
      {
        key: "serviceAddress",
        label: "Service address",
        type: "textarea",
        required: true,
        isAddress: true,
        placeholder: "Street, city, region, postal code",
      },
      {
        key: "problemDescription",
        label: "Problem description",
        type: "textarea",
        required: true,
        placeholder: "What issue are you experiencing?",
      },
      {
        key: "accessNotes",
        label: "Access / entry notes",
        type: "text",
        required: false,
        placeholder: "Gate code, parking, etc.",
      },
    ],
  },
  hvac: {
    id: "hvac",
    label: "HVAC",
    description: "Installation, repair, and maintenance visits on-site.",
    serviceMode: "on_site",
    staffLabel: "Technician",
    staffLabelPlural: "Technicians",
    requireStaffSelection: false,
    requireServiceAddress: true,
    defaultTravelBufferMinutes: 30,
    suggestedServices: [
      { name: "Maintenance Tune-up", durationMinutes: 60, priceCents: 12900 },
      { name: "Repair Visit", durationMinutes: 90, priceCents: 15900 },
      { name: "Installation Consult", durationMinutes: 60, priceCents: 0 },
    ],
    intakeFields: [
      {
        key: "serviceAddress",
        label: "Service location",
        type: "textarea",
        required: true,
        isAddress: true,
        placeholder: "Full service address",
      },
      {
        key: "serviceType",
        label: "Visit type",
        type: "select",
        required: true,
        options: ["Installation", "Repair", "Maintenance"],
      },
      {
        key: "equipmentDetails",
        label: "Equipment details (optional)",
        type: "textarea",
        required: false,
        placeholder: "Make, model, age, error codes",
      },
      {
        key: "problemDescription",
        label: "Issue description",
        type: "textarea",
        required: true,
      },
    ],
  },
  cleaning: {
    id: "cleaning",
    label: "Cleaning",
    description: "Residential or commercial cleaning at the client site.",
    serviceMode: "on_site",
    staffLabel: "Cleaner",
    staffLabelPlural: "Team",
    requireStaffSelection: false,
    requireServiceAddress: true,
    defaultTravelBufferMinutes: 20,
    suggestedServices: [
      { name: "Standard Clean", durationMinutes: 120, priceCents: 15000 },
      { name: "Deep Clean", durationMinutes: 180, priceCents: 25000 },
    ],
    intakeFields: [
      {
        key: "serviceAddress",
        label: "Property address",
        type: "textarea",
        required: true,
        isAddress: true,
      },
      {
        key: "propertyType",
        label: "Property type",
        type: "select",
        required: false,
        options: ["Apartment", "House", "Office", "Other"],
      },
      {
        key: "notes",
        label: "Special instructions",
        type: "textarea",
        required: false,
      },
    ],
  },
  consulting: {
    id: "consulting",
    label: "Consulting",
    description: "Coaching and consulting sessions (often at your office).",
    serviceMode: "in_location",
    staffLabel: "Consultant",
    staffLabelPlural: "Consultants",
    requireStaffSelection: true,
    requireServiceAddress: false,
    defaultTravelBufferMinutes: 0,
    suggestedServices: [
      { name: "Intro Call", durationMinutes: 30, priceCents: 0 },
      { name: "Strategy Session", durationMinutes: 60, priceCents: 15000 },
    ],
    intakeFields: [
      {
        key: "topic",
        label: "What would you like to discuss?",
        type: "textarea",
        required: false,
      },
    ],
  },
  repair: {
    id: "repair",
    label: "Repair Services",
    description: "General repair and maintenance visits.",
    serviceMode: "on_site",
    staffLabel: "Technician",
    staffLabelPlural: "Technicians",
    requireStaffSelection: false,
    requireServiceAddress: true,
    defaultTravelBufferMinutes: 25,
    suggestedServices: [
      { name: "Service Call", durationMinutes: 60, priceCents: 8900 },
    ],
    intakeFields: [
      {
        key: "serviceAddress",
        label: "Service address",
        type: "textarea",
        required: true,
        isAddress: true,
      },
      {
        key: "problemDescription",
        label: "What needs repair?",
        type: "textarea",
        required: true,
      },
    ],
  },
  other: {
    id: "other",
    label: "Other",
    description: "Custom service business — configure intake in settings.",
    serviceMode: "hybrid",
    staffLabel: "Staff",
    staffLabelPlural: "Staff",
    requireStaffSelection: false,
    requireServiceAddress: false,
    defaultTravelBufferMinutes: 0,
    suggestedServices: [
      { name: "Appointment", durationMinutes: 60, priceCents: 0 },
    ],
    intakeFields: [
      {
        key: "notes",
        label: "Notes",
        type: "textarea",
        required: false,
      },
    ],
  },
};

export function getCategoryPreset(
  category: string | null | undefined
): CategoryPreset {
  if (category && category in categoryPresets) {
    return categoryPresets[category as BusinessCategory];
  }
  return categoryPresets.other;
}

export function isBusinessCategory(value: string): value is BusinessCategory {
  return (BUSINESS_CATEGORIES as readonly string[]).includes(value);
}
