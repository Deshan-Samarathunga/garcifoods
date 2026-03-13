import Image from "next/image";
import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Protected login for the Garci admin area.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <main className="admin-main admin-login-main">
      <section className="admin-login-shell">
        <div className="admin-login-aside">
          <div className="admin-login-brand">
            <span className="admin-login-brandmark" aria-hidden="true">
              <Image
                src="/assets/images/brand/favicon.png"
                alt=""
                width={96}
                height={96}
                priority
              />
            </span>
            <div>
              <p>Garci Admin</p>
              <strong>Catalog workspace</strong>
            </div>
          </div>

          <div className="admin-login-copy">
            <p className="admin-board-kicker">Protected workspace</p>
            <h1>A quieter place to manage the catalog.</h1>
            <p>
              Sign in to update product details, control visibility, and keep the storefront data
              current without reworking the public site.
            </p>
          </div>

          <div className="admin-login-notegrid">
            <article className="admin-login-note is-primary">
              <strong>Catalog updates</strong>
              <span>Edit copy, images, tags, and publish states from one workspace.</span>
            </article>
            <article className="admin-login-note">
              <strong>Guarded sign-in</strong>
              <span>Admin access stays limited to approved credentials and protected sessions.</span>
            </article>
            <article className="admin-login-note">
              <strong>Public site safe</strong>
              <span>Storefront presentation stays separate until catalog changes are published.</span>
            </article>
          </div>
        </div>

        <div className="admin-login-panel">
          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
