import type { Metadata } from "next";

import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { requireAdminPageSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Manage Garci admin account security.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireAdminPageSession();

  return (
    <main className="admin-main">
      <section className="admin-page-shell admin-view-shell admin-settings-shell">
        <div className="admin-settings-grid">
          <article className="admin-board-card">
            <div className="admin-board-card-header">
              <div>
                <p className="admin-board-kicker">Account security</p>
                <h2>Change admin password</h2>
              </div>
              <span className="admin-board-status">Protected</span>
            </div>

            <p className="admin-board-copy">
              Update the credentials for the currently signed-in admin account. The current password
              is required before a new hash is stored.
            </p>

            <div className="admin-settings-facts">
              <article>
                <span>Signed in as</span>
                <strong>{session.user.email ?? "Unknown"}</strong>
              </article>
              <article>
                <span>Access level</span>
                <strong>Administrator</strong>
              </article>
            </div>

            <AdminPasswordForm />
          </article>

          <div className="admin-settings-side">
            <article className="admin-mini-board is-purple">
              <p>Password policy</p>
              <strong>8 to 72 characters</strong>
              <span>New passwords must differ from the current one and be confirmed before saving.</span>
            </article>

            <article className="admin-board-card">
              <div className="admin-board-card-header">
                <div>
                  <p className="admin-board-kicker">Security notes</p>
                  <h2>Before you save</h2>
                </div>
              </div>

              <ul className="admin-settings-help">
                <li>Use a password that is unique to this admin account.</li>
                <li>Store the new credential anywhere your team keeps admin access records.</li>
                <li>After updating, use the new password for the next login session.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
