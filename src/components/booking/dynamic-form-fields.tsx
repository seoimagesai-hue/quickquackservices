"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isFieldVisible, type FormFieldDef } from "@/lib/booking/form-validation";

export type PublicFormField = FormFieldDef & {
  placeholder?: string;
  helpText?: string;
  sortOrder?: number;
};

export function DynamicFormFields({
  fields,
  answers,
  onChange,
  uploadsConfigured,
}: {
  fields: PublicFormField[];
  answers: Record<string, unknown>;
  onChange: (fieldId: string, value: unknown) => void;
  uploadsConfigured?: boolean;
}) {
  const sorted = useMemo(
    () => [...fields].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [fields]
  );

  return (
    <div className="space-y-4">
      {sorted.map((field) => {
        if (!isFieldVisible(field, answers)) return null;
        if (field.type === "instructions") {
          return (
            <p
              key={field.id}
              className="rounded-sm bg-white/5 p-3 text-sm text-muted-foreground"
            >
              {field.label}
              {field.helpText ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  {field.helpText}
                </span>
              ) : null}
            </p>
          );
        }

        const id = `form_${field.id}`;
        const help = field.helpText ? (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        ) : null;

        if (field.type === "textarea" || field.type === "address") {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </Label>
              <Textarea
                id={id}
                name={id}
                rows={field.type === "address" ? 3 : 3}
                required={field.required}
                placeholder={
                  field.placeholder ||
                  (field.type === "address"
                    ? "Street, city, region, postal code"
                    : undefined)
                }
                value={String(answers[field.id] ?? "")}
                onChange={(e) => onChange(field.id, e.target.value)}
              />
              {help}
            </div>
          );
        }

        if (field.type === "select") {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </Label>
              <select
                id={id}
                name={id}
                required={field.required}
                className="flex h-11 w-full rounded-xl border border-white/15 bg-white px-3 text-sm dark:border-white/15 bg-black"
                value={String(answers[field.id] ?? "")}
                onChange={(e) => onChange(field.id, e.target.value)}
              >
                <option value="" disabled>
                  Select…
                </option>
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {help}
            </div>
          );
        }

        if (field.type === "radio") {
          return (
            <fieldset key={field.id} className="space-y-2">
              <legend className="text-sm font-medium">
                {field.label}
                {field.required ? " *" : ""}
              </legend>
              <div className="space-y-2">
                {(field.options || []).map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <input
                      type="radio"
                      name={id}
                      value={opt}
                      required={field.required}
                      checked={String(answers[field.id] ?? "") === opt}
                      onChange={() => onChange(field.id, opt)}
                      className="size-4 accent-primary"
                    />
                    {opt}
                  </label>
                ))}
              </div>
              {help}
            </fieldset>
          );
        }

        if (field.type === "checkbox") {
          const selected = Array.isArray(answers[field.id])
            ? (answers[field.id] as string[])
            : [];
          return (
            <fieldset key={field.id} className="space-y-2">
              <legend className="text-sm font-medium">
                {field.label}
                {field.required ? " *" : ""}
              </legend>
              <div className="space-y-2">
                {(field.options || []).map((opt) => {
                  const checked = selected.includes(opt);
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2 text-sm text-white/70"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked
                            ? selected.filter((x) => x !== opt)
                            : [...selected, opt];
                          onChange(field.id, next);
                        }}
                        className="size-4 accent-primary"
                      />
                      {opt}
                    </label>
                  );
                })}
              </div>
              {help}
            </fieldset>
          );
        }

        if (field.type === "file") {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={id}>
                {field.label}
                {field.required ? " *" : ""}
              </Label>
              {uploadsConfigured ? (
                <Input id={id} name={id} type="file" disabled />
              ) : (
                <p className="rounded-sm border border-dashed border-white/20 p-3 text-xs text-muted-foreground">
                  File uploads are not configured for this workspace yet.
                  {field.required
                    ? " Please contact the business or remove the required file field."
                    : ""}
                </p>
              )}
              {help}
            </div>
          );
        }

        const inputType =
          field.type === "email"
            ? "email"
            : field.type === "phone"
              ? "tel"
              : field.type === "number"
                ? "number"
                : field.type === "date"
                  ? "date"
                  : field.type === "time"
                    ? "time"
                    : "text";

        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={id}>
              {field.label}
              {field.required ? " *" : ""}
            </Label>
            <Input
              id={id}
              name={id}
              type={inputType}
              required={field.required}
              placeholder={field.placeholder}
              value={String(answers[field.id] ?? "")}
              onChange={(e) =>
                onChange(
                  field.id,
                  field.type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value
                )
              }
            />
            {help}
          </div>
        );
      })}
    </div>
  );
}
