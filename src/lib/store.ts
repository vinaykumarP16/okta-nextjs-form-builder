import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";

interface Field {
  validation?: unknown;
  placeholder: string;
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "OTP" | "number" | "email";
  label: string;
  required: boolean;
  options?: { label: string; value: string }[];
}

interface FormState {
  fields: Field[];
  selectedFieldId: string | null;
  addField: (type: string, config?: Partial<Field>) => void;
  selectField: (id: string) => void;
  updateFieldOptions: (id: string, options: { label: string; value: string }[]) => void;
  removeField: (id: string) => void;
  reorderFields: (oldIndex: number, newIndex: number) => void;
  updateField: (id: string, updated: Partial<Field>) => void;
}

export const useFormStore = create<FormState>((set) => ({
  fields: [],
  selectedFieldId: null,
  addField: (type: string, config?: Partial<Field>) =>
    set((state) => {
      const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const newField: Field = {
        id,
        type: type as Field["type"],
        label: config?.label || `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
        required: config?.required ?? false,
        placeholder: config?.placeholder ?? `${type.charAt(0).toUpperCase() + type.slice(1)} Placeholder`,
        options: config?.options,
        validation: config?.validation ?? {},
      };
      return { fields: [...state.fields, newField], selectedFieldId: id };
    }),
  selectField: (id: string) => set({ selectedFieldId: id }),
  updateFieldOptions: (id: string, options: { label: string; value: string }[]) =>
    set((state) => ({
      fields: state.fields.map((f) =>
        f.id === id ? { ...f, options } : f
      ),
    })),
  removeField: (id: string) =>
    set((state) => ({
      fields: state.fields.filter((f) => f.id !== id),
      selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
    })),
  reorderFields: (oldIndex: number, newIndex: number) =>
    set((state) => ({
      fields: arrayMove(state.fields, oldIndex, newIndex),
    })),
  updateField: (id: string, updated: Partial<Field>) =>
    set((state) => ({
      fields: state.fields.map((f) => (f.id === id ? { ...f, ...updated } : f)),
    })),
}));