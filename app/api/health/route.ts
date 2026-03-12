import { jsonOk } from "@/lib/http";

export async function GET() {
  return jsonOk({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
