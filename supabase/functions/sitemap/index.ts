import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // Récup base URL
  const { data: settings } = await supabase
    .from("seo_settings")
    .select("key, value")
    .eq("key", "canonical_base_url")
    .maybeSingle();
  const base = (settings?.value || "https://nsango-mag.lovable.app").replace(/\/$/, "");

  // Static routes
  const staticRoutes = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/actualites", priority: "0.9", changefreq: "daily" },
    { loc: "/business", priority: "0.8", changefreq: "weekly" },
    { loc: "/portraits", priority: "0.8", changefreq: "weekly" },
    { loc: "/culture", priority: "0.8", changefreq: "weekly" },
    { loc: "/interviews", priority: "0.8", changefreq: "weekly" },
    { loc: "/evenements", priority: "0.7", changefreq: "weekly" },
    { loc: "/podcasts", priority: "0.7", changefreq: "weekly" },
    { loc: "/videos", priority: "0.8", changefreq: "weekly" },
    { loc: "/magazine", priority: "0.8", changefreq: "monthly" },
    { loc: "/premium", priority: "0.6", changefreq: "monthly" },
    { loc: "/a-propos", priority: "0.5", changefreq: "yearly" },
  ];

  const [articlesRes, videosRes, magsRes, pagesRes] = await Promise.all([
    supabase.from("articles").select("id, updated_at").eq("status", "published").order("updated_at", { ascending: false }).limit(5000),
    supabase.from("videos").select("id, updated_at").eq("status", "published").order("updated_at", { ascending: false }).limit(2000),
    supabase.from("magazine_issues").select("id, updated_at").in("status", ["current", "archived"]).order("updated_at", { ascending: false }).limit(500),
    supabase.from("pages").select("slug, updated_at").eq("visible", true).limit(500),
  ]);

  const urls: string[] = [];

  for (const r of staticRoutes) {
    urls.push(`<url><loc>${base}${r.loc}</loc><changefreq>${r.changefreq}</changefreq><priority>${r.priority}</priority></url>`);
  }
  for (const a of articlesRes.data || []) {
    urls.push(`<url><loc>${base}/article/${a.id}</loc><lastmod>${new Date(a.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
  }
  for (const v of videosRes.data || []) {
    urls.push(`<url><loc>${base}/videos/${v.id}</loc><lastmod>${new Date(v.updated_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`);
  }
  for (const m of magsRes.data || []) {
    urls.push(`<url><loc>${base}/magazine/${m.id}</loc><lastmod>${new Date(m.updated_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`);
  }
  for (const p of pagesRes.data || []) {
    urls.push(`<url><loc>${base}/${escape(p.slug)}</loc><lastmod>${new Date(p.updated_at).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
});