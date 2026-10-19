import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { PlatformRole } from "@/types";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    emailVerified: { type: Date, default: null },
    passwordHash: { type: String, select: false },
    image: { type: String, default: null },
    platformRole: {
      type: String,
      enum: ["platform_admin", "user"] satisfies PlatformRole[],
      default: "user",
    },
    phone: { type: String, default: null },
    timezone: { type: String, default: "UTC" },
    status: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
    },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);
