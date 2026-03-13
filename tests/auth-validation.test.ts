import { describe, expect, it } from "vitest";

import { adminPasswordChangeSchema } from "@/lib/validations/auth";

describe("auth validation", () => {
  it("accepts a valid admin password change payload", () => {
    const parsed = adminPasswordChangeSchema.safeParse({
      currentPassword: "current-pass-123",
      newPassword: "new-pass-456",
      confirmPassword: "new-pass-456",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects a reused password", () => {
    const parsed = adminPasswordChangeSchema.safeParse({
      currentPassword: "same-pass-123",
      newPassword: "same-pass-123",
      confirmPassword: "same-pass-123",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.newPassword).toContain(
      "Choose a new password that differs from the current one.",
    );
  });

  it("rejects a mismatched confirmation", () => {
    const parsed = adminPasswordChangeSchema.safeParse({
      currentPassword: "current-pass-123",
      newPassword: "new-pass-456",
      confirmPassword: "other-pass-789",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.confirmPassword).toContain(
      "New password confirmation does not match.",
    );
  });
});
