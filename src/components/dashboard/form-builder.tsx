"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  ensureDefaultBookingFormAction,
  listBookingFormsAction,
  saveBookingFormAction,
} from "@/lib/actions/booking-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type Field = {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required?: boolean;
  options?: string[];
  sortOrder?: number;
};

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "address", label: "Address" },
  { value: "file", label: "File upload" },
  { value: "instructions", label: "Instructions" },
];

export function FormBuilder() {
  const [formId, setFormId] = useState<string | undefined>();
  const [name, setName] = useState("Default booking form");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await ensureDefaultBookingFormAction();
      const res = await listBookingFormsAction();
      if (cancelled || !res.ok || !res.data) return;
      const forms = res.data.forms as Array<{
        _id: string;
        name: string;
        description?: string;
        isDefault?: boolean;
        fields?: Field[];
      }>;
      const def =
        forms.find((f) => f.isDefault) || forms[0];
      if (def) {
        setFormId(def._id);
        setName(def.name);
        setDescription(def.description || "");
        setFields(
          (def.fields || []).map((f, i) => ({
            ...f,
            sortOrder: f.sortOrder ?? i,
          }))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function addField(type: string) {
    setFields((prev) => [
      ...prev,
      {
        id: nanoid(8),
        type,
        label:
          FIELD_TYPES.find((t) => t.value === type)?.label || "Field",
        required: false,
        placeholder: "",
        options:
          type === "select" || type === "radio" || type === "checkbox"
            ? ["Option 1", "Option 2"]
            : [],
        sortOrder: prev.length,
      },
    ]);
  }

  function updateField(id: string, patch: Partial<Field>) {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  }

  function removeField(id: string) {
    setFields((prev) => prev.filter((f) => f.id !== id));
  }

  function move(id: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[idx]!;
      copy[idx] = copy[next]!;
      copy[next] = tmp;
      return copy.map((f, i) => ({ ...f, sortOrder: i }));
    });
  }

  async function save() {
    setPending(true);
    const result = await saveBookingFormAction({
      id: formId,
      name,
      description,
      isDefault: true,
      fields,
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (result.data?.id) setFormId(result.data.id);
    toast.success("Booking form saved");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Booking form builder</h1>
          <p className="text-sm text-muted-foreground">
            Customize questions customers answer when booking. Changes save to
            MongoDB and render on your public page.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreview((v) => !v)}>
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save form"}
          </Button>
        </div>
      </div>

      {!preview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {FIELD_TYPES.map((t) => (
              <Button
                key={t.value}
                size="sm"
                variant="outline"
                onClick={() => addField(t.value)}
              >
                <Plus className="size-3.5" /> {t.label}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="space-y-3 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GripVertical className="size-4" />
                      <Badge variant="outline">{field.type}</Badge>
                      <span>#{index + 1}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => move(field.id, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => move(field.id, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) =>
                          updateField(field.id, { label: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  {(field.type === "select" ||
                    field.type === "radio" ||
                    field.type === "checkbox") && (
                    <div className="space-y-2">
                      <Label>Options (one per line)</Label>
                      <Textarea
                        rows={3}
                        value={(field.options || []).join("\n")}
                        onChange={(e) =>
                          updateField(field.id, {
                            options: e.target.value
                              .split("\n")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </div>
                  )}
                  {field.type === "file" && (
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      File uploads require object storage env vars
                      (S3/R2). Until configured, the public form shows this
                      field as unavailable.
                    </p>
                  )}
                  {field.type !== "instructions" && (
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={Boolean(field.required)}
                        onCheckedChange={(v) =>
                          updateField(field.id, { required: v })
                        }
                      />
                      Required
                    </label>
                  )}
                </CardContent>
              </Card>
            ))}
            {!fields.length && (
              <p className="text-sm text-muted-foreground">
                No fields yet — add fields above.
              </p>
            )}
          </div>
        </>
      )}

      {preview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                {field.type === "textarea" || field.type === "address" ? (
                  <Textarea placeholder={field.placeholder} disabled />
                ) : field.type === "select" ? (
                  <select
                    disabled
                    className="flex h-11 w-full rounded-xl border px-3 text-sm"
                  >
                    {(field.options || []).map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : field.type === "instructions" ? (
                  <p className="text-sm text-muted-foreground">{field.helpText || field.label}</p>
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    disabled
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "email"
                          ? "email"
                          : field.type === "date"
                            ? "date"
                            : field.type === "time"
                              ? "time"
                              : "text"
                    }
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
