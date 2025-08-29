"use client";

import { useFormStore } from "@/lib/store";
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
import { cn } from "@/lib/utils";

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
  const rules: Record<string, unknown> = {};
  if (field.required) {
    rules.required = "This field is required";
  }
  if (field.type === "email") {
    rules.pattern = {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email address",
    };
  }
  if (field.type === "number") {
    rules.valueAsNumber = true;
  }
  // Add more rules as needed (minLength, maxLength, etc.)
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
    <motion.div
      ref={setNodeRef}
      style={style}
      // Attach drag listeners to a drag handle for better UX
      className={`bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4 mb-4 transition-all duration-200 relative group
        ${
          selectedFieldId === field.id
            ? "border-blue-400 ring-2 ring-blue-100"
            : "hover:border-blue-200"
        }
        ${isDragging ? "opacity-60" : ""}
        `}
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
    >
      {/* Drag handle for rearrange */}
      {!preview && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 cursor-grab text-gray-400 hover:text-blue-500 transition"
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
      {/* Field Title */}
      {field.type !== "button" && (
        <div className="flex flex-col mb-2">
          <label
            className="text-base font-semibold text-gray-900 mb-0"
            htmlFor={`field-${field.id}`}
          >
            {field.type !== "Button" ? <>{field.label}</> : null}
          </label>
        </div>
      )}
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
                "focus:ring-2 focus:ring-blue-400 transition border border-gray-300",
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
                "focus:ring-2 focus:ring-blue-400 transition border border-gray-300",
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
          <>
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
                    <SelectTrigger className="w-full border border-gray-300">
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
          </>
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
                  className="inline-flex items-center mb-1 text-gray-700 gap-2"
                >
                  <Checkbox
                    id={`${field.id}-${opt.value}`}
                    value={opt.value}
                    className="border border-gray-300"
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
                          className="inline-flex items-center mb-1 text-gray-700 gap-2"
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`${field.id}-${opt.value}`}
                            className="mb-1 border border-gray-300"
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
                      className="inline-flex items-center mb-1 text-gray-700 gap-2"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`${field.id}-${opt.value}`}
                        className="mb-1 border border-gray-300"
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
                "focus:ring-2 focus:ring-blue-400 transition border border-gray-300",
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
                "focus:ring-2 focus:ring-blue-400 transition border border-gray-300",
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
                    className="border border-gray-300"
                  >
                    <InputOTPGroup>
                      {Array.from({ length: field.length || 6 }).map((_, idx) => (
                        <InputOTPSlot key={idx} index={idx} className="border border-gray-300" />
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
                className="border border-gray-300"
              >
                <InputOTPGroup>
                  {Array.from({ length: field.length || 6 }).map((_, idx) => (
                    <InputOTPSlot key={idx} index={idx} className="border border-gray-300" />
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
      {/* Delete button (top right, only in builder mode, only on hover) */}
      {!preview && field.type !== "button" && (
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
            removeField(field.id);
          }}
          aria-label={`Delete ${field.label}`}
          type="button"
        >
          Delete
        </motion.button>
      )}
    </motion.div>
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

  console.log("fields", fields);

  // Add react-hook-form for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({ mode: "onBlur" });

  const onSubmit = (data: unknown) => {
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
          className={`flex-1 m-2 max-w-xl mx-auto transition-colors ${
            isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
          }`}
          style={{
            minHeight: 400,
            background: isDark ? "#18181b" : "#fafbfc",
            borderRadius: 14,
            padding: "20px 0",
            transition: "background 0.2s, color 0.2s",
          }}
          role="list"
          aria-label="Form Builder Canvas"
        >
          {/* Canvas Title and Description */}
          <div className="mb-8 px-2">
            <input
              type="text"
              className="text-3xl font-extrabold mb-1 text-gray-900 w-full bg-transparent outline-none tracking-tight"
              value={formTitle}
              readOnly={preview}
              onChange={(e) => setFormTitle(e.target.value)}
              aria-label="Form Title"
              style={{ letterSpacing: "-0.01em" }}
            />
            <input
              type="text"
              className="text-base text-gray-400 mb-4 w-full bg-transparent outline-none"
              placeholder="Description (optional)"
              aria-label="Form Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              disabled={preview}
            />
            {/* ...existing restriction bar... */}
          </div>
          {fields.length === 0 && (
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