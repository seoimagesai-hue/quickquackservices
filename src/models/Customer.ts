import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const CustomerSchema = new Schema(
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
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, default: "" },
    notes: { type: String, default: "", maxlength: 5000 },
    tags: [{ type: String }],
    marketingOptIn: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CustomerSchema.index(
  { businessId: 1, email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);
CustomerSchema.index({ businessId: 1, name: "text", email: "text" });

export type CustomerDocument = InferSchemaType<typeof CustomerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Customer: Model<CustomerDocument> =
  mongoose.models.Customer ||
  mongoose.model<CustomerDocument>("Customer", CustomerSchema);
