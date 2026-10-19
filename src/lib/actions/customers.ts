"use server";

import { connectDB } from "@/lib/db";
import { Appointment, Customer } from "@/models";
import {
  actionError,
  resolveTenantContext,
  type ActionResult,
} from "@/lib/actions/action-utils";
import { requireBusinessAccess } from "@/lib/auth/permissions";

export async function listCustomersAction(params?: {
  q?: string;
  page?: number;
}): Promise<ActionResult<{ items: unknown[]; total: number }>> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageCustomers",
    });
    await connectDB();
    const page = Math.max(1, params?.page || 1);
    const limit = 30;
    const filter: Record<string, unknown> = {
      businessId,
      deletedAt: null,
    };
    if (params?.q?.trim()) {
      filter.$or = [
        { name: { $regex: params.q.trim(), $options: "i" } },
        { email: { $regex: params.q.trim(), $options: "i" } },
      ];
    }
    const [items, total] = await Promise.all([
      Customer.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);
    return {
      ok: true,
      data: {
        total,
        items: items.map((c) => ({
          ...c,
          _id: String(c._id),
          businessId: String(c.businessId),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function exportCustomersAction(): Promise<
  ActionResult<{ json: string }>
> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageCustomers",
    });
    await connectDB();
    const customers = await Customer.find({
      businessId,
      deletedAt: null,
    })
      .select("name email phone notes createdAt")
      .lean();
    return {
      ok: true,
      data: { json: JSON.stringify(customers, null, 2) },
    };
  } catch (e) {
    return actionError(e);
  }
}

export async function deleteCustomerAction(id: string): Promise<ActionResult> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageCustomers",
    });
    await connectDB();
    const customer = await Customer.findOne({ _id: id, businessId });
    if (!customer) return { ok: false, error: "Not found" };
    customer.deletedAt = new Date();
    await customer.save();
    return { ok: true, message: "Customer marked deleted" };
  } catch (e) {
    return actionError(e);
  }
}

export async function customerHistoryAction(
  id: string
): Promise<ActionResult<{ appointments: unknown[] }>> {
  try {
    const { user, businessId } = await resolveTenantContext();
    await requireBusinessAccess(user, businessId, {
      permission: "manageCustomers",
    });
    await connectDB();
    const appointments = await Appointment.find({
      businessId,
      customerId: id,
    })
      .sort({ startAt: -1 })
      .limit(50)
      .populate("serviceId", "name")
      .lean();
    return {
      ok: true,
      data: {
        appointments: appointments.map((a) => ({
          ...a,
          _id: String(a._id),
        })),
      },
    };
  } catch (e) {
    return actionError(e);
  }
}
