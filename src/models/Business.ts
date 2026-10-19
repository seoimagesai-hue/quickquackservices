import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { WeeklyHours } from "@/types";

const TimeRangeSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const WeeklyHoursSchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    enabled: { type: Boolean, default: true },
    ranges: { type: [TimeRangeSchema], default: [] },
  },
  { _id: false }
);

const defaultHours: WeeklyHours[] = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  day: day as WeeklyHours["day"],
  enabled: day >= 1 && day <= 5,
  ranges:
    day >= 1 && day <= 5
      ? [{ start: "09:00", end: "17:00" }]
      : [],
}));

const BusinessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: { type: String, default: "", maxlength: 2000 },
    /** @deprecated use category */
    industry: { type: String, default: "other" },
    category: {
      type: String,
      enum: [
        "salon",
        "barber",
        "plumbing",
        "hvac",
        "cleaning",
        "consulting",
        "repair",
        "other",
      ],
      default: "other",
      index: true,
    },
    /** Free-text when category is other or owner wants a custom label */
    customCategory: { type: String, default: "", maxlength: 120 },
    serviceMode: {
      type: String,
      enum: ["in_location", "on_site", "hybrid"],
      default: "in_location",
    },
    timezone: { type: String, required: true, default: "UTC" },
    country: { type: String, default: "", maxlength: 100 },
    locale: { type: String, default: "en-US" },
    currency: { type: String, default: "USD" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    onboardingStep: { type: Number, default: 0, min: 0, max: 20 },
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      region: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    /** Postal codes / cities / regions this on-site business serves */
    serviceAreas: {
      type: [
        {
          label: { type: String, required: true },
          areaType: {
            type: String,
            enum: ["city", "region", "postal", "custom"],
            default: "custom",
          },
        },
      ],
      default: [],
    },
    travelBufferMinutes: { type: Number, default: 0, min: 0, max: 240 },
    /** Per-business intake form (copied from category preset, editable) */
    intakeFields: {
      type: [
        {
          key: { type: String, required: true },
          label: { type: String, required: true },
          type: {
            type: String,
            enum: ["text", "textarea", "select"],
            default: "text",
          },
          required: { type: Boolean, default: false },
          placeholder: { type: String, default: "" },
          options: [{ type: String }],
          isAddress: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
    requireStaffSelection: { type: Boolean, default: false },
    requireServiceAddress: { type: Boolean, default: false },
    logoUrl: { type: String, default: null },
    brandColor: { type: String, default: "#6366F1" },
    businessHours: { type: [WeeklyHoursSchema], default: defaultHours },
    holidays: [
      {
        date: { type: String, required: true }, // YYYY-MM-DD in business TZ
        name: { type: String, default: "Holiday" },
      },
    ],
    bookingSettings: {
      minLeadTimeMinutes: { type: Number, default: 60 },
      maxAdvanceDays: { type: Number, default: 60 },
      bufferBeforeMinutes: { type: Number, default: 0 },
      bufferAfterMinutes: { type: Number, default: 0 },
      slotIntervalMinutes: { type: Number, default: 15 },
      travelBufferMinutes: { type: Number, default: 0 },
      requireDeposit: { type: Boolean, default: false },
      depositType: {
        type: String,
        enum: ["none", "fixed", "percent"],
        default: "none",
      },
      depositAmount: { type: Number, default: 0 },
      cancellationPolicyHours: { type: Number, default: 24 },
      allowCustomerCancel: { type: Boolean, default: true },
      allowCustomerReschedule: { type: Boolean, default: true },
      confirmationMessage: { type: String, default: "" },
    },
    reminderSettings: {
      emailEnabled: { type: Boolean, default: true },
      emailHoursBefore: { type: Number, default: 24 },
      smsEnabled: { type: Boolean, default: false },
      smsHoursBefore: { type: Number, default: 2 },
    },
    onboardingCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

BusinessSchema.index({ ownerId: 1, status: 1 });

export type BusinessDocument = InferSchemaType<typeof BusinessSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Business: Model<BusinessDocument> =
  mongoose.models.Business ||
  mongoose.model<BusinessDocument>("Business", BusinessSchema);
