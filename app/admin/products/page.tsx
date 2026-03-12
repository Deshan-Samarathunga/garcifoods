import type { Metadata } from "next";

import { AdminProductsManager } from "@/components/admin/admin-products-manager";
import { AdminSignOutButton } from "@/components/admin/admin-sign-out-button";
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
  const session = await requireAdminPageSession();
  let products: ProductDto[] = [];
  let databaseError = false;

  try {
    products = await listAdminProducts();
  } catch {
    databaseError = true;
  }

  return (
    <main className="page-main">
      <section className="section">
        <div className="container">
          <div className="admin-page-header">
            <div>
              <p className="eyebrow">Admin Dashboard</p>
              <h1>Products</h1>
              <p>Signed in as {session.user.email}</p>
            </div>
            <AdminSignOutButton />
          </div>

          {databaseError ? (
            <div className="contact-form">
              <p className="eyebrow">Database Required</p>
              <h2>Admin product management needs PostgreSQL.</h2>
              <p>
                Configure <code>DATABASE_URL</code>, run the Prisma migration, and seed the initial
                data before using the admin product editor.
              </p>
            </div>
          ) : (
            <AdminProductsManager initialProducts={products} />
          )}
        </div>
      </section>
    </main>
  );
}
