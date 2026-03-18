import { describe, expect, it } from "vitest";

import { toTelephoneHref } from "@/lib/site";
import {
  adminSiteContactSettingsSchema,
  adminSiteReviewWidgetSettingsSchema,
} from "@/lib/validations/site-settings";

const validTrustindexWidgetCode = `
<script defer async src="https://cdn.trustindex.io/loader.js?ver=1"></script>
<div class="ti-widget"><template id="trustindex-google-widget-html"><div>Widget</div></template></div>
`;

describe("site settings behavior", () => {
  it("accepts a valid admin contact settings payload", () => {
    const parsed = adminSiteContactSettingsSchema.safeParse({
      mobile: "+94 76 9299976",
      telephone: "+94 33 2221376",
      address: "No. 272, Wathumulla Rd, Asgiriya, Gampaha",
      mapUrl: "https://maps.google.com/?q=Garci",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=test",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid map link URL", () => {
    const parsed = adminSiteContactSettingsSchema.safeParse({
      mobile: "+94 76 9299976",
      telephone: "+94 33 2221376",
      address: "No. 272, Wathumulla Rd, Asgiriya, Gampaha",
      mapUrl: "not-a-url",
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=test",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.mapUrl).toContain("Enter a valid map link URL.");
  });

  it("accepts a valid Trustindex review widget payload", () => {
    const parsed = adminSiteReviewWidgetSettingsSchema.safeParse({
      reviewsWidgetEnabled: true,
      reviewsWidgetCode: validTrustindexWidgetCode,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects an enabled review widget without embed code", () => {
    const parsed = adminSiteReviewWidgetSettingsSchema.safeParse({
      reviewsWidgetEnabled: true,
      reviewsWidgetCode: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.reviewsWidgetCode).toContain(
      "Paste the Trustindex embed code before enabling the widget.",
    );
  });

  it("formats phone numbers for tel links", () => {
    expect(toTelephoneHref("+94 76 9299976")).toBe("tel:+94769299976");
    expect(toTelephoneHref("033 2221376")).toBe("tel:0332221376");
  });
});
