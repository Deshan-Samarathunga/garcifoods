import { env } from "@/lib/env";

type TurnstileVerification = {
  success: boolean;
  skipped?: boolean;
  error?: string;
};

export const verifyTurnstileToken = async (
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileVerification> => {
  if (!env.turnstileSecretKey) {
    if (env.isProduction) {
      return {
        success: false,
        error: "Bot protection is not configured on the server.",
      };
    }

    return {
      success: true,
      skipped: true,
    };
  }

  if (!token) {
    return {
      success: false,
      error: "Please complete the bot check before submitting the form.",
    };
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: env.turnstileSecretKey,
      response: token,
      remoteip: remoteIp ?? "",
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as { success?: boolean; "error-codes"?: string[] };

  if (!data.success) {
    return {
      success: false,
      error: "Bot verification failed. Please try again.",
    };
  }

  return { success: true };
};
