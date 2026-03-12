export type AdminLikeSession = {
  user?: {
    id?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
} | null;

export const hasAdminRole = (session: AdminLikeSession) => {
  return session?.user?.role === "ADMIN";
};

export const assertAdminRole = (session: AdminLikeSession) => {
  if (!hasAdminRole(session)) {
    throw new Error("Admin access is required.");
  }
};
