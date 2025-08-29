import React, { useState, useEffect } from "react";
import { useFormStore } from "@/lib/store";

export default function FieldConfigPanel() {
  const fields = useFormStore((s) => s.fields);
  const selectedFieldId = useFormStore((s) => s.selectedFieldId);
  const updateField = useFormStore((s) => s.updateField);
  const selectField = useFormStore((s) => s.selectField);

  const field = fields.find((f) => f.id === selectedFieldId);

  // Define a type for field options
  type FieldOption = {
    label: string;
    value: string;
  };

  // Define a type for the local field state to avoid type conflicts
  type LocalField = {
    id: string;
    type: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: FieldOption[];
    [key: string]: unknown;
  };

  // Use a local state for editing, initialized from the selected field
  const [localField, setLocalField] = useState<LocalField>(
    (field as LocalField) || {
      id: "",
      type: "",
      label: "",
      placeholder: "",
      required: false,
      options: [],
    }
  );

  // Sync localField when the selected field changes
  useEffect(() => {
    if (field) {
      setLocalField(field as LocalField);
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

  // FIX: Always include the latest options in the update, and do not delete options for select/radio/checkbox
  const handleUpdate = () => {
    // Always include options for select/radio/checkbox fields, even if empty
    const updatedField = { ...localField, type: field.type };
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
    selectField(""); // Close the FieldConfigPanel
  };

  console.log("localField.options", localField.options);

  return (
    <div className="p-4">
      <div className="mb-3">
        <label className="block text-xs font-semibold mb-1">Label</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={localField.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Field label"
        />
      </div>
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

      {/* Checkbox: Show label/placeholder and also allow editing options */}
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
      {/* ...existing update button... */}
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
