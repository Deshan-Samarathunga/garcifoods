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
      className="contact-form reveal"
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
            setErrorMessage("The admin login was not accepted. Check the credentials and bot check, then try again.");
            setIsSubmitting(false);
            return;
          }

          router.replace(result.url ?? callbackUrl);
          router.refresh();
        });
      }}
    >
      <label className="form-field">
        <span>Email</span>
        <input className="form-control" name="email" type="email" autoComplete="email" required />
      </label>
      <label className="form-field">
        <span>Password</span>
        <input className="form-control" name="password" type="password" autoComplete="current-password" required />
      </label>

      <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

      <div className="contact-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </div>
      <p className={cn("contact-note", errorMessage && "is-error")} aria-live="polite">
        {errorMessage}
      </p>
    </form>
  );
}
