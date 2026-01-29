"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { startupSchema, type StartupFormData } from "@/schemas/startup.schema";
import { createStartup, updateStartup } from "@/actions/startup.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { TagSelector } from "./TagSelector";
import { FounderFields } from "./FounderFields";
import type { FieldTag } from "@prisma/client";
import type { StartupWithRelations } from "@/types";

interface StartupFormProps {
  fieldTags: FieldTag[];
  initialData?: StartupWithRelations;
  mode?: "create" | "edit";
}

export function StartupForm({ fieldTags, initialData, mode = "create" }: StartupFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [tags, setTags] = useState<FieldTag[]>(fieldTags);

  const defaultFounders = initialData?.founders.map((f) => ({
    name: f.name,
    linkedInUrl: f.linkedInUrl,
  })) || [{ name: "", linkedInUrl: "" }];

  const defaultTagIds = initialData?.startupFields.map((sf) => sf.fieldTagId) || [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StartupFormData>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      name: initialData?.name || "",
      goal: initialData?.goal || "",
      websiteUrl: initialData?.websiteUrl || "",
      description: initialData?.description || "",
      founders: defaultFounders,
      fieldTagIds: defaultTagIds,
    },
  });

  const { fields: founderFields, append, remove } = useFieldArray({
    control,
    name: "founders",
  });

  const goalValue = watch("goal") || "";
  const descriptionValue = watch("description") || "";

  const onSubmit = (data: StartupFormData) => {
    setServerError(null);
    startTransition(async () => {
      const result =
        mode === "edit" && initialData
          ? await updateStartup(initialData.id, data)
          : await createStartup(data);

      if (result.error) {
        if (typeof result.error === "string") {
          setServerError(result.error);
        } else {
          // Handle field errors
          const firstError = Object.values(result.error).flat()[0];
          setServerError(firstError || "Please check your inputs and try again");
        }
        return;
      }

      if (result.data) {
        router.push(`/startup/${result.data.id}`);
        router.refresh();
      }
    });
  };

  const handleTagCreated = (newTag: FieldTag) => {
    setTags((prev) => [...prev, newTag]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Basic Info Section */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
          <p className="text-sm text-slate-600 mt-1">Tell us about your startup</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Startup Name"
            placeholder="Your startup name"
            {...register("name")}
            error={errors.name?.message}
          />
          <Input
            label="Website URL"
            type="url"
            placeholder="https://yourstartup.com"
            {...register("websiteUrl")}
            error={errors.websiteUrl?.message}
            hint="Optional"
          />
        </div>

        <Textarea
          label="One-Sentence Goal"
          placeholder="Describe your startup's mission in one sentence"
          rows={2}
          {...register("goal")}
          error={errors.goal?.message}
          showCount
          maxLength={140}
          currentLength={goalValue.length}
        />

        <Textarea
          label="Description"
          placeholder="Describe your startup in more detail. What problem do you solve? Who are your customers? What makes you unique?"
          rows={5}
          {...register("description")}
          error={errors.description?.message}
          showCount
          maxLength={500}
          currentLength={descriptionValue.length}
          hint="Minimum 100 characters"
        />
      </section>

      {/* Founders Section */}
      <FounderFields
        fields={founderFields}
        register={register}
        errors={errors}
        onAdd={() => append({ name: "", linkedInUrl: "" })}
        onRemove={remove}
      />

      {/* Field Tags Section */}
      <TagSelector
        control={control}
        tags={tags}
        error={errors.fieldTagIds?.message}
        onTagCreated={handleTagCreated}
      />

      {/* Submit */}
      <div className="flex gap-4 pt-6 border-t border-slate-200">
        <Button
          type="submit"
          disabled={isSubmitting || isPending}
          isLoading={isSubmitting || isPending}
          className="flex-1 sm:flex-none"
        >
          {mode === "edit" ? "Update Startup" : "Add Your Startup"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isSubmitting || isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
