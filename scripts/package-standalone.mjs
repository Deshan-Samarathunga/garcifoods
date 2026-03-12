import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "dist", "standalone");

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

const copyRecursive = (source, target) => {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });

    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }

    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
};

copyRecursive(path.join(root, ".next", "standalone"), outputDir);
copyRecursive(path.join(root, ".next", "static"), path.join(outputDir, ".next", "static"));
copyRecursive(path.join(root, "public"), path.join(outputDir, "public"));
copyRecursive(path.join(root, "package.json"), path.join(outputDir, "package.json"));
