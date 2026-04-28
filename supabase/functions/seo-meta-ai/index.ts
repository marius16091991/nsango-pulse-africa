// Génère title + description SEO optimisés via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { title, content, category } = await req.json();
    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ error: "title required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const excerpt = (content || "").toString().replace(/<[^>]+>/g, "").slice(0, 1500);

    const prompt = `Tu es un expert SEO francophone pour un magazine premium africain.
Article :
Titre : "${title}"
${category ? `Catégorie : ${category}` : ""}
Extrait : ${excerpt}

Génère :
1. Un META TITLE optimisé (50-60 caractères, accrocheur, avec mots-clés)
2. Une META DESCRIPTION (140-158 caractères, incite au clic, naturelle)
3. 5 mots-clés séparés par virgules

Réponds STRICTEMENT en JSON: {"title":"...","description":"...","keywords":"..."}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Tu réponds uniquement en JSON valide, sans markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI gateway error", detail: text }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const json = await aiRes.json();
    const raw = json?.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed: any = {};
    try { parsed = JSON.parse(cleaned); } catch { parsed = {}; }

    return new Response(JSON.stringify({
      title: parsed.title || "",
      description: parsed.description || "",
      keywords: parsed.keywords || "",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});