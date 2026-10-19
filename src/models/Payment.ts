import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const PaymentSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },
    type: {
      type: String,
      enum: ["subscription", "deposit", "full_payment", "refund"],
      required: true,
    },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded", "canceled"],
      default: "pending",
      index: true,
    },
    stripeCheckoutSessionId: { type: String, default: null, index: true },
    stripePaymentIntentId: { type: String, default: null, index: true },
    stripeInvoiceId: { type: String, default: null },
    stripeEventId: { type: String, default: null, unique: true, sparse: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PaymentSchema.index({ businessId: 1, createdAt: -1 });

export type PaymentDocument = InferSchemaType<typeof PaymentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Payment: Model<PaymentDocument> =
  mongoose.models.Payment ||
  mongoose.model<PaymentDocument>("Payment", PaymentSchema);
