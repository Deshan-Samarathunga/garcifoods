import { jsonOk } from "@/lib/http";
import { getPublicSiteContactSettings, toSiteContactSettings } from "@/lib/services/site-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getPublicSiteContactSettings();
  return jsonOk(toSiteContactSettings(settings));
}
