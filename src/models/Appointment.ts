import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { AppointmentStatus } from "@/types";

const AppointmentSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    staffMemberId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessMember",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    /** UTC start */
    startAt: { type: Date, required: true, index: true },
    /** UTC end */
    endAt: { type: Date, required: true, index: true },
    timezone: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ] satisfies AppointmentStatus[],
      default: "confirmed",
      index: true,
    },
    priceCents: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    depositCents: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "paid", "refunded", "failed"],
      default: "none",
    },
    stripePaymentIntentId: { type: String, default: null },
    stripeCheckoutSessionId: { type: String, default: null },
    notes: { type: String, default: "", maxlength: 2000 },
    customerNotes: { type: String, default: "", maxlength: 2000 },
    /** On-site job location */
    serviceAddress: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      region: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
      formatted: { type: String, default: "" },
    },
    problemDescription: { type: String, default: "", maxlength: 4000 },
    /** Answers to business-configured intake fields */
    intakeAnswers: { type: Schema.Types.Mixed, default: {} },
    cancellationReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: ["customer", "staff", "owner", "system", null],
      default: null,
    },
    manageTokenHash: { type: String, default: null, select: false },
    manageTokenExpiresAt: { type: Date, default: null },
    reminderEmailSentAt: { type: Date, default: null },
    reminderSmsSentAt: { type: Date, default: null },
    source: {
      type: String,
      enum: ["online", "dashboard", "admin"],
      default: "online",
    },
  },
  { timestamps: true }
);

AppointmentSchema.index({ businessId: 1, startAt: 1, status: 1 });
AppointmentSchema.index({ businessId: 1, staffMemberId: 1, startAt: 1 });
AppointmentSchema.index({ businessId: 1, customerId: 1, startAt: -1 });

export type AppointmentDocument = InferSchemaType<typeof AppointmentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Appointment: Model<AppointmentDocument> =
  mongoose.models.Appointment ||
  mongoose.model<AppointmentDocument>("Appointment", AppointmentSchema);
