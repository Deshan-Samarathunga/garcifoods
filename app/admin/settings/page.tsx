import type { Metadata } from "next";
import Link from "next/link";

import { AdminContactSettingsForm } from "@/components/admin/admin-contact-settings-form";
import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { requireAdminPageSession } from "@/lib/auth";
import { getAdminSiteContactSettings } from "@/lib/services/site-settings";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Manage Garci contact details and admin account security.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatSavedDate = (value: string | null) => {
  if (!value) {
    return "Not saved yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "Unknown";
  }

  return dateFormatter.format(date);
};

export default async function AdminSettingsPage() {
  const [session, contactSettings] = await Promise.all([
    requireAdminPageSession(),
    getAdminSiteContactSettings(),
  ]);

  return (
    <main className="admin-main">
      <section className="admin-page-shell admin-view-shell admin-settings-shell">
        <div className="admin-settings-grid">
          <div className="admin-settings-side">
            <article className="admin-board-card">
              <div className="admin-board-card-header">
                <div>
                  <p className="admin-board-kicker">Public site content</p>
                  <h2>Contact details</h2>
                </div>
                <Link className="admin-board-link" href="/contact" target="_blank" rel="noreferrer">
                  Open contact page
                </Link>
              </div>

              <p className="admin-board-copy">
                Update the phone numbers, office address, map link, and embedded Google Map used on
                the public contact page.
              </p>

              <div className="admin-settings-facts">
                <article>
                  <span>Current mobile</span>
                  <strong>{contactSettings.mobile}</strong>
                </article>
                <article>
                  <span>Last saved</span>
                  <strong>{formatSavedDate(contactSettings.updatedAt)}</strong>
                </article>
              </div>

              <AdminContactSettingsForm initialSettings={contactSettings} />
            </article>

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
          </div>

          <div className="admin-settings-side">
            <article className="admin-mini-board is-purple">
              <p>Contact source</p>
              <strong>{contactSettings.isDefault ? "Built-in defaults" : "Database-backed"}</strong>
              <span>
                {contactSettings.isDefault
                  ? "Save the form once to move the contact page onto admin-managed data."
                  : "Phone, address, and map details now come directly from the admin panel."}
              </span>
            </article>

            <article className="admin-board-card">
              <div className="admin-board-card-header">
                <div>
                  <p className="admin-board-kicker">Map guidance</p>
                  <h2>What to paste</h2>
                </div>
              </div>

              <ul className="admin-settings-help">
                <li>Use the normal Google Maps share link for the clickable office address.</li>
                <li>Paste the iframe `src` value into the embed field so the map card matches.</li>
                <li>Refresh any public page tab you already have open after saving new details.</li>
              </ul>
            </article>

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
