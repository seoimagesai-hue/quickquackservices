"use server";

import { z } from "zod";
import { nanoid } from "nanoid";
import { connectDB } from "@/lib/db";
import { BookingForm, AuditLog } from "@/models";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { requireBusinessAccess } from "@/lib/auth/permissions";
import { defaultFormFieldsForCategory } from "@/lib/booking/form-validation";

const fieldSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum([
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
  ]),
  label: z.string().trim().min(1).max(200),
  placeholder: z.string().max(200).optional(),
  helpText: z.string().max(500).optional(),
  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
  visibleWhen: z
    .object({
      fieldId: z.string().nullable().optional(),
      equals: z.string().nullable().optional(),
    })
    .optional(),
  validation: z
    .object({
      minLength: z.number().nullable().optional(),
      maxLength: z.number().nullable().optional(),
      min: z.number().nullable().optional(),
      max: z.number().nullable().optional(),
      pattern: z.string().nullable().optional(),
    })
    .optional(),
});

export async function listBookingFormsAction(): Promise<
  ActionResult<{ forms: unknown[] }>
> {
  try {
    const { businessId } = await resolveTenantContext();
    await connectDB();
    const forms = await BookingForm.find({ businessId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean();
    return {
      ok: true,
      data: {
        forms: forms.map((f) => ({
          ...f,
          _id: String(f._id),
          businessId: String(f.businessId),
          serviceId: f.serviceId ? String(f.serviceId) : null,
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function ensureDefaultBookingFormAction(): Promise<
  ActionResult<{ formId: string }>
> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageSettings",
    });
    await connectDB();
    let form = await BookingForm.findOne({ businessId, isDefault: true });
    if (!form) {
      const { Business } = await import("@/models");
      const business = await Business.findById(businessId).lean();
      const fields = defaultFormFieldsForCategory(business?.category).map(
        (f, i) => ({
          ...f,
          id: f.id || nanoid(8),
          sortOrder: i,
          placeholder: "",
          helpText: "",
          options: [],
        })
      );
      form = await BookingForm.create({
        businessId,
        name: "Default booking form",
        isDefault: true,
        fields,
      });
    }
    return { ok: true, data: { formId: String(form._id) } };
  } catch (e) {
    return actionError(e);
  }
}

export async function saveBookingFormAction(
  raw: unknown
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageSettings",
    });

    const schema = z.object({
      id: z.string().optional(),
      name: z.string().trim().min(1).max(120),
      description: z.string().max(1000).optional(),
      serviceId: z.string().nullable().optional(),
      isDefault: z.boolean().optional(),
      fields: z.array(fieldSchema).max(50),
      isActive: z.boolean().optional(),
    });
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message || "Invalid" };
    }

    await connectDB();
    const payload = {
      name: parsed.data.name,
      description: parsed.data.description || "",
      serviceId: parsed.data.serviceId || null,
      isDefault: Boolean(parsed.data.isDefault),
      fields: parsed.data.fields.map((f, i) => ({
        ...f,
        sortOrder: f.sortOrder ?? i,
      })),
      isActive: parsed.data.isActive ?? true,
    };

    if (payload.isDefault) {
      await BookingForm.updateMany(
        { businessId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    let id = parsed.data.id;
    if (id) {
      const updated = await BookingForm.findOneAndUpdate(
        { _id: id, businessId },
        { $set: payload },
        { new: true }
      );
      if (!updated) return { ok: false, error: "Form not found" };
      id = String(updated._id);
    } else {
      const created = await BookingForm.create({
        businessId,
        ...payload,
      });
      id = String(created._id);
    }

    await AuditLog.create({
      actorUserId: user.id,
      businessId,
      action: "booking_form.save",
      resourceType: "BookingForm",
      resourceId: id,
    });

    return { ok: true, data: { id } };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteBookingFormAction(
  id: string
): Promise<ActionResult> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageSettings",
    });
    await connectDB();
    const form = await BookingForm.findOne({ _id: id, businessId });
    if (!form) return { ok: false, error: "Form not found" };
    if (form.isDefault) {
      return { ok: false, error: "Cannot delete the default form." };
    }
    form.isActive = false;
    await form.save();
    return { ok: true, message: "Form archived" };
  } catch (e) {
    return actionError(e);
  }
}

export async function getBookingFormForServiceAction(
  serviceId?: string | null
): Promise<ActionResult<{ form: unknown | null }>> {
  try {
    const { businessId } = await resolveTenantContext();
    await connectDB();
    let form = null;
    if (serviceId) {
      form = await BookingForm.findOne({
        businessId,
        serviceId,
        isActive: true,
      }).lean();
    }
    if (!form) {
      form = await BookingForm.findOne({
        businessId,
        isDefault: true,
        isActive: true,
      }).lean();
    }
    return {
      ok: true,
      data: {
        form: form
          ? {
              ...form,
              _id: String(form._id),
              businessId: String(form.businessId),
            }
          : null,
      },
    };
  } catch (e) {
    return actionError(e);
  }
}
