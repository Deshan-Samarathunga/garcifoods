import { describe, expect, it } from "vitest";

import {
  buildTrustindexEmbedCode,
  defaultTrustindexLoaderUrl,
  normalizeTrustindexEmbedCode,
} from "@/lib/trustindex";

describe("trustindex helpers", () => {
  it("normalizes a full embed snippet", () => {
    const parsed = normalizeTrustindexEmbedCode(`
      <script defer async src="https://cdn.trustindex.io/loader.js?ver=1"></script>
      <div class="ti-widget"><template id="trustindex-widget"><div>Widget</div></template></div>
    `);

    expect(parsed.ok).toBe(true);

    if (parsed.ok) {
      expect(parsed.data.loaderUrl).toBe("https://cdn.trustindex.io/loader.js?ver=1");
      expect(parsed.data.widgetMarkup).toContain('class="ti-widget"');
    }
  });

  it("defaults to the official Trustindex loader when only widget markup is pasted", () => {
    const parsed = normalizeTrustindexEmbedCode(
      `<div class="ti-widget"><template id="trustindex-widget"><div>Widget</div></template></div>`,
    );

    expect(parsed.ok).toBe(true);

    if (parsed.ok) {
      expect(parsed.data.loaderUrl).toBe(defaultTrustindexLoaderUrl);
      expect(parsed.data.embedCode).toBe(
        buildTrustindexEmbedCode(defaultTrustindexLoaderUrl, parsed.data.widgetMarkup),
      );
    }
  });

  it("rejects non-Trustindex loader scripts", () => {
    const parsed = normalizeTrustindexEmbedCode(`
      <script defer async src="https://example.com/loader.js"></script>
      <div class="ti-widget"><template id="trustindex-widget"><div>Widget</div></template></div>
    `);

    expect(parsed.ok).toBe(false);

    if (!parsed.ok) {
      expect(parsed.error).toContain("official Trustindex loader");
    }
  });
});
