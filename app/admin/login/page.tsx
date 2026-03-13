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
            <span className="admin-login-brandmark">G</span>
            <div>
              <p>Garci Foods</p>
              <strong>Admin Control</strong>
            </div>
          </div>

          <div className="admin-login-copy">
            <p className="admin-board-kicker">Protected workspace</p>
            <h1>Operate the catalog from a clean control board.</h1>
            <p>
              Sign in to update product records, manage public visibility, and keep the storefront
              data aligned without touching the public site design.
            </p>
          </div>

          <div className="admin-login-notegrid">
            <article className="admin-login-note is-primary">
              <strong>Catalog control</strong>
              <span>Create, stage, edit, and publish product records from one place.</span>
            </article>
            <article className="admin-login-note">
              <strong>Protected access</strong>
              <span>Credentials-based login stays guarded with session checks and bot screening.</span>
            </article>
            <article className="admin-login-note">
              <strong>Storefront unchanged</strong>
              <span>The admin redesign is isolated from the public site experience.</span>
            </article>
          </div>
        </div>

        <AdminLoginForm />
      </section>
    </main>
  );
}
