import { jsonOk } from "@/lib/http";
import { listPublicProducts } from "@/lib/services/products";

export async function GET() {
  const products = await listPublicProducts();
  return jsonOk(products);
}
