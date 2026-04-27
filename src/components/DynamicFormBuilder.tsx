"use client";

import { useEffect, useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";

export type ConditionOperator = "equals" | "not_equals" | "in";
export type ConditionLogic = "AND" | "OR";
export type DynamicFieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox";

export type Condition = {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | Array<string | number | boolean>;
};

export type DynamicField = {
  id: string;
  type: DynamicFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  conditions?: Condition[];
  conditionType?: ConditionLogic;
};

export type DynamicFormSchema = {
  fields: DynamicField[];
};

type DynamicFormBuilderProps = {
  initialSchema?: DynamicFormSchema;
  onSchemaChange?: (schema: DynamicFormSchema) => void;
  onCreateForm?: (schema: DynamicFormSchema) => void;
};

const createFieldId = () => `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const emptyField = (): DynamicField => ({
  id: createFieldId(),
  type: "text",
  label: "",
  placeholder: "",
  required: false,
  options: [],
  conditions: [],
  conditionType: "AND",
});

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const generateFieldIdFromLabel = (label: string, fallbackId: string) => {
  const slug = toSlug(label);
  return slug ? `field_${slug}` : fallbackId;
};

const parseConditionValue = (
  rawValue: string,
  type: DynamicFieldType
): string | number | boolean => {
  if (type === "number") {
    const num = Number(rawValue);
    return Number.isNaN(num) ? rawValue : num;
  }
  if (type === "checkbox") {
    return rawValue === "true";
  }
  return rawValue;
};

const evaluateSingleCondition = (
  condition: Condition,
  formData: Record<string, unknown>
): boolean => {
  const fieldValue = formData[condition.field];

  switch (condition.operator) {
    case "equals":
      return fieldValue === condition.value;
    case "not_equals":
      return fieldValue !== condition.value;
    case "in":
      return Array.isArray(condition.value)
        ? condition.value.includes(fieldValue as never)
        : false;
    default:
      return false;
  }
};

export const evaluateConditions = (
  field: DynamicField,
  formData: Record<string, unknown>
): boolean => {
  if (!field.conditions || field.conditions.length === 0) return true;

  const logic = field.conditionType ?? "AND";

  if (logic === "OR") {
    return field.conditions.some((condition) => evaluateSingleCondition(condition, formData));
  }

  return field.conditions.every((condition) => evaluateSingleCondition(condition, formData));
};

export default function DynamicFormBuilder({
  initialSchema,
  onSchemaChange,
  onCreateForm,
}: DynamicFormBuilderProps) {
  const [schema, setSchema] = useState<DynamicFormSchema>(initialSchema ?? { fields: [emptyField()] });
  const [createError, setCreateError] = useState<string>("");

  const needsOptions = (field: DynamicField) => field.type === "select" || field.type === "radio";
  const hasEnoughOptions = (field: DynamicField) =>
    !needsOptions(field) || (field.options ?? []).filter(Boolean).length >= 2;

  useEffect(() => {
    onSchemaChange?.(schema);
  }, [onSchemaChange, schema]);

  const updateField = (fieldId: string, updates: Partial<DynamicField>) => {
    setSchema((previous) => ({
      fields: previous.fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              ...updates,
            }
          : field
      ),
    }));
  };

  const renameFieldId = (oldId: string, newId: string) => {
    if (!newId || oldId === newId) return;
    if (schema.fields.some((field) => field.id === newId)) return;

    setSchema((previous) => ({
      fields: previous.fields.map((field) => {
        if (field.id === oldId) {
          return { ...field, id: newId };
        }

        if (!field.conditions?.length) return field;

        return {
          ...field,
          conditions: field.conditions.map((condition) =>
            condition.field === oldId ? { ...condition, field: newId } : condition
          ),
        };
      }),
    }));
  };

  const addField = () => {
    setSchema((previous) => ({
      fields: [...previous.fields, emptyField()],
    }));
  };

  const removeField = (fieldId: string) => {
    setSchema((previous) => ({
      fields: previous.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const addCondition = (fieldId: string) => {
    const fallbackField = schema.fields.find((f) => f.id !== fieldId);
    const condition: Condition = {
      field: fallbackField?.id ?? "",
      operator: "equals",
      value: "",
    };

    setSchema((previous) => ({
      fields: previous.fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              conditions: [...(field.conditions ?? []), condition],
            }
          : field
      ),
    }));
  };

  const updateCondition = (
    fieldId: string,
    conditionIndex: number,
    updates: Partial<Condition>
  ) => {
    setSchema((previous) => ({
      fields: previous.fields.map((field) => {
        if (field.id !== fieldId) return field;
        const conditions = [...(field.conditions ?? [])];
        conditions[conditionIndex] = { ...conditions[conditionIndex], ...updates };
        return { ...field, conditions };
      }),
    }));
  };

  const removeCondition = (fieldId: string, conditionIndex: number) => {
    setSchema((previous) => ({
      fields: previous.fields.map((field) =>
        field.id === fieldId
          ? {
              ...field,
              conditions: (field.conditions ?? []).filter((_, idx) => idx !== conditionIndex),
            }
          : field
      ),
    }));
  };

  const fieldTypes: DynamicFieldType[] = [
    "text",
    "textarea",
    "email",
    "number",
    "date",
    "select",
    "radio",
    "checkbox",
  ];
  const isSchemaComplete =
    schema.fields.length > 0 &&
    schema.fields.every((field) => field.label.trim()) &&
    schema.fields.every((field) => !needsOptions(field) || hasEnoughOptions(field));

  const handleCreateForm = () => {
    if (schema.fields.length === 0) {
      setCreateError("Add at least one field before creating the form.");
      return;
    }

    const hasUntitledField = schema.fields.some((field) => !field.label.trim());
    if (hasUntitledField) {
      setCreateError("Every field must have a label.");
      return;
    }

    const hasInvalidOptions = schema.fields.some(
      (field) => needsOptions(field) && !hasEnoughOptions(field)
    );
    if (hasInvalidOptions) {
      setCreateError("Select/Radio fields must have at least 2 options.");
      return;
    }

    setCreateError("");
    onCreateForm?.(schema);
  };

  return (
    <section className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text">Form Builder</h3>
          <p className="text-xs text-text/60">Compact admin schema editor (field IDs are hidden)</p>
        </div>
        <button
          type="button"
          onClick={addField}
          className="h-8 px-3 text-xs bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Add Field
        </button>
      </div>

      <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
        {schema.fields.map((field, index) => (
          <article key={field.id} className="border border-border rounded-md p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text/70">Field {index + 1}</p>
              <button
                type="button"
                onClick={() => removeField(field.id)}
                className="text-[11px] px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <input
                value={field.label}
                onChange={(e) => {
                  updateField(field.id, { label: e.target.value });
                }}
                onBlur={(e) => {
                  const newLabel = e.target.value;
                  if (!newLabel.trim()) return;
                  const nextId = generateFieldIdFromLabel(newLabel, field.id);
                  renameFieldId(field.id, nextId);
                }}
                placeholder="Field label"
                className="h-9 md:col-span-6 px-2.5 rounded-md bg-bg border border-border text-xs"
              />
              <CustomSelect
                options={fieldTypes.map((type) => ({ value: type, label: type }))}
                value={field.type}
                onChange={(value) => updateField(field.id, { type: value as DynamicFieldType })}
                className="!w-full md:col-span-3"
              />
              <label className="h-9 md:col-span-3 px-2 rounded-md border border-border bg-bg text-xs flex items-center gap-2 text-text/80">
                <input
                  type="checkbox"
                  checked={Boolean(field.required)}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
                Required
              </label>
            </div>

            <input
              value={field.placeholder ?? ""}
              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
              placeholder="Placeholder (optional)"
              className="h-9 px-2.5 rounded-md bg-bg border border-border text-xs w-full"
            />

            {(field.type === "select" || field.type === "radio") && (
              <div className="space-y-1">
                <input
                  value={(field.options ?? []).join(", ")}
                  onChange={(e) =>
                    updateField(field.id, {
                      options: e.target.value
                        .split(",")
                        .map((opt) => opt.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Options (comma separated): Option 1, Option 2"
                  className={`h-9 px-2.5 rounded-md bg-bg border text-xs w-full ${
                    hasEnoughOptions(field) ? "border-border" : "border-red-300"
                  }`}
                />
                <p className="text-[11px] text-text/60">
                  Use comma to separate options. Example:{" "}
                  <span className="font-medium">Male, Female</span> or{" "}
                  <span className="font-medium">Yes, No</span>.
                </p>
                {!hasEnoughOptions(field) && (
                  <p className="text-[11px] text-red-600">
                    Add at least 2 options for {field.type} fields.
                  </p>
                )}
              </div>
            )}

            {field.type === "checkbox" && (
              <div className="space-y-1">
                <p className="text-[11px] text-text/60">
                  Checkbox uses the placeholder as helper text shown beside the box. Example:{" "}
                  <span className="font-medium">I agree to the terms and conditions</span>.
                </p>
              </div>
            )}

            <div className="border border-dashed border-border rounded-md p-2 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-text/70">Visibility Conditions</p>
                <button
                  type="button"
                  onClick={() => addCondition(field.id)}
                  className="text-[11px] px-2 py-1 rounded bg-muted/40 hover:bg-muted/60"
                >
                  Add
                </button>
              </div>

              {(field.conditions ?? []).length > 1 && (
                <CustomSelect
                  options={[
                    { value: "AND", label: "Match all (AND)" },
                    { value: "OR", label: "Match any (OR)" },
                  ]}
                  value={field.conditionType ?? "AND"}
                  onChange={(value) => updateField(field.id, { conditionType: value as ConditionLogic })}
                  className="!w-full max-w-[220px]"
                />
              )}

              {(field.conditions ?? []).map((condition, conditionIndex) => {
                const targetField = schema.fields.find((f) => f.id === condition.field);
                const targetType = targetField?.type ?? "text";

                return (
                  <div key={`${field.id}_${conditionIndex}`} className="grid grid-cols-1 md:grid-cols-12 gap-1.5">
                    <CustomSelect
                      options={[
                        { value: "", label: "Field" },
                        ...schema.fields
                          .filter((candidate) => candidate.id !== field.id)
                          .map((candidate) => ({
                            value: candidate.id,
                            label: candidate.label || "Untitled field",
                          })),
                      ]}
                      value={condition.field}
                      onChange={(value) => updateCondition(field.id, conditionIndex, { field: value })}
                      className="!w-full md:col-span-4"
                    />

                    <CustomSelect
                      options={[
                        { value: "equals", label: "equals" },
                        { value: "not_equals", label: "not_equals" },
                        { value: "in", label: "in" },
                      ]}
                      value={condition.operator}
                      onChange={(value) =>
                        updateCondition(field.id, conditionIndex, {
                          operator: value as ConditionOperator,
                          value: value === "in" ? [] : "",
                        })
                      }
                      className="!w-full md:col-span-3"
                    />

                    <input
                      value={
                        Array.isArray(condition.value)
                          ? condition.value.join(",")
                          : String(condition.value ?? "")
                      }
                      onChange={(e) => {
                        if (condition.operator === "in") {
                          updateCondition(field.id, conditionIndex, {
                            value: e.target.value
                              .split(",")
                              .map((v) => parseConditionValue(v.trim(), targetType)),
                          });
                          return;
                        }
                        updateCondition(field.id, conditionIndex, {
                          value: parseConditionValue(e.target.value, targetType),
                        });
                      }}
                      placeholder={condition.operator === "in" ? "a,b,c" : "value"}
                      className="h-8 md:col-span-4 px-2 rounded-md bg-bg border border-border text-[11px]"
                    />

                    <button
                      type="button"
                      onClick={() => removeCondition(field.id, conditionIndex)}
                      className="h-8 md:col-span-1 px-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 text-[11px]"
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        {createError && <p className="text-xs text-red-600">{createError}</p>}
        <button
          type="button"
          onClick={handleCreateForm}
          disabled={!isSchemaComplete}
          className="h-9 px-4 text-xs bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Form
        </button>
      </div>
    </section>
  );
}
