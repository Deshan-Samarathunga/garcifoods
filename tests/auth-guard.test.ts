import { assertAdminRole, hasAdminRole } from "@/lib/auth-guards";

describe("auth guard behavior", () => {
  it("accepts admin sessions", () => {
    expect(hasAdminRole({ user: { role: "ADMIN" } })).toBe(true);
  });

  it("rejects non-admin sessions", () => {
    expect(hasAdminRole({ user: { role: "USER" } })).toBe(false);
    expect(() => assertAdminRole({ user: { role: "USER" } })).toThrow("Admin access is required.");
  });
});
