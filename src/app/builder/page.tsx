"use client";
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { useFormStore } from "@/lib/store";
import FieldConfigPanel from "@/components/FieldConfigPanel";
import { FormBuilderCanvas } from "@/components/Canvas";
import {
  Download,
  Eye,
  EyeOff,
  Moon,
  Redo2,
  Sun,
  Undo2,
  Upload,
} from "lucide-react";
import { motion } from "framer-motion";

function BuilderHeader({
  previewMode,
  setPreviewMode,
  darkMode,
  setDarkMode,
  handleUndo,
  handleRedo,
  handleExport,
  handleImport,
  history,
  future,
}: {
  previewMode: boolean;
  setPreviewMode: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  history: Array<unknown>;
  future: Array<unknown>;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-opacity-80 backdrop-blur sticky top-0 z-10">
      <div className="flex gap-2">
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#2563eb",
            color: "#fff",
          }}
          whileTap={{ scale: 0.96, backgroundColor: "#1d4ed8" }}
          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors duration-150 ${
            previewMode ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setPreviewMode(!previewMode)}
          type="button"
          aria-label="Toggle Preview Mode"
        >
          {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
          {previewMode ? "Back to Builder" : "Preview Mode"}
        </motion.button>
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#fde047",
            color: "#000",
          }}
          whileTap={{ scale: 0.96, backgroundColor: "#facc15" }}
          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors duration-150 ${
            darkMode ? "bg-yellow-400 text-black" : "bg-gray-200"
          }`}
          onClick={() => setDarkMode(!darkMode)}
          type="button"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </motion.button>
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#f87171",
            color: "#fff",
          }}
          whileTap={{ scale: 0.96, backgroundColor: "#ef4444" }}
          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors duration-150 ${
            history.length <= 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200"
          }`}
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
          type="button"
          aria-label="Undo"
          disabled={history.length <= 1}
        >
          <Undo2 size={18} />
          Undo
        </motion.button>
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#60a5fa",
            color: "#fff",
          }}
          whileTap={{ scale: 0.96, backgroundColor: "#2563eb" }}
          className={`flex items-center gap-1 px-3 py-1 rounded transition-colors duration-150 ${
            future.length === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200"
          }`}
          onClick={handleRedo}
          title="Redo (Ctrl+Y)"
          type="button"
          aria-label="Redo"
          disabled={future.length === 0}
        >
          <Redo2 size={18} />
          Redo
        </motion.button>
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "#34d399",
            color: "#fff",
          }}
          whileTap={{ scale: 0.96, backgroundColor: "#059669" }}
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 transition-colors duration-150"
          onClick={handleExport}
          title="Export as JSON"
          type="button"
          aria-label="Export"
        >
          <Download size={18} />
          Export
        </motion.button>
        <motion.label
          whileHover={{
            scale: 1.05,
            backgroundColor: "#fbbf24",
            color: "#fff",
          }}
          whileTap={{ scale: 0.96, backgroundColor: "#d97706" }}
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 cursor-pointer transition-colors duration-150"
          title="Import from JSON"
          aria-label="Import"
          htmlFor="import-json"
          style={{ userSelect: "none" }}
        >
          <Upload size={18} />
          Import
          <input
            id="import-json"
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
            tabIndex={-1}
          />
        </motion.label>
      </div>
      {/* Placeholder for future theme/animation controls */}
    </div>
  );
}

// --- Reusable: BuilderSeparator ---
function BuilderSeparator() {
  return (
    <div
      className="h-full w-px bg-gray-200 dark:bg-neutral-700 mx-0"
      aria-hidden="true"
      style={{ minWidth: 1, maxWidth: 1 }}
    />
  );
}

// --- Main Page ---
export default function BuilderPage() {
  const addField = useFormStore((state) => state.addField);
  const fields = useFormStore((state) => state.fields);
  const reorderFields = useFormStore((state) => state.reorderFields);

  const [previewMode, setPreviewMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState<typeof fields[]>([]);
  const [future, setFuture] = useState<typeof fields[]>([]);

  // Add state for form title and description
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Save state to history on fields change
  useEffect(() => {
    // Only push to history if fields actually changed (avoid duplicate states)
    setHistory((prev) => {
      if (prev.length === 0 || prev[prev.length - 1] !== fields) {
        return [...prev, fields];
      }
      return prev;
    });
  }, [fields]);

  // Undo
  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const newFuture = [prev[prev.length - 1], ...future];
      const newFields = prev[prev.length - 2];
      setTimeout(() => {
        useFormStore.setState({ fields: newFields });
        setFuture(newFuture);
      }, 0);
      return prev.slice(0, -1);
    });
  }, [future]);

  // Redo
  const handleRedo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const newFields = f[0];
      setTimeout(() => {
        useFormStore.setState({ fields: newFields });
        setHistory((h) => [...h, newFields]);
      }, 0);
      return f.slice(1);
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  // Export form as JSON
  const handleExport = () => {
    try {
      // Include title and description in export
      const exportData = {
        title: formTitle,
        description: formDescription,
        fields,
      };
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "formkit-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export form.");
      console.log("err", err);
    }
  };

  // Import form from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        // Support both old (array) and new (object) format
        if (Array.isArray(imported)) {
          useFormStore.setState({ fields: imported });
        } else if (
          imported &&
          imported.fields &&
          Array.isArray(imported.fields)
        ) {
          useFormStore.setState({ fields: imported.fields });
          if (typeof imported.title === "string") setFormTitle(imported.title);
          if (typeof imported.description === "string")
            setFormDescription(imported.description);
        } else {
          alert("Invalid form JSON.");
        }
      } catch {
        alert("Failed to import form.");
      }
    };
    reader.readAsText(file);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const draggedField = fields.find((f) => f.id === active.id);
    if (
      !draggedField &&
      active.data.current?.type &&
      over.id === "canvas-dropzone"
    ) {
      addField(active.data.current.type);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      reorderFields(oldIndex, newIndex);
    }
  };

  return (
    <div
      className={
        darkMode ? "dark bg-neutral-900 text-white" : "bg-white text-black"
      }
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      <BuilderHeader
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleExport={handleExport}
        handleImport={handleImport}
        history={history}
        future={future}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex h-[calc(100vh-48px)] w-full overflow-hidden"
          style={{ maxWidth: "100vw" }}
        >
          {!previewMode && (
            <div
              style={{
                width: "30%",
                minWidth: 100,
                maxWidth: 165,
                background: darkMode ? "#18181b" : "#fff",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Sidebar />
            </div>
          )}
          {/* Divider between Sidebar and Canvas */}
          {!previewMode && <BuilderSeparator />}
          <div
            style={{
              width: previewMode ? "60%" : "55%",
              minWidth: 320,
              background: darkMode ? "#222" : "#f9f9f9",
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            className="flex flex-col transition-all duration-300"
          >
            <FormBuilderCanvas
              preview={previewMode}
              formTitle={formTitle}
              setFormTitle={setFormTitle}
              formDescription={formDescription}
              setFormDescription={setFormDescription}
            />
          </div>
          {/* Divider between Canvas and Config Panel */}
          {!previewMode && <BuilderSeparator />}
          {!previewMode && (
            <div
              style={{
                width: "35%",
                background: darkMode ? "#181818" : "#f3f3f3",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <FieldConfigPanel />
            </div>
          )}
        </div>
      </DndContext>
    </div>
  );
}
