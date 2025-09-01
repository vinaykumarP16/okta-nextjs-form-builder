import React, { useState, useEffect } from "react";
import { useFormStore } from "@/lib/store";

export default function FieldConfigPanel() {
  const fields = useFormStore((s) => s.fields);
  const selectedFieldId = useFormStore((s) => s.selectedFieldId);
  const updateField = useFormStore((s) => s.updateField);
  const selectField = useFormStore((s) => s.selectField);

  const field = fields.find((f) => f.id === selectedFieldId);

  type FieldOption = {
    label: string;
    value: string;
  };

  type LocalField = {
    id: string;
    type: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: FieldOption[];
    [key: string]: unknown;
  };

  const [localField, setLocalField] = useState<LocalField>(
    (field as unknown as LocalField) || {
      id: "",
      type: "",
      label: "",
      placeholder: "",
      required: false,
      options: [],
    }
  );

  // Add validation state for the field
type Validation = {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    required?: boolean;
    minChecked?: number;
    maxChecked?: number;
    length?: number;
  };

  const [validation, setValidation] = useState<Validation>({});

  // Type guard to check if field has a validation property
  const hasValidationProperty = React.useCallback(
    (f: unknown): f is LocalField & { validation: Validation } => {
      return typeof f === "object" && f !== null && "validation" in f;
    },
    []
  );

  useEffect(() => {
    if (field && hasValidationProperty(field)) {
      setValidation(field.validation);
    } else {
      setValidation({});
    }
  }, [field, hasValidationProperty]);

  useEffect(() => {
    if (field) {
      setLocalField(field as unknown as LocalField);
    } else {
      setLocalField({
        id: "",
        type: "",
        label: "",
        placeholder: "",
        required: false,
        options: [],
      });
    }
  }, [field]);

  if (!field)
    return <div className="p-4 text-gray-400">Select a field to configure</div>;

  const handleChange = (key: string, value: string | number | boolean) => {
    setLocalField((prev: LocalField) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOptionChange = (
    idx: number,
    key: "label" | "value",
    value: string
  ) => {
    setLocalField((prev: LocalField) => ({
      ...prev,
      options: (prev.options ?? []).map((opt: FieldOption, i: number) =>
        i === idx ? { ...opt, [key]: value } : opt
      ),
    }));
  };

  const addOption = () => {
    setLocalField((prev: LocalField) => ({
      ...prev,
      options: [
        ...(prev.options || []),
        {
          label: `Option ${(prev.options?.length || 0) + 1}`,
          value: `option${(prev.options?.length || 0) + 1}`,
        },
      ],
    }));
  };

  const removeOption = (idx: number) => {
    setLocalField((prev: LocalField) => ({
      ...prev,
      options: (prev.options ?? []).filter(
        (_: FieldOption, i: number) => i !== idx
      ),
    }));
  };

  // Render validation fields based on type
  const renderValidationFields = () => {
    switch (field.type) {
      case "text":
      case undefined:
      case "textarea":
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1">Min Length</label>
              <input
                type="number"
                className="border px-2 py-1 rounded w-full"
                value={validation.minLength ?? ""}
                min={0}
                onChange={e =>
                  setValidation(v => ({
                    ...v,
                    minLength: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="Min characters"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1">Max Length</label>
              <input
                type="number"
                className="border px-2 py-1 rounded w-full"
                value={validation.maxLength ?? ""}
                min={0}
                onChange={e =>
                  setValidation(v => ({
                    ...v,
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
                placeholder="Max characters"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1">Pattern (Regex)</label>
              <input
                className="border px-2 py-1 rounded w-full"
                value={validation.pattern ?? ""}
                onChange={e =>
                  setValidation(v => ({
                    ...v,
                    pattern: e.target.value,
                  }))
                }
                placeholder="e.g. ^[A-Za-z]+$"
              />
            </div>
          </>
        );
      case "number":
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1">Min Value</label>
              <input
                type="number"
                className="border px-2 py-1 rounded w-full"
                value={validation.min ?? ""}
                onChange={e =>
                  setValidation(v => ({
                    ...v,
                    min: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="Min value"
              />
            </div>
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1">Max Value</label>
              <input
                type="number"
                className="border px-2 py-1 rounded w-full"
                value={validation.max ?? ""}
                onChange={e =>
                  setValidation(v => ({
                    ...v,
                    max: e.target.value ? parseFloat(e.target.value) : undefined,
                  }))
                }
                placeholder="Max value"
              />
            </div>
          </>
        );
      case "email":
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1">Pattern (Regex)</label>
            <input
              className="border px-2 py-1 rounded w-full"
              value={validation.pattern ?? ""}
              onChange={e =>
                setValidation(v => ({
                  ...v,
                  pattern: e.target.value,
                }))
              }
              placeholder="e.g. ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
            />
          </div>
        );
      case "select":
      case "radio":
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1">Must select an option</label>
            <input
              type="checkbox"
              checked={!!validation.required}
              onChange={e =>
                setValidation(v => ({
                  ...v,
                  required: e.target.checked,
                }))
              }
              className="w-4 h-4 accent-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
      case "checkbox":
        return (
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1">Min Checked</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-full"
              value={validation.minChecked ?? ""}
              min={0}
              onChange={e =>
                setValidation(v => ({
                  ...v,
                  minChecked: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
              placeholder="Min checked"
            />
            <label className="block text-xs font-semibold mb-1 mt-2">Max Checked</label>
            <input
              type="number"
              className="border px-2 py-1 rounded w-full"
              value={validation.maxChecked ?? ""}
              min={0}
              onChange={e =>
                setValidation(v => ({
                  ...v,
                  maxChecked: e.target.value ? parseInt(e.target.value) : undefined,
                }))
              }
              placeholder="Max checked"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const handleUpdate = () => {
    const updatedField = { ...localField, type: field.type, validation };
    if (
      field.type === "select" ||
      field.type === "radio" ||
      field.type === "checkbox"
    ) {
      updatedField.options = Array.isArray(localField.options)
        ? [...localField.options]
        : [];
    } else {
      delete updatedField.options;
    }
    updateField(field.id, updatedField);
    selectField(""); // Closing the FieldConfigPanel
  };

  console.log("localField.options", localField.options);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Field Configuration</h2>
      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1">Label</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={localField.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Field label"
        />
      </div>
      {/* Show placeholder for text fields */}
      {(field.type !== "radio" &&
        field.type !== "select" &&
        field.type !== "checkbox" &&
        field.type !== "OTP") && (
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1">Placeholder</label>
          <input
        className="border px-2 py-1 rounded w-full"
        value={localField.placeholder || ""}
        onChange={(e) => handleChange("placeholder", e.target.value)}
        placeholder="Placeholder"
          />
        </div>
      )}
      {/* Show required field option */}
      <div className="mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!localField.required}
          onChange={(e) => handleChange("required", e.target.checked)}
          id="required"
          className="w-4 h-4 accent-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="required" className="text-xs">
          Required
        </label>
      </div>
      {field.type === "OTP" && (
        <div className="mb-3">
          <label className="block text-xs font-semibold mb-1">OTP Length</label>
          <input
            type="number"
            className="border px-2 py-1 rounded w-full"
            value={6}
            onChange={(e) => handleChange("length", parseInt(e.target.value))}
            min={1}
            max={10}
          />
        </div>
      )}

      {/* Checkbox */}
      {field.type === "checkbox" && (
        <>
          <div className="font-semibold mb-2">Checkbox Options</div>
          {(localField.options || []).map((opt: FieldOption, idx: number) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input type="checkbox" disabled className="w-4 h-4" />
              <span className="text-xs text-gray-500 w-12">Label</span>
              <input
                className="border px-2 py-1 rounded bg-white text-black"
                value={opt.label}
                onChange={(e) =>
                  handleOptionChange(idx, "label", e.target.value)
                }
                placeholder="Label"
              />
              <span className="text-xs text-gray-500 w-12">Value</span>
              <input
                className="border px-2 py-1 rounded bg-white text-black"
                value={opt.value}
                onChange={(e) =>
                  handleOptionChange(idx, "value", e.target.value)
                }
                placeholder="Value"
              />
              <button
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                type="button"
                onClick={() => removeOption(idx)}
              >
                Delete
              </button>
            </div>
          ))}
          <button
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
            type="button"
            onClick={addOption}
          >
            Add Option
          </button>
        </>
      )}
      {/* ...existing select/radio options... */}
      {(field.type === "select" || field.type === "radio") && (
        <>
          <div className="font-semibold mb-2">Options</div>
          {(localField.options || []).map((opt: FieldOption, idx: number) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              {field.type === "radio" && (
                <input
                  type="radio"
                  disabled
                  className="w-4 h-4 accent-blue-600 border-gray-300"
                  style={{ minWidth: 16, minHeight: 16 }}
                />
              )}
              <span className="text-xs text-gray-500 w-12">Label</span>
              <input
                className="border px-2 py-1 rounded bg-white text-black"
                value={opt.label}
                onChange={(e) =>
                  handleOptionChange(idx, "label", e.target.value)
                }
                placeholder="Label"
                autoComplete="off"
              />
              <span className="text-xs text-gray-500 w-12">Value</span>
              <input
                className="border px-2 py-1 rounded bg-white text-black"
                value={opt.value}
                onChange={(e) =>
                  handleOptionChange(idx, "value", e.target.value)
                }
                placeholder="Value"
                autoComplete="off"
              />
              <button
                className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                type="button"
                onClick={() => removeOption(idx)}
              >
                Delete
              </button>
            </div>
          ))}
          <button
            className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
            type="button"
            onClick={addOption}
          >
            Add Option
          </button>
        </>
      )}
      {/* Validation Rules */}
      <div className="mb-4">
        <div className="font-semibold mb-2">Validation Rules</div>
        {renderValidationFields()}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded w-full"
        type="button"
        onClick={handleUpdate}
      >
        Update Field
      </button>
    </div>
  );
}
