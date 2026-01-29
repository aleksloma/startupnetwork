import { z } from "zod";

export const founderSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  linkedInUrl: z
    .string()
    .min(1, "LinkedIn URL is required")
    .url("Must be a valid URL")
    .refine(
      (url) => url.includes("linkedin.com"),
      "Must be a LinkedIn URL"
    ),
});

export const optionalFounderSchema = z.object({
  name: z.string().max(100, "Name must be less than 100 characters").optional().or(z.literal("")),
  linkedInUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.includes("linkedin.com"), "Must be a LinkedIn URL")
    .optional()
    .or(z.literal("")),
});

export const startupSchema = z.object({
  name: z
    .string()
    .min(2, "Startup name must be at least 2 characters")
    .max(100, "Startup name must be less than 100 characters"),
  goal: z
    .string()
    .min(10, "Goal must be at least 10 characters")
    .max(140, "Goal must be 140 characters or less"),
  websiteUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters")
    .max(500, "Description must be 500 characters or less"),
  founders: z
    .array(founderSchema)
    .min(1, "At least one founder is required")
    .max(2, "Maximum 2 founders allowed"),
  fieldTagIds: z
    .array(z.string())
    .min(1, "Select at least one field tag")
    .max(2, "Select at most 2 field tags"),
});

export const createFieldTagSchema = z.object({
  name: z
    .string()
    .min(2, "Tag name must be at least 2 characters")
    .max(30, "Tag name must be less than 30 characters")
    .refine(
      (name) => name.trim().split(/\s+/).length <= 2,
      "Tag name can have at most 2 words"
    ),
});

export type StartupFormData = z.infer<typeof startupSchema>;
export type FounderFormData = z.infer<typeof founderSchema>;
export type CreateFieldTagData = z.infer<typeof createFieldTagSchema>;
