import { describe, expect, it } from "vitest";

import { GET } from "@/app/api/products/route";

describe("products api contract", () => {
  it("returns the expected public product shape", async () => {
    const response = await GET();
    const payload = (await response.json()) as {
      ok: boolean;
      data: Array<{
        id: string;
        slug: string;
        name: string;
        description: string;
        features: string[];
        tags: string[];
        imageUrl: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
      }>;
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.data.length).toBeGreaterThan(0);
    expect(payload.data[0]).toMatchObject({
      slug: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      imageUrl: expect.any(String),
      isActive: expect.any(Boolean),
    });
    expect(Array.isArray(payload.data[0]?.features)).toBe(true);
    expect(Array.isArray(payload.data[0]?.tags)).toBe(true);
  });
});
