"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { type SiteReviewWidgetSettingsSnapshot } from "@/lib/site";

type TrustindexReviewWidgetProps = {
  settings: SiteReviewWidgetSettingsSnapshot;
};

type WidgetState = "idle" | "loading" | "ready" | "error";

declare global {
  interface Window {
    __garciTrustindexLoaderPromise__?: Promise<void>;
  }
}

const widgetRenderedSelector = ".ti-widget-container, .ti-reviews-container, .ti-review-item";

const loadTrustindexScript = (src: string) => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.__garciTrustindexLoaderPromise__) {
    return window.__garciTrustindexLoaderPromise__;
  }

  const existingScript = document.querySelector<HTMLScriptElement>("script[data-trustindex-loader='true']");

  if (existingScript?.dataset.loaded === "true" && existingScript.src === src) {
    const resolvedPromise = Promise.resolve();
    window.__garciTrustindexLoaderPromise__ = resolvedPromise;
    return resolvedPromise;
  }

  window.__garciTrustindexLoaderPromise__ = new Promise<void>((resolve, reject) => {
    const script = existingScript?.src === src ? existingScript : document.createElement("script");

    if (script !== existingScript) {
      script.async = true;
      script.defer = true;
      script.src = src;
      script.dataset.trustindexLoader = "true";
    }

    const handleLoad = () => {
      script.dataset.loaded = "true";
      resolve();
    };

    const handleError = () => {
      window.__garciTrustindexLoaderPromise__ = undefined;
      script.remove();
      reject(new Error("The Trustindex loader could not be loaded."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!script.isConnected) {
      document.body.append(script);
      return;
    }

    if (script.dataset.loaded === "true") {
      resolve();
    }
  });

  return window.__garciTrustindexLoaderPromise__;
};

export function TrustindexReviewWidget({ settings }: TrustindexReviewWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [widgetState, setWidgetState] = useState<WidgetState>("idle");

  useEffect(() => {
    const widget = widgetRef.current;

    if (!widget) {
      return;
    }

    let isActive = true;
    let timeoutId: number | null = null;

    const clearVerificationTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const hasRenderedWidget = () => Boolean(widget.querySelector(widgetRenderedSelector));

    const finalizeLoad = () => {
      clearVerificationTimer();

      if (!isActive) {
        return;
      }

      setWidgetState(hasRenderedWidget() ? "ready" : "error");
    };

    const queueVerification = () => {
      clearVerificationTimer();
      timeoutId = window.setTimeout(finalizeLoad, 3200);
    };

    const mutationObserver =
      "MutationObserver" in window
        ? new MutationObserver(() => {
            if (!hasRenderedWidget() || !isActive) {
              return;
            }

            clearVerificationTimer();
            setWidgetState("ready");
          })
        : null;

    mutationObserver?.observe(widget, { childList: true, subtree: true });

    const beginLoad = async () => {
      if (!isActive) {
        return;
      }

      if (hasRenderedWidget()) {
        setWidgetState("ready");
        return;
      }

      setWidgetState("loading");

      try {
        await loadTrustindexScript(settings.reviewsWidgetLoaderUrl);
        queueVerification();
      } catch {
        if (isActive) {
          setWidgetState("error");
        }
      }
    };

    if ("IntersectionObserver" in window) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visibleEntry = entries.find((entry) => entry.isIntersecting);

          if (!visibleEntry) {
            return;
          }

          void beginLoad();
          intersectionObserver.disconnect();
        },
        {
          rootMargin: "220px 0px",
        },
      );

      intersectionObserver.observe(widget);

      return () => {
        isActive = false;
        clearVerificationTimer();
        mutationObserver?.disconnect();
        intersectionObserver.disconnect();
      };
    }

    void beginLoad();

    return () => {
      isActive = false;
      clearVerificationTimer();
      mutationObserver?.disconnect();
    };
  }, [settings.reviewsWidgetLoaderUrl, settings.reviewsWidgetMarkup]);

  return (
    <div
      ref={widgetRef}
      className="review-widget-shell reveal reveal-delay-1"
      data-review-widget=""
      data-widget-loaded={widgetState}
    >
      <div className="review-widget-host" dangerouslySetInnerHTML={{ __html: settings.reviewsWidgetMarkup }} />

      {widgetState === "error" ? (
        <div className="review-fallback" data-review-fallback="">
          <p>
            Reviews are temporarily unavailable. Contact Garci directly while the live widget
            reconnects.
          </p>
          <Link className="btn btn-secondary" href="/contact">
            Contact Garci
          </Link>
        </div>
      ) : null}
    </div>
  );
}
