import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { captureException } from "@/lib/monitoring";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { createProduct } from "@/lib/services/products";
import { adminProductSchema } from "@/lib/validations/product";

export async function POST(request: Request) {
  const session = await requireAdminApiSession();

  if (!session?.user?.id) {
    return jsonError("Authentication is required.", 401);
  }

  const rateLimit = await checkRateLimit("admin-products", session.user.id);

  if (!rateLimit.success) {
    return jsonError("Too many admin product changes were submitted. Please wait and try again.", 429);
  }

  try {
    const json = await request.json();
    const payload = adminProductSchema.parse(json);
    const product = await createProduct(payload);
    return jsonOk(product, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Please review the product form fields.", 400, error.flatten());
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("A product with this slug already exists.", 409);
    }

    captureException(error, { area: "api.admin.products.create" });
    return jsonError("The product could not be created.", 500);
  }
}
