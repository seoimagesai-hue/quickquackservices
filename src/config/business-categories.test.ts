import { describe, expect, it } from "vitest";
import {
  getCategoryPreset,
  categoryPresets,
  BUSINESS_CATEGORIES,
} from "./business-categories";

describe("business categories", () => {
  it("defines all client categories", () => {
    expect(BUSINESS_CATEGORIES).toEqual([
      "salon",
      "barber",
      "plumbing",
      "hvac",
      "cleaning",
      "consulting",
      "repair",
      "other",
    ]);
  });

  it("salon is in-location with staff selection", () => {
    const salon = getCategoryPreset("salon");
    expect(salon.serviceMode).toBe("in_location");
    expect(salon.requireStaffSelection).toBe(true);
    expect(salon.requireServiceAddress).toBe(false);
  });

  it("plumbing and hvac require on-site address intake", () => {
    for (const id of ["plumbing", "hvac"] as const) {
      const preset = categoryPresets[id];
      expect(preset.serviceMode).toBe("on_site");
      expect(preset.requireServiceAddress).toBe(true);
      expect(
        preset.intakeFields.some((f) => f.isAddress || f.key === "serviceAddress")
      ).toBe(true);
    }
  });

  it("falls back to other for unknown categories", () => {
    expect(getCategoryPreset("unknown").id).toBe("other");
  });
});
