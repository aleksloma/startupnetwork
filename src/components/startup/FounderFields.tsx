"use client";

import { Button, Input } from "@/components/ui";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { StartupFormData } from "@/schemas/startup.schema";

interface FounderFieldsProps {
  fields: Array<{ id: string }>;
  register: UseFormRegister<StartupFormData>;
  errors: FieldErrors<StartupFormData>;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function FounderFields({ fields, register, errors, onAdd, onRemove }: FounderFieldsProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Founders</h2>
        <p className="text-sm text-slate-600 mt-1">
          Add the founder and optionally a co-founder
        </p>
      </div>

      <div className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-slate-900">
                {index === 0 ? "Founder" : "Co-Founder"}
                {index === 0 && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full Name"
                placeholder="John Doe"
                {...register(`founders.${index}.name`)}
                error={errors.founders?.[index]?.name?.message}
              />
              <Input
                label="LinkedIn Profile URL"
                type="url"
                placeholder="https://linkedin.com/in/johndoe"
                {...register(`founders.${index}.linkedInUrl`)}
                error={errors.founders?.[index]?.linkedInUrl?.message}
              />
            </div>
          </div>
        ))}
      </div>

      {fields.length < 2 && (
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          + Add Co-Founder
        </Button>
      )}

      {errors.founders?.message && (
        <p className="text-sm text-red-600">{errors.founders.message}</p>
      )}
    </section>
  );
}
