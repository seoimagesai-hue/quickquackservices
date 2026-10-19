import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const TokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["email_verification", "password_reset", "staff_invite"],
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
TokenSchema.index({ userId: 1, type: 1, usedAt: 1 });

export type TokenDocument = InferSchemaType<typeof TokenSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Token: Model<TokenDocument> =
  mongoose.models.Token || mongoose.model<TokenDocument>("Token", TokenSchema);
