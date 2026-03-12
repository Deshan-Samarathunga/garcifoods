import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { captureException } from "@/lib/monitoring";
import { checkRateLimit } from "@/lib/services/rate-limit";
import { deleteProduct, updateProduct } from "@/lib/services/products";
import { adminProductSchema } from "@/lib/validations/product";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    const { id } = await params;
    const product = await updateProduct(id, payload);
    return jsonOk(product);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Please review the product form fields.", 400, error.flatten());
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return jsonError("A product with this slug already exists.", 409);
      }

      if (error.code === "P2025") {
        return jsonError("Product not found.", 404);
      }
    }

    captureException(error, { area: "api.admin.products.update" });
    return jsonError("The product could not be updated.", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();

  if (!session?.user?.id) {
    return jsonError("Authentication is required.", 401);
  }

  const rateLimit = await checkRateLimit("admin-products", session.user.id);

  if (!rateLimit.success) {
    return jsonError("Too many admin product changes were submitted. Please wait and try again.", 429);
  }

  try {
    const { id } = await params;
    await deleteProduct(id);
    return jsonOk({ id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("Product not found.", 404);
    }

    captureException(error, { area: "api.admin.products.delete" });
    return jsonError("The product could not be deleted.", 500);
  }
}
