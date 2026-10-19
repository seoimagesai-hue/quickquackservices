import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      default: null,
      index: true,
    },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ businessId: 1, createdAt: -1 });

export type AuditLogDocument = InferSchemaType<typeof AuditLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AuditLog: Model<AuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<AuditLogDocument>("AuditLog", AuditLogSchema);
