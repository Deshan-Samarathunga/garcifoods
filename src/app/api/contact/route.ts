import { ZodError } from "zod";

import { env } from "@/lib/env";
import { jsonError, jsonOk } from "@/lib/http";
import { captureException } from "@/lib/monitoring";
import { sendInquiryNotification } from "@/lib/services/email";
import { createInquiry } from "@/lib/services/inquiries";
import { checkRateLimit, getRequestIdentifier } from "@/lib/services/rate-limit";
import { verifyTurnstileToken } from "@/lib/services/turnstile";
import { contactSubmissionSchema } from "@/lib/validations/contact";

export async function POST(request: Request) {
  const identifier = getRequestIdentifier(request);
  const rateLimit = await checkRateLimit("contact", identifier);

  if (!rateLimit.success) {
    return jsonError("Too many inquiries were sent from this connection. Please try again later.", 429);
  }

  try {
    const json = await request.json();
    const payload = contactSubmissionSchema.parse(json);

    if (env.hasTurnstileSiteKey || env.isProduction) {
      const verification = await verifyTurnstileToken(payload.turnstileToken, identifier);

      if (!verification.success) {
        return jsonError(verification.error ?? "Bot verification failed.", 400);
      }
    }

    const inquiry = await createInquiry(payload);
    const emailResult = await sendInquiryNotification(inquiry);

    if (!emailResult.delivered) {
      return jsonOk(
        {
          message: "Your inquiry was saved successfully.",
          warning:
            "Your inquiry was saved, but email delivery is not configured yet. Please complete the email environment settings before production launch.",
        },
        202,
      );
    }

    return jsonOk({
      message: "Your inquiry has been sent successfully.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Please review the form fields and try again.", 400, error.flatten());
    }

    captureException(error, { area: "api.contact" });
    return jsonError("We could not process your inquiry right now. Please try again later.", 500);
  }
}
