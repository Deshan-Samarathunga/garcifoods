const TRUSTINDEX_LOADER_HOSTNAME = "cdn.trustindex.io";
const TRUSTINDEX_LOADER_PATHNAME = "/loader.js";

export const defaultTrustindexLoaderUrl = "https://cdn.trustindex.io/loader.js?ver=1";

export type TrustindexEmbedConfig = {
  loaderUrl: string;
  widgetMarkup: string;
  embedCode: string;
};

const scriptTagPattern = /<script\b[^>]*\bsrc=(["'])(.*?)\1[^>]*>\s*<\/script>/gi;

const isTrustindexLoaderUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === TRUSTINDEX_LOADER_HOSTNAME &&
      parsed.pathname === TRUSTINDEX_LOADER_PATHNAME
    );
  } catch {
    return false;
  }
};

const extractScriptSources = (value: string) =>
  Array.from(value.matchAll(scriptTagPattern))
    .map((match) => match[2]?.trim())
    .filter((candidate): candidate is string => Boolean(candidate));

const stripScriptTags = (value: string) => value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").trim();

export const buildTrustindexEmbedCode = (loaderUrl: string, widgetMarkup: string) => {
  const normalizedMarkup = widgetMarkup.trim();

  if (!normalizedMarkup) {
    return "";
  }

  return `<script defer async src="${loaderUrl}"></script>\n${normalizedMarkup}`;
};

export const normalizeTrustindexEmbedCode = (
  value: string,
): { ok: true; data: TrustindexEmbedConfig } | { ok: false; error: string } => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return {
      ok: false,
      error: "Paste the Trustindex embed code generated for your website widget.",
    };
  }

  const scriptSources = extractScriptSources(normalizedValue);

  if (/<script\b/i.test(normalizedValue) && scriptSources.length === 0) {
    return {
      ok: false,
      error: "Use the official Trustindex website widget snippet without modifying the script tag.",
    };
  }

  if (scriptSources.some((candidate) => !isTrustindexLoaderUrl(candidate))) {
    return {
      ok: false,
      error: "Use the official Trustindex loader script hosted on cdn.trustindex.io.",
    };
  }

  const loaderUrl = scriptSources[0] ?? defaultTrustindexLoaderUrl;

  if (!isTrustindexLoaderUrl(loaderUrl)) {
    return {
      ok: false,
      error: "Use the official Trustindex loader script hosted on cdn.trustindex.io.",
    };
  }

  const widgetMarkup = stripScriptTags(normalizedValue);

  if (!widgetMarkup) {
    return {
      ok: false,
      error: "The embed code is missing the Trustindex widget markup.",
    };
  }

  if (/<script\b/i.test(widgetMarkup)) {
    return {
      ok: false,
      error: "Remove any extra script tags and paste only the Trustindex widget snippet.",
    };
  }

  if (!/ti-widget|trustindex/i.test(widgetMarkup)) {
    return {
      ok: false,
      error: "The pasted code does not look like a Trustindex website widget.",
    };
  }

  return {
    ok: true,
    data: {
      loaderUrl,
      widgetMarkup,
      embedCode: buildTrustindexEmbedCode(loaderUrl, widgetMarkup),
    },
  };
};
