import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { captureException } from "@/lib/monitoring";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { updateSiteReviewWidgetSettings } from "@/lib/services/site-settings";
import { adminSiteReviewWidgetSettingsSchema } from "@/lib/validations/site-settings";

export async function PATCH(request: Request) {
  const session = await requireAdminApiSession();

  if (!session?.user?.id) {
    return jsonError("Authentication is required.", 401);
  }

  const rateLimit = await checkRateLimit("admin-settings", session.user.id);

  if (!rateLimit.success) {
    return jsonError("Too many admin settings changes were submitted. Please wait and try again.", 429);
  }

  if (!hasDatabaseUrl) {
    return jsonError("Database access is not configured.", 500);
  }

  try {
    const json = await request.json();
    const payload = adminSiteReviewWidgetSettingsSchema.parse(json);
    const settings = await updateSiteReviewWidgetSettings(payload);

    revalidatePath("/");
    revalidatePath("/admin/settings");

    return jsonOk({
      message: "Review widget settings updated successfully.",
      settings,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError("Please submit a valid JSON payload.", 400);
    }

    if (error instanceof ZodError) {
      return jsonError("Please review the review widget fields.", 400, error.flatten());
    }

    if (error instanceof Error && error.message.includes("latest database migration")) {
      return jsonError(error.message, 503);
    }

    captureException(error, {
      area: "api.admin.settings.reviews.update",
      userId: session.user.id,
    });

    return jsonError("The review widget settings could not be updated.", 500);
  }
}
