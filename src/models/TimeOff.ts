import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TimeOffSchema = new Schema(
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
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    reason: { type: String, default: "" },
    allDay: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TimeOffSchema.index({ businessId: 1, memberId: 1, startAt: 1, endAt: 1 });

export type TimeOffDocument = InferSchemaType<typeof TimeOffSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TimeOff: Model<TimeOffDocument> =
  mongoose.models.TimeOff ||
  mongoose.model<TimeOffDocument>("TimeOff", TimeOffSchema);
