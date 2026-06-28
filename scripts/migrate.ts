import "dotenv/config";
import fs from "fs";
import path from "path";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const sqlPath = path.join(process.cwd(), "scripts", "schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("Running migration...");
  await pool.query(sql);
  console.log("Migration complete!");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
