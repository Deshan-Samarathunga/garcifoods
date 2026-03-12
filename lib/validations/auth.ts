import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  turnstileToken: z.string().trim().optional(),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
