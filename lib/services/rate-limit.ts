import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env } from "@/lib/env";

type PolicyName = "contact" | "admin-products";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

const policies = {
  contact: {
    limit: 5,
    duration: "1 h" as const,
    windowMs: 60 * 60 * 1000,
    prefix: "garci-contact",
  },
  "admin-products": {
    limit: 30,
    duration: "10 m" as const,
    windowMs: 10 * 60 * 1000,
    prefix: "garci-admin-products",
  },
} satisfies Record<
  PolicyName,
  { limit: number; duration: "1 h" | "10 m"; windowMs: number; prefix: string }
>;

const localBuckets = new Map<string, { count: number; reset: number }>();

const upstashRedis =
  env.upstashUrl && env.upstashToken
    ? new Redis({
        url: env.upstashUrl,
        token: env.upstashToken,
      })
    : null;

const upstashLimiters = upstashRedis
  ? {
      contact: new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(policies.contact.limit, policies.contact.duration),
        prefix: policies.contact.prefix,
      }),
      "admin-products": new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(
          policies["admin-products"].limit,
          policies["admin-products"].duration,
        ),
        prefix: policies["admin-products"].prefix,
      }),
    }
  : null;

const fallbackLimit = (policyName: PolicyName, identifier: string): RateLimitResult => {
  const policy = policies[policyName];
  const key = `${policy.prefix}:${identifier}`;
  const now = Date.now();
  const existing = localBuckets.get(key);

  if (!existing || existing.reset <= now) {
    const reset = now + policy.windowMs;
    localBuckets.set(key, { count: 1, reset });
    return {
      success: true,
      limit: policy.limit,
      remaining: policy.limit - 1,
      reset,
    };
  }

  existing.count += 1;

  return {
    success: existing.count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(policy.limit - existing.count, 0),
    reset: existing.reset,
  };
};

export const getRequestIdentifier = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "anonymous";
  }

  return request.headers.get("x-real-ip") ?? "anonymous";
};

export const checkRateLimit = async (
  policyName: PolicyName,
  identifier: string,
): Promise<RateLimitResult> => {
  if (!upstashLimiters) {
    return fallbackLimit(policyName, identifier);
  }

  const limiter = upstashLimiters[policyName];
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
};
