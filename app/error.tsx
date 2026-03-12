"use client";

import Link from "next/link";
import { useEffect } from "react";

import { captureException } from "@/lib/monitoring";

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    captureException(error, { area: "app.error" });
  }, [error]);

  return (
    <main className="page-main">
      <section className="section">
        <div className="container narrow">
          <div className="contact-form">
            <p className="eyebrow">Something Went Wrong</p>
            <h1>We hit an unexpected error.</h1>
            <p>Please try the page again. If the issue continues, contact Garci directly.</p>
            <div className="contact-actions">
              <button className="btn btn-primary" type="button" onClick={reset}>
                Try Again
              </button>
              <Link className="btn btn-secondary" href="/contact">
                Contact Garci
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
