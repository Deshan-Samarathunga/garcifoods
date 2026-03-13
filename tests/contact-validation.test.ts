import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/contact/route";

describe("contact api validation", () => {
  it("rejects an invalid payload before persistence", async () => {
    const request = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "A",
        email: "not-an-email",
        subject: "Hi",
        message: "short",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("Please review the form fields");
  });
});
