"use client";
import React, { useEffect, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup } from "./ui/radio-group";
import { InputOTP } from "./ui/input-otp";
import { motion } from "framer-motion";

const formComponents = [
	{ type: "text", label: "Text Input", component: Input, props: { placeholder: "Text Input" } },
	{ type: "textarea", label: "Text Area", component: Input, props: { placeholder: "Text Area" } },
	{ type: "select", label: "Select Dropdown", component: Select, props: { options: [{ label: "Option 1", value: "1" }] } },
	{ type: "checkbox", label: "Checkbox", component: Checkbox, props: { label: "Checkbox" } },
	{ type: "radio", label: "Radio Group", component: RadioGroup, props: { options: [{ label: "Option 1", value: "1" }] } },
	{ type: "number", label: "Number Input", component: Input, props: { type: "number", placeholder: "Number Input" } },
	{ type: "email", label: "Email Input", component: Input, props: { type: "email", placeholder: "Email Input" } },
	{ type: "OTP", label: "OTP Input", component: InputOTP, props: { type: "OTP", placeholder: "OTP Input" } },
];

function SidebarDraggableItem({
	type,
	label,
}: {
	type: string;
	label: string;
	component: React.ElementType;
	props: Record<string, unknown>;
}) {
	const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
		id: `sidebar-${type}`,
		data: { type },
	});

	return (
		<motion.div
			ref={setNodeRef}
			{...listeners}
			{...attributes}
			whileHover={{
				scale: 1.04,
				boxShadow: "0 4px 16px 0 rgba(59,130,246,0.10)",
				backgroundColor: "#e0e7ff", // light blue-100
				borderColor: "#2563eb", // blue-600
			}}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className={`rounded-lg border-2 border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-grab p-2 m-1 min-w-[80px] min-h-[70px] transition-colors duration-200 ${
				isDragging ? "opacity-50" : ""
			}`}
			tabIndex={0}
			aria-label={`Drag ${label}`}
			style={{ userSelect: "none" }}
		>
			<span className="text-xs text-gray-800 font-medium text-center">{label}</span>
		</motion.div>
	);
}

export default function Sidebar() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) return null;

	return (
		<aside className="w-full h-full p-4 flex flex-col gap-3">
			<h2 className="text-lg font-semibold mb-2">Form Components</h2>
			<div className="flex flex-col gap-2">
				{formComponents.map((comp) => (
					<SidebarDraggableItem
						key={comp.type}
						type={comp.type}
						label={comp.label}
						component={comp.component}
						props={comp.props}
					/>
				))}
			</div>
		</aside>
	);
}