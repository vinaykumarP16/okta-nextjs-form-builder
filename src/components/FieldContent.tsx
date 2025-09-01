import React from "react";
import { Controller, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { getFieldValidation } from "@/lib/formValidation";

type Field = {
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

export function FieldContent({
  field,
  preview,
  register,
  errors,
  control,
}: {
  field: Field;
  preview?: boolean;
  register?: ReturnType<typeof useForm>["register"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: Record<string, any>;
  control?: ReturnType<typeof useForm>["control"];
}) {
  // Detect dark mode for each field (ensures correct theme on drag/preview)
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const updateDark = () => {
      setIsDark(
        document.documentElement.classList.contains("dark") ||
        document.body.classList.contains("dark")
      );
    };
    updateDark();
    const observer = new MutationObserver(updateDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* Text Input */}
      {(!field.type || field.type === "text") && (
        <>
          <Input
            id={`field-${field.id}`}
            placeholder={field.placeholder || ""}
            aria-label={field.label}
            className={cn(
              "border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition",
              isDark
                ? "border-neutral-700 bg-neutral-900 text-white"
                : "border-gray-300 bg-gray-50 text-gray-900",
              errors?.[field.id] ? "border-red-500" : ""
            )}
            disabled={!preview ? false : undefined}
            {...(preview
              ? register?.(field.id, getFieldValidation(field))
              : {})}
          />
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </>
      )}
      {/* Text Area */}
      {field.type === "textarea" && (
        <>
          <Textarea
            id={`field-${field.id}`}
            placeholder={field.placeholder || ""}
            aria-label={field.label}
            className={cn(
              "border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition",
              isDark
                ? "border-neutral-700 bg-neutral-900 text-white"
                : "border-gray-300 bg-gray-50 text-gray-900",
              errors?.[field.id] ? "border-red-500" : ""
            )}
            rows={3}
            disabled={!preview ? false : undefined}
            {...(preview
              ? register?.(field.id, getFieldValidation(field))
              : {})}
          />
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </>
      )}
      {/* Select Dropdown */}
      {field.type === "select" && (
        <div className="flex flex-col gap-2 w-full">
          <Controller
            name={field.id}
            control={control}
            rules={getFieldValidation(field)}
            render={({ field: controllerField }) => (
              <Select
                value={controllerField.value}
                onValueChange={controllerField.onChange}
              >
                <SelectTrigger className={cn(
                  "w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition",
                  isDark
                    ? "border-neutral-700 bg-neutral-900 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-900"
                )}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt, idx) => (
                    <SelectItem key={idx} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </div>
      )}
      {/* Checkbox */}
      {field.type === "checkbox" && (
        <>
          <div
            className="flex flex-col flex-1 gap-1"
            role="group"
            aria-label={field.label}
          >
            {(field.options && field.options.length > 0
              ? field.options
              : [{ label: "Option 1", value: "option1" }]
            ).map((opt, idx) => (
              <label
                key={idx}
                className={cn(
                  "inline-flex items-center mb-1 gap-2",
                  isDark ? "text-gray-200" : "text-gray-700"
                )}
              >
                <Checkbox
                  id={`${field.id}-${opt.value}`}
                  value={opt.value}
                  className={cn(
                    "border",
                    isDark ? "border-neutral-700" : "border-gray-300"
                  )}
                  disabled={!preview ? false : undefined}
                  {...(preview
                    ? register?.(field.id, getFieldValidation(field))
                    : {})}
                />
                {opt.label}
              </label>
            ))}
          </div>
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </>
      )}
      {/* Radio Group */}
      {field.type === "radio" &&
        field.options &&
        field.options.length > 0 && (
          <>
            {preview && control ? (
              <Controller
                name={field.id}
                control={control}
                rules={getFieldValidation(field)}
                render={({ field: controllerField }) => (
                  <RadioGroup
                    value={controllerField.value}
                    onValueChange={controllerField.onChange}
                    className="flex flex-col flex-1 gap-1"
                    aria-label={field.label}
                  >
                    {field.options?.map((opt, idx) => (
                      <label
                        key={idx}
                        htmlFor={`${field.id}-${opt.value}`}
                        className={cn(
                          "inline-flex items-center mb-1 gap-2",
                          isDark ? "text-gray-200" : "text-gray-700"
                        )}
                      >
                        <RadioGroupItem
                          value={opt.value}
                          id={`${field.id}-${opt.value}`}
                          className={cn(
                            "mb-1 border",
                            isDark ? "border-neutral-700" : "border-gray-300"
                          )}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
            ) : (
              <RadioGroup
                name={field.id}
                className="flex flex-col flex-1 gap-1"
                aria-label={field.label}
              >
                {field.options.map((opt, idx) => (
                  <label
                    key={idx}
                    htmlFor={`${field.id}-${opt.value}`}
                    className={cn(
                      "inline-flex items-center mb-1 gap-2",
                      isDark ? "text-gray-200" : "text-gray-700"
                    )}
                  >
                    <RadioGroupItem
                      value={opt.value}
                      id={`${field.id}-${opt.value}`}
                      className={cn(
                        "mb-1 border",
                        isDark ? "border-neutral-700" : "border-gray-300"
                      )}
                    />
                    {opt.label}
                  </label>
                ))}
              </RadioGroup>
            )}
            {preview && errors?.[field.id] && (
              <span className="text-xs text-red-500">
                {errors[field.id]?.message}
              </span>
            )}
          </>
        )}
      {/* Number Input */}
      {field.type === "number" && (
        <>
          <Input
            id={`field-${field.id}`}
            type="number"
            placeholder={field.placeholder || ""}
            aria-label={field.label}
            className={cn(
              "border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition",
              isDark
                ? "border-neutral-700 bg-neutral-900 text-white"
                : "border-gray-300 bg-gray-50 text-gray-900",
              errors?.[field.id] ? "border-red-500" : ""
            )}
            disabled={!preview ? false : undefined}
            {...(preview
              ? register?.(field.id, getFieldValidation(field))
              : {})}
          />
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </>
      )}
      {/* Email Input */}
      {field.type === "email" && (
        <>
          <Input
            id={`field-${field.id}`}
            type="email"
            placeholder={field.placeholder || ""}
            aria-label={field.label}
            className={cn(
              "border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition",
              isDark
                ? "border-neutral-700 bg-neutral-900 text-white"
                : "border-gray-300 bg-gray-50 text-gray-900",
              errors?.[field.id] ? "border-red-500" : ""
            )}
            disabled={!preview ? false : undefined}
            {...(preview
              ? register?.(field.id, getFieldValidation(field))
              : {})}
          />
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </>
      )}
      {/* OTP */}
      {field.type === "OTP" && (
        <div className="flex flex-col flex-1 gap-1">
          {preview && control ? (
            <Controller
              name={field.id}
              control={control}
              rules={getFieldValidation(field)}
              render={({ field: controllerField }) => (
                <InputOTP
                  maxLength={field.length || 6}
                  containerClassName="gap-2"
                  value={controllerField.value || ""}
                  onChange={controllerField.onChange}
                  className={cn(
                    "border",
                    isDark ? "border-neutral-700" : "border-gray-300"
                  )}
                >
                  <InputOTPGroup>
                    {Array.from({ length: field.length || 6 }).map((_, idx) => (
                      <InputOTPSlot
                        key={idx}
                        index={idx}
                        className={cn(
                          "border",
                          isDark ? "border-neutral-700" : "border-gray-300"
                        )}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
          ) : (
            <InputOTP
              maxLength={field.length || 6}
              containerClassName="gap-2"
              value={field.value || ""}
              className={cn(
                "border",
                isDark ? "border-neutral-700" : "border-gray-300"
              )}
            >
              <InputOTPGroup>
                {Array.from({ length: field.length || 6 }).map((_, idx) => (
                  <InputOTPSlot
                    key={idx}
                    index={idx}
                    className={cn(
                      "border",
                      isDark ? "border-neutral-700" : "border-gray-300"
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          )}
          {preview && errors?.[field.id] && (
            <span className="text-xs text-red-500">
              {errors[field.id]?.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
