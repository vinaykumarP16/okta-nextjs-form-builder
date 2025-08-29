import * as React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={
        "border px-3 py-2 rounded text-gray-700 focus:ring-2 focus:ring-blue-400 transition " +
        className
      }
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
