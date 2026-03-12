import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/products/products-catalog";
import { listMarketingProducts } from "@/lib/services/products";

export const metadata: Metadata = {
  title: "Products",
  description: "Garci product page for jackfruit and green banana flour.",
};

export default async function ProductsPage() {
  const products = await listMarketingProducts();

  return (
    <main className="page-main products-page">
      <section className="section products-catalog">
        <div className="container">
          <ProductsCatalog products={products} />
        </div>
      </section>
    </main>
  );
}
