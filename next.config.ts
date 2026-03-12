import type { NextConfig } from "next";

const outputMode = process.env.NEXT_OUTPUT_MODE === "standalone" ? "standalone" : undefined;

const nextConfig: NextConfig = {
  output: outputMode,
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /@opentelemetry\/instrumentation/ },
      { module: /@fastify\/otel/ },
      { module: /@prisma\/instrumentation/ },
    ];

    return config;
  },
};

export default nextConfig;
