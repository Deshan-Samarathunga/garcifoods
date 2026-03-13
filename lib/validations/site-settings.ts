import { z } from "zod";

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

export type AdminSiteContactSettingsInput = z.infer<typeof adminSiteContactSettingsSchema>;
