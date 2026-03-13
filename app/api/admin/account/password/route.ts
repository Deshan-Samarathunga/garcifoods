import { compare, hash } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/auth";
import { getPrismaClient, hasDatabaseUrl } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/http";
import { captureException } from "@/lib/monitoring";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { adminPasswordChangeSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const session = await requireAdminApiSession();

  if (!session?.user?.id) {
    return jsonError("Authentication is required.", 401);
  }

  const rateLimit = await checkRateLimit("admin-password", session.user.id);

  if (!rateLimit.success) {
    return jsonError("Too many password change attempts were submitted. Please wait and try again.", 429);
  }

  if (!hasDatabaseUrl) {
    return jsonError("Database access is not configured.", 500);
  }

  try {
    const json = await request.json();
    const payload = adminPasswordChangeSchema.parse(json);
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return jsonError("Admin account was not found.", 404);
    }

    const passwordMatches = await compare(payload.currentPassword, user.passwordHash);

    if (!passwordMatches) {
      return jsonError("The current password is incorrect.", 400, {
        formErrors: [],
        fieldErrors: {
          currentPassword: ["The current password is incorrect."],
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(payload.newPassword, 12),
      },
    });

    return jsonOk({ message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return jsonError("Please submit a valid JSON payload.", 400);
    }

    if (error instanceof ZodError) {
      return jsonError("Please review the password form fields.", 400, error.flatten());
    }

    captureException(error, {
      area: "api.admin.account.password.update",
      userId: session.user.id,
    });

    return jsonError("The password could not be updated.", 500);
  }
}
