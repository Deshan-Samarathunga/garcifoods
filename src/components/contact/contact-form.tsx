"use client";

import { useState } from "react";

import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { cn } from "@/lib/utils";

type SubmissionState =
  | { status: "idle"; message: string }
  | { status: "success" | "warning" | "error"; message: string };

const initialState: SubmissionState = { status: "idle", message: "" };

export function ContactForm() {
  const [submissionState, setSubmissionState] = useState<SubmissionState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="contact-form reveal"
      onSubmit={async (event) => {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        setIsSubmitting(true);
        setSubmissionState(initialState);

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: String(formData.get("name") ?? ""),
              email: String(formData.get("email") ?? ""),
              subject: String(formData.get("subject") ?? "Product inquiry"),
              message: String(formData.get("message") ?? ""),
              turnstileToken: String(formData.get("cf-turnstile-response") ?? ""),
            }),
          });

          const payload = (await response.json()) as {
            ok: boolean;
            error?: string;
            data?: { message?: string; warning?: string };
          };

          if (!response.ok || !payload.ok) {
            setSubmissionState({
              status: "error",
              message: payload.error ?? "We could not send your inquiry right now.",
            });
            return;
          }

          form.reset();
          setSubmissionState({
            status: payload.data?.warning ? "warning" : "success",
            message:
              payload.data?.warning ??
              payload.data?.message ??
              "Your inquiry has been sent. We'll get back to you soon.",
          });
        } catch {
          setSubmissionState({
            status: "error",
            message: "A network error prevented your message from being sent. Please try again.",
          });
        } finally {
          setIsSubmitting(false);
        }
      }}
      aria-describedby="contact-form-helper contact-form-note"
    >
      <div className="form-grid row g-3">
        <div className="col-12 col-md-6">
          <label className="form-field">
            <span>Name</span>
            <input className="form-control" type="text" name="name" placeholder="Your name" autoComplete="name" required />
          </label>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-field">
            <span>Email</span>
            <input className="form-control" type="email" name="email" placeholder="your@email.com" autoComplete="email" required />
          </label>
        </div>
      </div>

      <label className="form-field">
        <span>Subject</span>
        <input className="form-control" type="text" name="subject" defaultValue="Product inquiry" />
      </label>

      <label className="form-field">
        <span>Message</span>
        <textarea className="form-control" name="message" rows={6} placeholder="Tell us what you need" required></textarea>
      </label>

      <p className="contact-helper" id="contact-form-helper">
        This form sends your inquiry directly to the Garci team by email and stores the message securely for follow-up.
      </p>

      <TurnstileWidget siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

      <div className="contact-actions">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Inquiry"}
        </button>
      </div>
      <p
        className={cn(
          "contact-note",
          submissionState.status === "success" && "is-success",
          submissionState.status === "error" && "is-error",
        )}
        id="contact-form-note"
        aria-live="polite"
      >
        {submissionState.message}
      </p>
    </form>
  );
}
