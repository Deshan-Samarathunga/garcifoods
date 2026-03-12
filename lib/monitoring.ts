import * as Sentry from "@sentry/nextjs";

export const captureException = (error: unknown, context?: Record<string, unknown>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};
