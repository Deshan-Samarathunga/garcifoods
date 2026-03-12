import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name is too long."),
  email: z.email("Please enter a valid email address."),
  subject: z
    .string()
    .trim()
    .min(3, "Please enter a subject.")
    .max(120, "Subject is too long.")
    .default("Product inquiry"),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message with a little more detail.")
    .max(2000, "Message is too long."),
  turnstileToken: z.string().trim().optional(),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
