"use client";

import { useFormStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import React from "react";

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

type SortableFieldProps = {
  field: Field;
  selectedFieldId: string | null;
  selectField: (id: string) => void;
  removeField: (id: string) => void;
  preview?: boolean;
};

function getFieldValidation(field: Field) {
  // Enhanced: Add validation rules for all components
  const rules: Record<string, unknown> = {};

  // Support both field.required and field.validation
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

function SortableField({
  field,
  selectedFieldId,
  selectField,
  removeField,
  preview,
  register,
  errors,
  control,
}: SortableFieldProps & {
  register?: ReturnType<typeof useForm>["register"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: Record<string, any>;
  control?: ReturnType<typeof useForm>["control"];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const [collapsed, setCollapsed] = useState(field.collapsed ?? false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Detect dark mode for each field (ensures correct theme on drag/preview)
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
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
  
  // Section rendering
  if (field.type === "section") {
    return (
      <motion.fieldset
        ref={setNodeRef}
        style={style}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`p-4 my-3 rounded-xl border-2 bg-gray-50 flex flex-col gap-1 shadow-sm ${
          selectedFieldId === field.id ? "border-blue-500" : "border-gray-300"
        }`}
        onClick={() => !preview && selectField(field.id)}
      >
        <legend
          className="flex items-center gap-2 cursor-pointer font-semibold text-base text-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((c) => !c);
          }}
        >
          <span className="transition-transform">{collapsed ? "▶" : "▼"}</span>
          {field.label}
        </legend>
        <AnimatePresence initial={false}>
          {!collapsed && field.fields && field.fields.length > 0 && (
            <motion.div
              className="pl-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {field.fields.map((child) => (
                <SortableField
                  key={child.id}
                  field={child}
                  selectedFieldId={selectedFieldId}
                  selectField={selectField}
                  removeField={removeField}
                  preview={preview}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {!preview && (
          <button
            className="ml-auto mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={(e) => {
              e.stopPropagation();
              removeField(field.id);
            }}
            aria-label="Delete section"
          >
            Delete Section
          </button>
        )}
      </motion.fieldset>
    );
  }



  return (
    <AnimatePresence>
      <motion.div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-2xl border shadow-lg px-4 py-3 mb-3 transition-all duration-200 relative group",
          isDark
            ? "bg-neutral-800 border-neutral-700"
            : "bg-white border-gray-200",
          selectedFieldId === field.id
            ? isDark
              ? "border-red-500 ring-2 ring-red-900"
              : "border-red-500 ring-2 ring-red-100"
            : isDark
              ? "hover:border-blue-500"
              : "hover:border-blue-500",
          isDragging ? "opacity-60" : ""
        )}
        tabIndex={0}
        aria-label={field.label}
        role="listitem"
        onClick={() => !preview && selectField(field.id)}
        onKeyDown={(e) => {
          if (!preview && (e.key === "Enter" || e.key === " ")) {
            selectField(field.id);
          }
          if (!preview && e.key === "Delete") {
            removeField(field.id);
          }
        }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.25 }}
        layout
      >
        {/* Drag handle and Field Title */}
        <div className="flex items-center gap-3 mb-2">
          {!preview && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab text-gray-400 hover:text-blue-500 transition flex-shrink-0"
              title="Drag to reorder"
              tabIndex={-1}
              style={{ zIndex: 2 }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                <circle cx="5" cy="10" r="1.5" fill="currentColor" />
                <circle cx="5" cy="15" r="1.5" fill="currentColor" />
                <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                <circle cx="10" cy="15" r="1.5" fill="currentColor" />
            </svg>
            </div>
          )}
          {field.type !== "button" && (
            <label
              className={cn(
                "text-l font-bold mb-0",
                isDark ? "text-white" : "text-gray-900"
              )}
              htmlFor={`field-${field.id}`}
              style={{ lineHeight: 1.2 }}
            >
              {field.type !== "Button" ? <>{field.label}</> : null}
            </label>
          )}
        </div>
        {/* Field Content */}
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
          {/* Button */}
          {field.type === "button" && preview && (
            <Button
              type="submit"
              className="bg-blue-500 text-white rounded px-4 py-2 w-full font-semibold shadow hover:bg-blue-600 transition"
            >
              {field.label || "Button"}
            </Button>
          )}
        </div>
        {/* Delete button only on hover of component */}
        {!preview && field.type !== "button" && (
          <>
            <motion.button
              whileHover={{
                scale: 1.08,
                backgroundColor: "#ef4444",
                color: "#fff",
              }}
              whileTap={{ scale: 0.95, backgroundColor: "#b91c1c" }}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition z-10 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              aria-label={`Delete ${field.label}`}
              type="button"
            >
              Delete
            </motion.button>
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 min-w-[280px] max-w-xs flex flex-col items-center">
                  <div className="text-base font-semibold mb-4 text-center text-gray-900 dark:text-white">
                    Are you sure you want to delete this component?
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      className="px-4 py-1 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        removeField(field.id);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="px-4 py-1 rounded bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

const FormBuilderCanvas = ({
  preview = false,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
}: {
  preview?: boolean;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
}) => {
  const { setNodeRef } = useDroppable({ id: "canvas-dropzone" });
  const fields = useFormStore((s) => s.fields);
  const selectedFieldId = useFormStore((s) => s.selectedFieldId);
  const selectField = useFormStore((s) => s.selectField);
  const removeField = useFormStore((s) => s.removeField);
  const reorderFields = useFormStore((s) => s.reorderFields);
  const addField = useFormStore((s) => s.addField);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      reorderFields(oldIndex, newIndex);
    }
  };

  // Add keyboard support for sidebar drag: listen for custom event and add field
  useEffect(() => {
    const handleSidebarDragStart = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string }>;
      if (customEvent.detail?.type) {
        addField(customEvent.detail.type);
      }
    };
    window.addEventListener("sidebar-drag-start", handleSidebarDragStart);
    return () => window.removeEventListener("sidebar-drag-start", handleSidebarDragStart);
  }, [addField]);

  // Add react-hook-form for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    trigger,
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data: unknown) => {
    // Always trigger validation before submit in preview mode
    const valid = await trigger();
    if (!valid) {
      // If not valid, do not submit
      return;
    }
    alert("Form submitted!\n" + JSON.stringify(data, null, 2));
    reset();
  };

  // Use a state to track dark mode and sync with the parent (page.tsx)
  // Accept darkMode as a prop for reliable sync
  // If not passed, fallback to checking the DOM
  const [isDark, setIsDark] = useState(false);

  // Use useEffect to listen for dark mode changes and update state
  useEffect(() => {
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

  console.log('fields', fields)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart({ active }) {
            return `Picked up ${active.id}`;
          },
          onDragOver({ active, over }) {
            return over
              ? `Dragging ${active.id} over ${over.id}`
              : `Dragging ${active.id}`;
          },
          onDragEnd({ active, over }) {
            return over
              ? `Moved ${active.id} to position of ${over.id}`
              : `Dropped ${active.id}`;
          },
          onDragCancel({ active }) {
            return `Moving was cancelled. ${active.id} was dropped.`;
          },
        },
      }}
    >
      <SortableContext
        items={fields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            // Reduced padding: padding: "16px 0" (was "32px 0")
            "flex-1 m-2 max-w-xl mx-auto transition-colors",
            isDark
              ? "bg-neutral-900 text-white"
              : "bg-white text-black"
          )}
          style={{
            minHeight: 400,
            background: isDark ? "#18181b" : "#fafbfc",
            borderRadius: 18,
            padding: "16px 0",
            transition: "background 0.2s, color 0.2s",
          }}
          role="list"
          aria-label="Form Builder Canvas"
        >
          {/* Canvas Title and Description */}
          <div className="mb-8 px-2">
            <input
              type="text"
              className={cn(
                "text-3xl font-extrabold mb-1 w-full bg-transparent outline-none tracking-tight",
                isDark ? "text-white" : "text-gray-900"
              )}
              value={formTitle}
              readOnly={preview}
              onChange={(e) => setFormTitle(e.target.value)}
              aria-label="Form Title"
              style={{ letterSpacing: "-0.01em" }}
              placeholder="Untitled Form"
            />
            <input
              type="text"
              className={cn(
                "text-base mb-4 w-full bg-transparent outline-none",
                isDark ? "text-gray-400" : "text-gray-400"
              )}
              placeholder="Description (optional)"
              aria-label="Form Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={preview}
            />
            {/* ...existing restriction bar... */}
          </div>
          {fields.length === 0 && !preview && (
            <div
              className="text-gray-400 text-center py-8 text-lg"
              role="status"
            >
              Drag fields here
            </div>
          )}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-0"
            autoComplete="off"
          >
            <AnimatePresence initial={false}>
              {fields.map((field) => (
                <SortableField
                  key={field.id}
                  field={field}
                  selectedFieldId={selectedFieldId}
                  selectField={selectField}
                  removeField={removeField}
                  preview={preview}
                  register={register}
                  errors={errors}
                  control={control}
                />
              ))}
            </AnimatePresence>
            {preview && fields.length > 0 && (
              <Button
                type="submit"
                className={`mt-6 mx-auto px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition ${
                  isDark
                    ? "bg-blue-700 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                Submit
              </Button>
            )}
          </form>
        </div>
      </SortableContext>
    </DndContext>
  );
};

export { FormBuilderCanvas };
