"use client";

import { startTransition, useState } from "react";

import { cn } from "@/lib/utils";

type PasswordFormState = {
  currentPassword?: string[];
  newPassword?: string[];
  confirmPassword?: string[];
};

type PasswordChangeResponse =
  | {
      ok: true;
      data: {
        message: string;
      };
    }
  | {
      ok: false;
      error?: string;
      details?: {
        fieldErrors?: PasswordFormState;
      };
    };

export function AdminPasswordForm() {
  const [fieldErrors, setFieldErrors] = useState<PasswordFormState>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="admin-settings-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        setIsSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");
        setFieldErrors({});

        startTransition(async () => {
          const response = await fetch("/api/admin/account/password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              currentPassword: String(formData.get("currentPassword") ?? ""),
              newPassword: String(formData.get("newPassword") ?? ""),
              confirmPassword: String(formData.get("confirmPassword") ?? ""),
            }),
          });

          const payload = (await response.json().catch(() => null)) as PasswordChangeResponse | null;
          const failedPayload = payload && !payload.ok ? payload : null;

          if (!response.ok || !payload?.ok) {
            setFieldErrors(failedPayload?.details?.fieldErrors ?? {});
            setErrorMessage(failedPayload?.error ?? "The password could not be updated.");
            setIsSubmitting(false);
            return;
          }

          form.reset();
          setSuccessMessage(payload.data.message);
          setIsSubmitting(false);
        });
      }}
    >
      <div className="admin-form-layout">
        <label className="admin-form-field">
          <span>Current password</span>
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={fieldErrors.currentPassword?.length ? true : undefined}
          />
          {fieldErrors.currentPassword?.[0] ? (
            <p className="admin-field-error">{fieldErrors.currentPassword[0]}</p>
          ) : null}
        </label>

        <label className="admin-form-field">
          <span>New password</span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={fieldErrors.newPassword?.length ? true : undefined}
          />
          {fieldErrors.newPassword?.[0] ? (
            <p className="admin-field-error">{fieldErrors.newPassword[0]}</p>
          ) : null}
        </label>

        <label className="admin-form-field is-full">
          <span>Confirm new password</span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={fieldErrors.confirmPassword?.length ? true : undefined}
          />
          {fieldErrors.confirmPassword?.[0] ? (
            <p className="admin-field-error">{fieldErrors.confirmPassword[0]}</p>
          ) : null}
        </label>
      </div>

      <div className="admin-form-actions">
        <button className="btn admin-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
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
