"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { type SiteContactSettings, type SiteContactSettingsSnapshot } from "@/lib/site";
import { cn } from "@/lib/utils";

type ContactSettingsFieldErrors = Partial<Record<keyof SiteContactSettings, string[]>>;

type ContactSettingsResponse =
  | {
      ok: true;
      data: {
        message: string;
        settings: SiteContactSettingsSnapshot;
      };
    }
  | {
      ok: false;
      error?: string;
      details?: {
        fieldErrors?: ContactSettingsFieldErrors;
      };
    };

type AdminContactSettingsFormProps = {
  initialSettings: SiteContactSettingsSnapshot;
};

const toFormState = (settings: SiteContactSettingsSnapshot): SiteContactSettings => {
  return {
    mobile: settings.mobile,
    telephone: settings.telephone,
    address: settings.address,
    mapUrl: settings.mapUrl,
    mapEmbedUrl: settings.mapEmbedUrl,
  };
};

const isSameFormState = (left: SiteContactSettings, right: SiteContactSettings) => {
  return (
    left.mobile === right.mobile &&
    left.telephone === right.telephone &&
    left.address === right.address &&
    left.mapUrl === right.mapUrl &&
    left.mapEmbedUrl === right.mapEmbedUrl
  );
};

export function AdminContactSettingsForm({ initialSettings }: AdminContactSettingsFormProps) {
  const router = useRouter();
  const initialFormState = toFormState(initialSettings);
  const [formState, setFormState] = useState<SiteContactSettings>(initialFormState);
  const [baseline, setBaseline] = useState<SiteContactSettings>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<ContactSettingsFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasUnsavedChanges = !isSameFormState(formState, baseline);

  const handleFieldChange = (field: keyof SiteContactSettings, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

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
            const response = await fetch("/api/admin/settings/contact", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formState),
            });

            const payload = (await response.json().catch(() => null)) as ContactSettingsResponse | null;
            const failedPayload = payload && !payload.ok ? payload : null;

            if (!response.ok || !payload?.ok) {
              setFieldErrors(failedPayload?.details?.fieldErrors ?? {});
              setErrorMessage(failedPayload?.error ?? "The contact settings could not be updated.");
              return;
            }

            const nextState = toFormState(payload.data.settings);
            setFormState(nextState);
            setBaseline(nextState);
            setSuccessMessage(payload.data.message);
            router.refresh();
          } catch {
            setErrorMessage("The contact settings could not be updated.");
          } finally {
            setIsSubmitting(false);
          }
        });
      }}
    >
      <div className="admin-form-layout">
        <label className="admin-form-field">
          <span>Mobile</span>
          <input
            value={formState.mobile}
            onChange={(event) => handleFieldChange("mobile", event.target.value)}
            placeholder="+94 76 9299976"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-invalid={fieldErrors.mobile?.length ? true : undefined}
          />
          {fieldErrors.mobile?.[0] ? <p className="admin-field-error">{fieldErrors.mobile[0]}</p> : null}
        </label>

        <label className="admin-form-field">
          <span>Telephone</span>
          <input
            value={formState.telephone}
            onChange={(event) => handleFieldChange("telephone", event.target.value)}
            placeholder="+94 33 2221376"
            autoComplete="tel"
            inputMode="tel"
            required
            aria-invalid={fieldErrors.telephone?.length ? true : undefined}
          />
          {fieldErrors.telephone?.[0] ? (
            <p className="admin-field-error">{fieldErrors.telephone[0]}</p>
          ) : null}
        </label>

        <label className="admin-form-field is-full">
          <span>Address</span>
          <input
            value={formState.address}
            onChange={(event) => handleFieldChange("address", event.target.value)}
            placeholder="No. 272, Wathumulla Rd, Asgiriya, Gampaha"
            autoComplete="street-address"
            required
            aria-invalid={fieldErrors.address?.length ? true : undefined}
          />
          {fieldErrors.address?.[0] ? <p className="admin-field-error">{fieldErrors.address[0]}</p> : null}
        </label>

        <label className="admin-form-field is-full">
          <span>Map link URL</span>
          <input
            type="url"
            value={formState.mapUrl}
            onChange={(event) => handleFieldChange("mapUrl", event.target.value)}
            placeholder="https://maps.google.com/?q=..."
            required
            aria-invalid={fieldErrors.mapUrl?.length ? true : undefined}
          />
          {fieldErrors.mapUrl?.[0] ? <p className="admin-field-error">{fieldErrors.mapUrl[0]}</p> : null}
        </label>

        <label className="admin-form-field is-full">
          <span>Map embed URL</span>
          <textarea
            rows={4}
            value={formState.mapEmbedUrl}
            onChange={(event) => handleFieldChange("mapEmbedUrl", event.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
            required
            aria-invalid={fieldErrors.mapEmbedUrl?.length ? true : undefined}
          ></textarea>
          {fieldErrors.mapEmbedUrl?.[0] ? (
            <p className="admin-field-error">{fieldErrors.mapEmbedUrl[0]}</p>
          ) : null}
        </label>
      </div>

      <p className="admin-board-copy">
        Use the public Google Maps URL for the office link and paste the iframe `src` value for the
        embedded map.
      </p>

      <div className="admin-form-actions">
        <button className="btn admin-btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save contact details"}
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
