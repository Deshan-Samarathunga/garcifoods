import { z } from "zod";

const adminPasswordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(72, "Password must contain at most 72 characters.");

export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: adminPasswordSchema,
  turnstileToken: z.string().trim().optional(),
});

export const adminPasswordChangeSchema = z
  .object({
    currentPassword: adminPasswordSchema,
    newPassword: adminPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm the new password."),
  })
  .superRefine((value, context) => {
    if (value.currentPassword === value.newPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Choose a new password that differs from the current one.",
      });
    }

    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "New password confirmation does not match.",
      });
    }
  });

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminPasswordChangeInput = z.infer<typeof adminPasswordChangeSchema>;
