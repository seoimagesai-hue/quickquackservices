import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const BookingFormSubmissionSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    formId: {
      type: Schema.Types.ObjectId,
      ref: "BookingForm",
      required: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
      index: true,
    },
    answers: { type: Schema.Types.Mixed, default: {} },
    /** Safe metadata for file fields: { fieldId: { key, name, size, contentType } } */
    files: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

BookingFormSubmissionSchema.index({ businessId: 1, createdAt: -1 });

export type BookingFormSubmissionDocument = InferSchemaType<
  typeof BookingFormSubmissionSchema
> & { _id: mongoose.Types.ObjectId };

export const BookingFormSubmission: Model<BookingFormSubmissionDocument> =
  mongoose.models.BookingFormSubmission ||
  mongoose.model<BookingFormSubmissionDocument>(
    "BookingFormSubmission",
    BookingFormSubmissionSchema
  );
