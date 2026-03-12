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
    <main className="page-main">
      <section className="section">
        <div className="container narrow">
          <div className="section-heading reveal">
            <p className="eyebrow">Admin</p>
            <h2>Sign in to manage Garci products</h2>
          </div>

          <AdminLoginForm />
        </div>
      </section>
    </main>
  );
}
