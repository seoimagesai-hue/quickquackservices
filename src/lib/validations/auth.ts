import { z } from "zod";

export const businessCategorySchema = z.enum([
  "salon",
  "barber",
  "plumbing",
  "hvac",
  "cleaning",
  "consulting",
  "repair",
  "other",
]);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
  businessName: z.string().trim().min(2).max(160),
  businessCategory: businessCategorySchema.default("other"),
  customCategory: z.string().trim().max(120).optional(),
  businessPhone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(100).optional(),
  timezone: z.string().min(1).max(64).default("UTC"),
  inviteToken: z.string().optional(),
});

export const bookingIntakeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(2000).optional(),
  holdToken: z.string().min(10),
  serviceAddress: z
    .object({
      line1: z.string().trim().max(200).optional(),
      line2: z.string().trim().max(200).optional(),
      city: z.string().trim().max(100).optional(),
      region: z.string().trim().max(100).optional(),
      postalCode: z.string().trim().max(30).optional(),
      country: z.string().trim().max(100).optional(),
      formatted: z.string().trim().max(500).optional(),
    })
    .optional(),
  problemDescription: z.string().trim().max(4000).optional(),
  intakeAnswers: z.record(z.string(), z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/)
    .regex(/[0-9]/),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  category: z
    .enum(["general", "billing", "technical", "abuse", "other"])
    .default("general"),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot
});

/** @deprecated use bookingIntakeSchema */
export const bookingCustomerSchema = bookingIntakeSchema;
