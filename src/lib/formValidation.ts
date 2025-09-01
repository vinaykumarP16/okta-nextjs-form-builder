export type Field = {
  length?: number;
  required: unknown;
  value?: string | undefined;
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  options?: { label: string; value: string }[];
  fields?: Field[];
  collapsed?: boolean;
};

export function getFieldValidation(field: Field) {
  const rules: Record<string, unknown> = {};
  type Validation = {
    required?: boolean;
    minLength?: number | string;
    maxLength?: number | string;
    pattern?: string;
    min?: number | string;
    max?: number | string;
    minChecked?: number | string;
    maxChecked?: number | string;
    length?: number | string;
  };
  const validation: Validation = (field as { validation?: Validation }).validation || {};

  // Required
  if (field.required || validation.required) {
    rules.required = "This field is required";
  }

  // Text & Textarea
  if (field.type === "text" || field.type === undefined || field.type === "textarea") {
    if (validation.minLength !== undefined && validation.minLength !== null && validation.minLength !== "") {
      rules.minLength = {
        value: Number(validation.minLength),
        message: `Minimum length is ${validation.minLength}`,
      };
    }
    if (validation.maxLength !== undefined && validation.maxLength !== null && validation.maxLength !== "") {
      rules.maxLength = {
        value: Number(validation.maxLength),
        message: `Maximum length is ${validation.maxLength}`,
      };
    }
    if (validation.pattern) {
      rules.pattern = {
        value: new RegExp(validation.pattern),
        message: "Invalid format",
      };
    }
  }

  // Number
  if (field.type === "number") {
    rules.valueAsNumber = true;
    if (validation.min !== undefined && validation.min !== null && validation.min !== "") {
      rules.min = {
        value: Number(validation.min),
        message: `Minimum value is ${validation.min}`,
      };
    }
    if (validation.max !== undefined && validation.max !== null && validation.max !== "") {
      rules.max = {
        value: Number(validation.max),
        message: `Maximum value is ${validation.max}`,
      };
    }
  }

  // Email
  if (field.type === "email") {
    if (validation.pattern) {
      rules.pattern = {
        value: new RegExp(validation.pattern),
        message: "Invalid email address",
      };
    } else {
      rules.pattern = {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email address",
      };
    }
  }

  // Select & Radio
  if (field.type === "select" || field.type === "radio") {
    if (validation.required) {
      rules.required = "Please select an option";
    }
  }

  // Checkbox
  if (field.type === "checkbox") {
    if (validation.minChecked !== undefined && validation.minChecked !== null && validation.minChecked !== "") {
      rules.validate = (value: unknown[]) =>
        Array.isArray(value) && value.length >= Number(validation.minChecked)
          ? true
          : `Select at least ${validation.minChecked}`;
    }
    if (validation.maxChecked !== undefined && validation.maxChecked !== null && validation.maxChecked !== "") {
      const prevValidate = rules.validate;
      rules.validate = (value: unknown[]) => {
        if (prevValidate && typeof prevValidate === "function") {
          const minResult = prevValidate(value);
          if (minResult !== true) return minResult;
        }
        return Array.isArray(value) && value.length <= Number(validation.maxChecked)
          ? true
          : `Select at most ${validation.maxChecked}`;
      };
    }
  }

  // OTP
  if (field.type === "OTP") {
    if (validation.length) {
      rules.minLength = {
        value: Number(validation.length),
        message: `OTP must be ${validation.length} digits`,
      };
      rules.maxLength = {
        value: Number(validation.length),
        message: `OTP must be ${validation.length} digits`,
      };
    }
  }

  return rules;
}