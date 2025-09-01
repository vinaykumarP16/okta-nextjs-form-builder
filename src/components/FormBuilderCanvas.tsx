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
import { useForm } from "react-hook-form";
import { Button } from "./ui/button";
import { FieldContent } from "./FieldContent";
import { Field } from "@/lib/formValidation";

type SortableFieldProps = {
  field: Field;
  selectedFieldId: string | null;
  selectField: (id: string) => void;
  removeField: (id: string) => void;
  preview?: boolean;
};

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
  errors?: import("react-hook-form").FieldErrors;
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Dark mode / Light mode
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
        <FieldContent
          field={field}
          preview={preview}
          register={register}
          errors={errors}
          control={control}
        />
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
          className={cn(
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
                    