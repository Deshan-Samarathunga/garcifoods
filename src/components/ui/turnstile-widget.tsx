"use client";

import Script from "next/script";

type TurnstileWidgetProps = {
  siteKey?: string;
};

export function TurnstileWidget({ siteKey }: TurnstileWidgetProps) {
  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-size="flexible"
      ></div>
    </>
  );
}
