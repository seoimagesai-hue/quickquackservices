import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const FormFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "email",
        "phone",
        "number",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "date",
        "time",
        "address",
        "file",
        "instructions",
      ],
      required: true,
    },
    label: { type: String, required: true, maxlength: 200 },
    placeholder: { type: String, default: "", maxlength: 200 },
    helpText: { type: String, default: "", maxlength: 500 },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    sortOrder: { type: Number, default: 0 },
    /** Show only when another field equals this value */
    visibleWhen: {
      fieldId: { type: String, default: null },
      equals: { type: String, default: null },
    },
    validation: {
      minLength: { type: Number, default: null },
      maxLength: { type: Number, default: null },
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      pattern: { type: String, default: null },
    },
  },
  { _id: false }
);

const BookingFormSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 1000 },
    /** null = default form for all services without a specific form */
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      default: null,
      index: true,
    },
    isDefault: { type: Boolean, default: false },
    fields: { type: [FormFieldSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BookingFormSchema.index({ businessId: 1, isDefault: 1 });
BookingFormSchema.index({ businessId: 1, serviceId: 1 });

export type BookingFormDocument = InferSchemaType<typeof BookingFormSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BookingForm: Model<BookingFormDocument> =
  mongoose.models.BookingForm ||
  mongoose.model<BookingFormDocument>("BookingForm", BookingFormSchema);
