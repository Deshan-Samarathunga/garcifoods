"use client";

import { useEffect } from "react";

import { captureException } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    captureException(error, { area: "app.global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="page-main">
          <section className="section">
            <div className="container narrow">
              <div className="contact-form">
                <p className="eyebrow">Application Error</p>
                <h1>Garci could not render this page.</h1>
                <p>Refresh the page or try again shortly.</p>
                <button className="btn btn-primary" type="button" onClick={reset}>
                  Reload
                </button>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
