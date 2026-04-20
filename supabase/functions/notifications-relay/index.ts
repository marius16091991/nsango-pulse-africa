// Edge function relay sécurisée par X-API-Key
// Permet à votre serveur d'hébergement de :
//   GET /pending  → liste les emails en attente (max 50)
//   POST /mark    → marquer un email comme envoyé ou échoué
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = req.headers.get("x-api-key");
  const expected = Deno.env.get("NOTIFICATIONS_RELAY_API_KEY");
  if (!expected || apiKey !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const action = url.pathname.split("/").pop();

  try {
    if (req.method === "GET" && (action === "pending" || action === "notifications-relay")) {
      const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);
      const { data, error } = await supabase
        .from("email_outbox")
        .select("id, to_email, to_name, subject, html_body, text_body, category, metadata, attempts, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return new Response(JSON.stringify({ emails: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "mark") {
      const body = await req.json();
      const { id, status, error: errMsg } = body;
      if (!id || !["sent", "failed"].includes(status)) {
        return new Response(JSON.stringify({ error: "id and status (sent|failed) required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const fn = status === "sent" ? "mark_email_sent" : "mark_email_failed";
      const params = status === "sent" ? { _id: id } : { _id: id, _error: errMsg || "unknown" };
      const { error } = await supabase.rpc(fn, params);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found. Use GET /pending or POST /mark" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});