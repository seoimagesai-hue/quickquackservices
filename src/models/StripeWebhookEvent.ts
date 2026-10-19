import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/** Idempotency store for Stripe webhook events */
const StripeWebhookEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export type StripeWebhookEventDocument = InferSchemaType<
  typeof StripeWebhookEventSchema
> & { _id: mongoose.Types.ObjectId };

export const StripeWebhookEvent: Model<StripeWebhookEventDocument> =
  mongoose.models.StripeWebhookEvent ||
  mongoose.model<StripeWebhookEventDocument>(
    "StripeWebhookEvent",
    StripeWebhookEventSchema
  );
