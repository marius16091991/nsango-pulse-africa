import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data } = await supabase
    .from("seo_settings")
    .select("key, value")
    .in("key", ["robots_txt", "canonical_base_url"]);

  const map = new Map<string, string>((data || []).map((r: any) => [r.key, r.value]));
  const base = (map.get("canonical_base_url") || "https://nsango-mag.lovable.app").replace(/\/$/, "");
  let body = map.get("robots_txt") || `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml`;

  // Garantir au moins une directive Sitemap
  if (!/sitemap:/i.test(body)) {
    body += `\n\nSitemap: ${base}/sitemap.xml`;
  }

  return new Response(body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
});