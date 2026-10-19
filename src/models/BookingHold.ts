import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Atomic slot lock to prevent double-booking under concurrency.
 * Unique compound index ensures only one active hold/booking per staff+slot.
 */
const BookingHoldSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    staffMemberId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessMember",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    /** Round-to-slot key: staffId:startISO */
    slotKey: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    holdToken: { type: String, required: true, unique: true },
    customerEmail: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "consumed", "expired", "released"],
      default: "active",
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },
  },
  { timestamps: true }
);

BookingHoldSchema.index(
  { staffMemberId: 1, slotKey: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  }
);

/** TTL cleanup for expired holds */
BookingHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type BookingHoldDocument = InferSchemaType<typeof BookingHoldSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BookingHold: Model<BookingHoldDocument> =
  mongoose.models.BookingHold ||
  mongoose.model<BookingHoldDocument>("BookingHold", BookingHoldSchema);
