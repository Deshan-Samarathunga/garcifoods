"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { type SiteReviewWidgetSettings, type SiteReviewWidgetSettingsSnapshot } from "@/lib/site";
import { cn } from "@/lib/utils";

type ReviewWidgetSettingsFieldErrors = Partial<Record<keyof SiteReviewWidgetSettings, string[]>>;

type ReviewWidgetSettingsResponse =
  | {
      ok: true;
      data: {
        message: string;
        settings: SiteReviewWidgetSettingsSnapshot;
      };
    }
  | {
      ok: false;
      error?: string;
      details?: {
        fieldErrors?: ReviewWidgetSettingsFieldErrors;
      };
    };

type AdminReviewWidgetSettingsFormProps = {
  initialSettings: SiteReviewWidgetSettingsSnapshot;
};

const toFormState = (settings: SiteReviewWidgetSettingsSnapshot): SiteReviewWidgetSettings => {
  return {
    reviewsWidgetEnabled: settings.reviewsWidgetEnabled,
    reviewsWidgetCode: settings.reviewsWidgetCode,
  };
};

const isSameFormState = (left: SiteReviewWidgetSettings, right: SiteReviewWidgetSettings) => {
  return (
    left.reviewsWidgetEnabled === right.reviewsWidgetEnabled &&
    left.reviewsWidgetCode === right.reviewsWidgetCode
  );
};

export function AdminReviewWidgetSettingsForm({
  initialSettings,
}: AdminReviewWidgetSettingsFormProps) {
  const router = useRouter();
  const initialFormState = toFormState(initialSettings);
  const [formState, setFormState] = useState<SiteReviewWidgetSettings>(initialFormState);
  const [baseline, setBaseline] = useState<SiteReviewWidgetSettings>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<ReviewWidgetSettingsFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasUnsavedChanges = !isSameFormState(formState, baseline);

  return (
    <form
      className="admin-settings-form"
      onSubmit={(event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");
        setFieldErrors({});

        startTransition(async () => {
          try {
            const response = await fetch("/api/admin/settings/reviews", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formState),
            });

            const payload = (await response.json().catch(() => null)) as ReviewWidgetSettingsResponse | null;
            const failedPayload = payload && !payload.ok ? payload : null;

            if (!response.ok || !payload?.ok) {
              setFieldErrors(failedPayload?.details?.fieldErrors ?? {});
              setErrorMessage(
                failedPayload?.error ?? "The review widget settings could not be updated.",
              );
              return;
            }

            const nextState = toFormState(payload.data.settings);
            setFormState(nextState);
            setBaseline(nextState);
            setSuccessMessage(payload.data.message);
            router.refresh();
          } catch {
            setErrorMessage("The review widget settings could not be updated.");
          } finally {
            setIsSubmitting(false);
          }
        });
      }}
    >
      <div className="admin-form-layout">
        <label className="admin-form-toggle is-full">
          <input
            type="checkbox"
            checked={formState.reviewsWidgetEnabled}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                reviewsWidgetEnabled: event.target.checked,
              }));
            }}
          />
          <span>Show the Trustindex widget on the homepage reviews section</span>
        </label>

        <label className="admin-form-field is-full admin-code-field">
          <span>Trustindex embed code</span>
          <textarea
            rows={12}
            value={formState.reviewsWidgetCode}
            onChange={(event) => {
              setFormState((current) => ({
                ...current,
                reviewsWidgetCode: event.target.value,
              }));
              setFieldErrors((current) => ({
                ...current,
                reviewsWidgetCode: undefined,
              }));
            }}
            placeholder={`<script defer async src="https://cdn.trustindex.io/loader.js?ver=1"></script>\n<div class="ti-widget">...</div>`}
            aria-invalid={fieldErrors.reviewsWidgetCode?.length ? true : undefined}
          ></textarea>
          {fieldErrors.reviewsWidgetCode?.[0] ? (
            <p className="admin-field-error">{fieldErrors.reviewsWidgetCode[0]}</p>
          ) : null}
        </label>
      </div>

      <p className="admin-board-copy">
        Paste the full website widget snippet from Trustindex. The admin panel stores the loader URL
        and widget markup so the homepage can render it without code edits.
      </p>

      <div className="admin-form-actions">
        <button className="btn admin-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save review widget"}
        </button>
        <button
          className="btn admin-btn-secondary"
          type="button"
          disabled={isSubmitting || !hasUnsavedChanges}
          onClick={() => {
            setFormState(baseline);
            setFieldErrors({});
            setErrorMessage("");
            setSuccessMessage("");
          }}
        >
          Reset changes
        </button>
      </div>

      {successMessage ? (
        <p className={cn("admin-feedback", "is-success")} aria-live="polite">
          {successMessage}
        </p>
      ) : null}

      {errorMessage ? (
        <p className={cn("admin-feedback", "is-error")} aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
