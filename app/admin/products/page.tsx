import type { Metadata } from "next";

import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { requireAdminPageSession } from "@/lib/auth";
import { listAdminProducts, type ProductDto } from "@/lib/services/products";

export const metadata: Metadata = {
  title: "Admin Products",
  description: "Manage Garci product records.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminPageSession();
  let products: ProductDto[] = [];
  let databaseError = false;

  try {
    products = await listAdminProducts();
  } catch {
    databaseError = true;
  }

  return (
    <main className="admin-main">
      <section className="admin-page-shell admin-view-shell">
        {databaseError ? (
          <div className="admin-board-card admin-board-empty-state">
            <div className="admin-board-card-header">
              <div>
                <p className="admin-board-kicker">Database required</p>
                <h2>Product studio needs PostgreSQL</h2>
              </div>
            </div>
            <p>
              Configure <code>DATABASE_URL</code>, run the Prisma migration, and seed the initial
              data before using the product editor.
            </p>
          </div>
        ) : (
          <AdminProductsManager initialProducts={products} />
        )}
      </section>
    </main>
  );
}
