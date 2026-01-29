"use client";

import { useState, useTransition } from "react";
import { Controller, type Control } from "react-hook-form";
import { createFieldTag } from "@/actions/fieldTag.actions";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StartupFormData } from "@/schemas/startup.schema";
import type { FieldTag } from "@prisma/client";

interface TagSelectorProps {
  control: Control<StartupFormData>;
  tags: FieldTag[];
  error?: string;
  onTagCreated?: (tag: FieldTag) => void;
}

export function TagSelector({ control, tags, error, onTagCreated }: TagSelectorProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTagName, setCustomTagName] = useState("");
  const [customTagError, setCustomTagError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateTag = () => {
    if (!customTagName.trim()) return;

    setCustomTagError(null);
    startTransition(async () => {
      const result = await createFieldTag(customTagName);
      if (result.error) {
        setCustomTagError(typeof result.error === "string" ? result.error : "Failed to create tag");
      } else if (result.data) {
        onTagCreated?.(result.data);
        setCustomTagName("");
        setShowCustomForm(false);
      }
    });
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Field Tags</h2>
        <p className="text-sm text-slate-600 mt-1">
          Select 1-2 tags that best describe your startup&apos;s field
        </p>
      </div>

      <Controller
        name="fieldTagIds"
        control={control}
        render={({ field }) => (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = field.value.includes(tag.id);
                const canSelect = field.value.length < 2 || isSelected;

                return (
                  <button
                    key={tag.id}
                    type="button"
                    disabled={!canSelect && !isSelected}
                    onClick={() => {
                      if (isSelected) {
                        field.onChange(field.value.filter((id) => id !== tag.id));
                      } else if (canSelect) {
                        field.onChange([...field.value, tag.id]);
                      }
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                      isSelected
                        ? "text-white"
                        : "border-slate-200 hover:border-slate-300 text-slate-700",
                      !canSelect && !isSelected && "opacity-40 cursor-not-allowed"
                    )}
                    style={{
                      backgroundColor: isSelected ? tag.color : "transparent",
                      borderColor: isSelected ? tag.color : undefined,
                    }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>

            {/* Selected count indicator */}
            <p className="text-sm text-slate-500">
              {field.value.length}/2 tags selected
            </p>
          </div>
        )}
      />

      {/* Custom tag creation */}
      <div className="pt-4 border-t border-slate-200">
        {!showCustomForm ? (
          <button
            type="button"
            onClick={() => setShowCustomForm(true)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Add a custom tag
          </button>
        ) : (
          <div className="space-y-3">
            <Input
              label="Custom Tag Name"
              placeholder="e.g., IoT, AgriTech"
              value={customTagName}
              onChange={(e) => setCustomTagName(e.target.value)}
              error={customTagError || undefined}
              hint="Max 2 words, will be available for all users"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleCreateTag}
                isLoading={isPending}
                disabled={!customTagName.trim()}
              >
                Create Tag
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomForm(false);
                  setCustomTagName("");
                  setCustomTagError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </section>
  );
}
