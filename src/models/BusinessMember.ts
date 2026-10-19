import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { BusinessRole } from "@/types";

const BusinessMemberSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "staff"] satisfies BusinessRole[],
      required: true,
    },
    permissions: {
      manageBookings: { type: Boolean, default: true },
      manageServices: { type: Boolean, default: false },
      manageStaff: { type: Boolean, default: false },
      manageCustomers: { type: Boolean, default: true },
      manageSettings: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: false },
    },
    title: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 1000 },
    avatarUrl: { type: String, default: null },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    isBookable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "invited", "disabled"],
      default: "active",
    },
    invitedEmail: { type: String, default: null },
    inviteTokenHash: { type: String, default: null, select: false },
    inviteExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

BusinessMemberSchema.index({ businessId: 1, userId: 1 }, { unique: true });
BusinessMemberSchema.index({ businessId: 1, status: 1 });

export type BusinessMemberDocument = InferSchemaType<
  typeof BusinessMemberSchema
> & { _id: mongoose.Types.ObjectId };

export const BusinessMember: Model<BusinessMemberDocument> =
  mongoose.models.BusinessMember ||
  mongoose.model<BusinessMemberDocument>(
    "BusinessMember",
    BusinessMemberSchema
  );
