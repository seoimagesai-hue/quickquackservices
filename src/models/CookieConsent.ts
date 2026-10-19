import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CookieConsentSchema = new Schema(
  {
    visitorId: { type: String, required: true, index: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    necessary: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null },
    policyVersion: { type: String, default: "1.0" },
  },
  { timestamps: true }
);

CookieConsentSchema.index({ visitorId: 1, createdAt: -1 });

export type CookieConsentDocument = InferSchemaType<
  typeof CookieConsentSchema
> & { _id: mongoose.Types.ObjectId };

export const CookieConsent: Model<CookieConsentDocument> =
  mongoose.models.CookieConsent ||
  mongoose.model<CookieConsentDocument>("CookieConsent", CookieConsentSchema);
