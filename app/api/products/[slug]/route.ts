import { jsonError, jsonOk } from "@/lib/http";
import { getPublicProductBySlug } from "@/lib/services/products";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return jsonError("Product not found.", 404);
  }

  return jsonOk(product);
}
