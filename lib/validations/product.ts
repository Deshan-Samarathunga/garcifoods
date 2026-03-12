import { z } from "zod";

import { slugify } from "@/lib/utils";

const featureSchema = z
  .string()
  .trim()
  .min(2, "Each feature must contain at least 2 characters.")
  .max(140, "Each feature must stay under 140 characters.");

export const adminProductSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(80, "Slug is too long.")
    .transform((value) => slugify(value)),
  name: z.string().trim().min(2, "Name is required.").max(120, "Name is too long."),
  description: z
    .string()
    .trim()
    .min(12, "Description should be a little more descriptive.")
    .max(600, "Description is too long."),
  features: z
    .array(featureSchema)
    .min(1, "Add at least one product feature.")
    .max(8, "Keep the feature list to 8 items or fewer."),
  imageUrl: z.string().trim().min(1, "Image URL is required.").max(255, "Image URL is too long."),
  isActive: z.boolean().default(true),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
