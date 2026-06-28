import type { Metadata } from "next";
import Link from "next/link";

import { AdminContactSettingsForm } from "@/components/admin/admin-contact-settings-form";
import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { AdminReviewWidgetSettingsForm } from "@/components/admin/admin-review-widget-settings-form";
import { requireAdminPageSession } from "@/lib/auth";
import {
  getAdminSiteContactSettings,
  getAdminSiteReviewWidgetSettings,
} from "@/lib/services/site-settings";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Manage Garci contact details, Trustindex reviews, and admin account security.",
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
  const [session, contactSettings, reviewWidgetSettings] = await Promise.all([
    requireAdminPageSession(),
    getAdminSiteContactSettings(),
    getAdminSiteReviewWidgetSettings(),
  ]);
  const hasConfiguredReviewWidget = Boolean(reviewWidgetSettings.reviewsWidgetMarkup.trim());
  const reviewWidgetStatus = reviewWidgetSettings.reviewsWidgetEnabled
    ? "Live on homepage"
    : hasConfiguredReviewWidget
      ? "Saved but hidden"
      : "Using built-in fallback";

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
                  <p className="admin-board-kicker">Homepage content</p>
                  <h2>Reviews widget</h2>
                </div>
                <Link className="admin-board-link" href="/#reviews" target="_blank" rel="noreferrer">
                  Open reviews section
                </Link>
              </div>

              <p className="admin-board-copy">
                Connect the homepage reviews section to Trustindex and keep the embed snippet
                editable from the admin panel.
              </p>

              <div className="admin-settings-facts">
                <article>
                  <span>Widget status</span>
                  <strong>{reviewWidgetStatus}</strong>
                </article>
                <article>
                  <span>Last saved</span>
                  <strong>{formatSavedDate(reviewWidgetSettings.updatedAt)}</strong>
                </article>
              </div>

              <AdminReviewWidgetSettingsForm initialSettings={reviewWidgetSettings} />
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
                  <p className="admin-board-kicker">Trustindex setup</p>
                  <h2>What to paste</h2>
                </div>
              </div>

              <ul className="admin-settings-help">
                <li>Open your Trustindex dashboard and copy the website widget embed snippet.</li>
                <li>Paste the full snippet here. The system keeps the official loader and widget markup.</li>
                <li>Enable the widget only after the snippet has been saved successfully.</li>
              </ul>
            </article>

            <article className="admin-mini-board is-purple">
              <p>Review source</p>
              <strong>{reviewWidgetStatus}</strong>
              <span>
                {hasConfiguredReviewWidget
                  ? "The homepage can swap between the live Trustindex widget and the built-in fallback without code changes."
                  : "Until a widget is configured, the homepage keeps showing the built-in Garci reviews carousel."}
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

            <article className="admin-mini-board is-purple">
              <p>Password policy</p>
              <strong>8 to 72 characters</strong>
              <span>New passwords must differ from the current one and be confirmed before saving.</span>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
