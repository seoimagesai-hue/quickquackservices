import {
  getCategoryPreset,
  type BusinessCategory,
  type IntakeFieldDef,
} from "@/config/business-categories";

export function categoryDefaults(category: BusinessCategory | string) {
  const preset = getCategoryPreset(category);
  return {
    category: preset.id,
    industry: preset.id,
    serviceMode: preset.serviceMode,
    requireStaffSelection: preset.requireStaffSelection,
    requireServiceAddress: preset.requireServiceAddress,
    travelBufferMinutes: preset.defaultTravelBufferMinutes,
    intakeFields: preset.intakeFields.map((f: IntakeFieldDef) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required,
      placeholder: f.placeholder || "",
      options: f.options || [],
      isAddress: Boolean(f.isAddress),
    })),
    bookingSettingsTravelBuffer: preset.defaultTravelBufferMinutes,
  };
}
