import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ServiceSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 2000 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    priceCents: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: "USD" },
    bufferBeforeMinutes: { type: Number, default: 0, min: 0 },
    bufferAfterMinutes: { type: Number, default: 0, min: 0 },
    color: { type: String, default: "#6366F1" },
    category: { type: String, default: "" },
    /** Where this service is delivered */
    locationType: {
      type: String,
      enum: ["in_location", "on_site", "online", "custom", "either"],
      default: "in_location",
    },
    locationLabel: { type: String, default: "", maxlength: 200 },
    onlineBookingEnabled: { type: Boolean, default: true },
    bookingFormId: {
      type: Schema.Types.ObjectId,
      ref: "BookingForm",
      default: null,
    },
    minLeadTimeMinutes: { type: Number, default: null },
    maxAdvanceDays: { type: Number, default: null },

    travelBufferMinutes: { type: Number, default: 0, min: 0, max: 240 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    depositRequired: { type: Boolean, default: false },
    depositCents: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

ServiceSchema.index({ businessId: 1, isActive: 1, sortOrder: 1 });

export type ServiceDocument = InferSchemaType<typeof ServiceSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Service: Model<ServiceDocument> =
  mongoose.models.Service ||
  mongoose.model<ServiceDocument>("Service", ServiceSchema);
