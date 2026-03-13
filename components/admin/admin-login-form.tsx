"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { cn } from "@/lib/utils";

export function AdminLoginForm() {
  const router = useRouter();
  const callbackUrl = "/admin/products";
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="admin-login-card"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        setIsSubmitting(true);
        setErrorMessage("");

        startTransition(async () => {
          const result = await signIn("credentials", {
            redirect: false,
            callbackUrl,
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
            turnstileToken: String(formData.get("cf-turnstile-response") ?? ""),
          });

          if (!result || result.error) {
            setErrorMessage(
              "The admin login was not accepted. Check the credentials and bot check, then try again.",
            );
            setIsSubmitting(false);
            return;
          }

          router.replace(result.url ?? callbackUrl);
          router.refresh();
        });
      }}
    >
      <div className="admin-login-card-header">
        <div>
          <p className="admin-board-kicker">Admin sign-in</p>
          <h2>Access the control board</h2>
        </div>
        <p className="admin-board-copy">
          Use the seeded admin credentials from your environment configuration.
        </p>
      </div>

      <div className="admin-form-layout">
        <label className="admin-form-field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="admin-form-field">
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
      </div>

      <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

      <div className="admin-form-actions">
        <button className="btn admin-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </div>

      {errorMessage ? (
        <p className={cn("admin-feedback", "is-error")} aria-live="polite">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
