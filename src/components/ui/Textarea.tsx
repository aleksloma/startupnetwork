import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
  currentLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, showCount, maxLength, currentLength, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const count = currentLength ?? 0;
    const isOverLimit = maxLength && count > maxLength;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors resize-none",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            error || isOverLimit
              ? "border-red-500 focus:ring-red-500"
              : "border-slate-300 hover:border-slate-400",
            className
          )}
          maxLength={maxLength}
          {...props}
        />
        <div className="mt-1 flex justify-between">
          <div>
            {hint && !error && (
              <p className="text-xs text-slate-500">{hint}</p>
            )}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
          {showCount && maxLength && (
            <p className={cn(
              "text-xs",
              isOverLimit ? "text-red-600" : "text-slate-500"
            )}>
              {count}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
