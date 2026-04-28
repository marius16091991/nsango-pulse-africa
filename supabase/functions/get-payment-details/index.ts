// Edge function : retourne les coordonnées de paiement (PayPal, Mobile Money, IBAN…)
// uniquement après vérification qu'une subscription_request "pending" existe pour ce
// payment_reference + email. Cela évite l'exposition publique des coordonnées sensibles.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Mapping payment_method -> clés à exposer dans premium_settings
const KEY_MAP: Record<string, string[]> = {
  orange_money: ["orange_money_number", "orange_money_name"],
  mtn_money: ["mtn_money_number", "mtn_money_name"],
  paypal: ["paypal_email"],
  bank_transfer: ["bank_name", "bank_account_name", "bank_iban", "bank_swift"],
};

const ALL_KEYS = [...new Set(Object.values(KEY_MAP).flat()), "support_email"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const reference = String(body?.reference ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const paymentMethod = String(body?.payment_method ?? "").trim();

    if (!reference || !email || !paymentMethod) {
      return json({ error: "reference, email and payment_method required" }, 400);
    }
    if (!KEY_MAP[paymentMethod]) {
      return json({ error: "invalid payment_method" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Vérifier qu'une demande existe avec cette référence + email + méthode
    const { data: request, error: reqErr } = await admin
      .from("subscription_requests")
      .select("id, status, payment_method")
      .eq("payment_reference", reference)
      .ilike("email", email)
      .eq("payment_method", paymentMethod)
      .maybeSingle();

    if (reqErr) return json({ error: "Lookup failed" }, 500);
    if (!request) return json({ error: "Aucune demande correspondante trouvée" }, 404);

    // Récupérer uniquement les clés correspondant au mode de paiement choisi
    const wantedKeys = [...KEY_MAP[paymentMethod], "support_email"];
    const { data: settings, error: setErr } = await admin
      .from("premium_settings")
      .select("key, value")
      .in("key", wantedKeys);

    if (setErr) return json({ error: "Settings lookup failed" }, 500);

    const result: Record<string, string> = {};
    (settings || []).forEach((s) => { result[s.key] = s.value; });

    return json({ ok: true, settings: result });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});