import { z } from "zod";

export type FormFieldDef = {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: string[];
  validation?: {
    minLength?: number | null;
    maxLength?: number | null;
    min?: number | null;
    max?: number | null;
    pattern?: string | null;
  };
  visibleWhen?: { fieldId?: string | null; equals?: string | null } | null;
};

export function isFieldVisible(
  field: FormFieldDef,
  answers: Record<string, unknown>
): boolean {
  const rule = field.visibleWhen;
  if (!rule?.fieldId) return true;
  return String(answers[rule.fieldId] ?? "") === String(rule.equals ?? "");
}

/**
 * Validate submitted answers against a stored form schema (server-side).
 */
export function validateFormAnswers(
  fields: FormFieldDef[],
  answers: Record<string, unknown>
): { ok: true; cleaned: Record<string, unknown> } | { ok: false; error: string } {
  const cleaned: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.type === "instructions") continue;
    if (!isFieldVisible(field, answers)) continue;

    const raw = answers[field.id];
    const value =
      typeof raw === "string"
        ? raw.trim()
        : Array.isArray(raw)
          ? raw
          : raw == null
            ? ""
            : raw;

    if (field.required) {
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return { ok: false, error: `${field.label} is required.` };
      }
    }

    if (value === "" || value === null || value === undefined) {
      continue;
    }

    switch (field.type) {
      case "email": {
        const parsed = z.string().email().safeParse(value);
        if (!parsed.success) {
          return { ok: false, error: `${field.label} must be a valid email.` };
        }
        cleaned[field.id] = parsed.data;
        break;
      }
      case "phone": {
        const s = String(value);
        if (s.length < 5 || s.length > 40) {
          return { ok: false, error: `${field.label} looks invalid.` };
        }
        cleaned[field.id] = s;
        break;
      }
      case "number": {
        const n = Number(value);
        if (Number.isNaN(n)) {
          return { ok: false, error: `${field.label} must be a number.` };
        }
        if (field.validation?.min != null && n < field.validation.min) {
          return {
            ok: false,
            error: `${field.label} must be at least ${field.validation.min}.`,
          };
        }
        if (field.validation?.max != null && n > field.validation.max) {
          return {
            ok: false,
            error: `${field.label} must be at most ${field.validation.max}.`,
          };
        }
        cleaned[field.id] = n;
        break;
      }
      case "select":
      case "radio": {
        const opts = field.options || [];
        if (opts.length && !opts.includes(String(value))) {
          return { ok: false, error: `${field.label} has an invalid option.` };
        }
        cleaned[field.id] = String(value);
        break;
      }
      case "checkbox": {
        const arr = Array.isArray(value) ? value.map(String) : [String(value)];
        cleaned[field.id] = arr;
        break;
      }
      case "file": {
        // File metadata only — binary stored externally
        if (typeof value === "object" && value !== null) {
          cleaned[field.id] = value;
        } else {
          return { ok: false, error: `${field.label} upload is incomplete.` };
        }
        break;
      }
      default: {
        const s = String(value);
        const minL = field.validation?.minLength;
        const maxL = field.validation?.maxLength;
        if (minL != null && s.length < minL) {
          return {
            ok: false,
            error: `${field.label} must be at least ${minL} characters.`,
          };
        }
        if (maxL != null && s.length > maxL) {
          return {
            ok: false,
            error: `${field.label} must be at most ${maxL} characters.`,
          };
        }
        if (field.validation?.pattern) {
          try {
            const re = new RegExp(field.validation.pattern);
            if (!re.test(s)) {
              return { ok: false, error: `${field.label} format is invalid.` };
            }
          } catch {
            /* ignore bad pattern in stored schema */
          }
        }
        cleaned[field.id] = s;
      }
    }
  }

  return { ok: true, cleaned };
}

export function defaultFormFieldsForCategory(category?: string) {
  const fields: FormFieldDef[] = [
    {
      id: "notes",
      type: "textarea",
      label: "Notes",
      required: false,
    },
  ];
  if (
    category === "plumbing" ||
    category === "hvac" ||
    category === "cleaning" ||
    category === "repair"
  ) {
    return [
      {
        id: "serviceAddress",
        type: "address",
        label: "Service address",
        required: true,
      },
      {
        id: "problemDescription",
        type: "textarea",
        label: "Problem description",
        required: true,
      },
      ...fields,
    ] as FormFieldDef[];
  }
  return fields;
}
