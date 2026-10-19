import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { BillingInterval, SubscriptionStatus } from "@/types";
import type { PlanId } from "@/config/plans";

const SubscriptionSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      unique: true,
      index: true,
    },
    planId: {
      type: String,
      enum: ["starter", "professional", "business"] satisfies PlanId[],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "unpaid",
        "none",
      ] satisfies SubscriptionStatus[],
      default: "trialing",
      index: true,
    },
    billingInterval: {
      type: String,
      enum: ["month", "year"] satisfies BillingInterval[],
      default: "month",
    },
    stripeCustomerId: { type: String, default: null, index: true },
    stripeSubscriptionId: { type: String, default: null, unique: true, sparse: true },
    stripePriceId: { type: String, default: null },
    trialEndsAt: { type: Date, default: null },
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type SubscriptionDocument = InferSchemaType<typeof SubscriptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Subscription: Model<SubscriptionDocument> =
  mongoose.models.Subscription ||
  mongoose.model<SubscriptionDocument>("Subscription", SubscriptionSchema);
