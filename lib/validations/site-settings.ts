import { z } from "zod";

import { normalizeTrustindexEmbedCode } from "@/lib/trustindex";

const contactNumberSchema = z
  .string()
  .trim()
  .min(7, "Contact number is required.")
  .max(40, "Contact number is too long.");

const createUrlSchema = (label: string) => {
  return z
    .string()
    .trim()
    .url(`Enter a valid ${label} URL.`)
    .max(500, `${label} URL is too long.`);
};

export const adminSiteContactSettingsSchema = z.object({
  mobile: contactNumberSchema,
  telephone: contactNumberSchema,
  address: z.string().trim().min(8, "Address is required.").max(200, "Address is too long."),
  mapUrl: createUrlSchema("map link"),
  mapEmbedUrl: createUrlSchema("map embed"),
});

export const adminSiteReviewWidgetSettingsSchema = z
  .object({
    reviewsWidgetEnabled: z.boolean(),
    reviewsWidgetCode: z
      .string()
      .trim()
      .max(60000, "Review widget code is too long."),
  })
  .superRefine((value, context) => {
    if (!value.reviewsWidgetCode) {
      if (value.reviewsWidgetEnabled) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reviewsWidgetCode"],
          message: "Paste the Trustindex embed code before enabling the widget.",
        });
      }

      return;
    }

    const normalized = normalizeTrustindexEmbedCode(value.reviewsWidgetCode);

    if (!normalized.ok) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewsWidgetCode"],
        message: normalized.error,
      });
    }
  });

export type AdminSiteContactSettingsInput = z.infer<typeof adminSiteContactSettingsSchema>;
export type AdminSiteReviewWidgetSettingsInput = z.infer<typeof adminSiteReviewWidgetSettingsSchema>;
