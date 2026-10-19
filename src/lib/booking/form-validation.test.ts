import { describe, expect, it } from "vitest";
import {
  isFieldVisible,
  validateFormAnswers,
  type FormFieldDef,
} from "./form-validation";

const fields: FormFieldDef[] = [
  { id: "email", type: "email", label: "Email", required: true },
  { id: "notes", type: "textarea", label: "Notes", required: false },
  {
    id: "urgency",
    type: "select",
    label: "Urgency",
    required: true,
    options: ["Low", "High"],
  },
  {
    id: "details",
    type: "textarea",
    label: "Extra details",
    required: true,
    visibleWhen: { fieldId: "urgency", equals: "High" },
  },
];

describe("validateFormAnswers", () => {
  it("rejects missing required fields", () => {
    const result = validateFormAnswers(fields, { email: "a@b.com" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Urgency/);
  });

  it("validates email and select options", () => {
    const result = validateFormAnswers(fields, {
      email: "not-an-email",
      urgency: "Low",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts valid answers and skips hidden conditional fields", () => {
    const result = validateFormAnswers(fields, {
      email: "a@b.com",
      urgency: "Low",
      notes: "hello",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cleaned.email).toBe("a@b.com");
      expect(result.cleaned.urgency).toBe("Low");
      expect(result.cleaned.details).toBeUndefined();
    }
  });

  it("requires conditional fields when visible", () => {
    const result = validateFormAnswers(fields, {
      email: "a@b.com",
      urgency: "High",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Extra details/);
  });
});

describe("isFieldVisible", () => {
  it("defaults to visible without rule", () => {
    expect(isFieldVisible(fields[0]!, {})).toBe(true);
  });
});
