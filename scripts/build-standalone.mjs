import { spawnSync } from "node:child_process";

process.env.NEXT_OUTPUT_MODE = "standalone";

const build = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const pack = spawnSync("npm", ["run", "package:standalone"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(pack.status ?? 0);
