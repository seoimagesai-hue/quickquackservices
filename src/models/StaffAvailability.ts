import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TimeRangeSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const StaffAvailabilitySchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "BusinessMember",
      required: true,
      index: true,
    },
    weeklyHours: [
      {
        day: { type: Number, required: true, min: 0, max: 6 },
        enabled: { type: Boolean, default: true },
        ranges: { type: [TimeRangeSchema], default: [] },
      },
    ],
    breaks: [
      {
        day: { type: Number, required: true, min: 0, max: 6 },
        start: { type: String, required: true },
        end: { type: String, required: true },
        label: { type: String, default: "Break" },
      },
    ],
  },
  { timestamps: true }
);

StaffAvailabilitySchema.index({ businessId: 1, memberId: 1 }, { unique: true });

export type StaffAvailabilityDocument = InferSchemaType<
  typeof StaffAvailabilitySchema
> & { _id: mongoose.Types.ObjectId };

export const StaffAvailability: Model<StaffAvailabilityDocument> =
  mongoose.models.StaffAvailability ||
  mongoose.model<StaffAvailabilityDocument>(
    "StaffAvailability",
    StaffAvailabilitySchema
  );
