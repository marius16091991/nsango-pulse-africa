// Admin users management edge function
// Uses service role to create/disable/enable/delete auth users.
// Verifies caller is admin before any action.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify admin role
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden — admin only" }, 403);

    const body = await req.json();
    const action = body?.action as string;

    switch (action) {
      case "create": {
        const { email, password, display_name, role, priority } = body;
        if (!email || !password) return json({ error: "email and password required" }, 400);
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { display_name: display_name || email },
        });
        if (error) return json({ error: error.message }, 400);
        const newId = data.user!.id;
        if (role) {
          await admin.from("user_roles").insert({
            user_id: newId,
            role,
            priority: priority ?? 0,
          });
        }
        return json({ ok: true, user_id: newId });
      }

      case "disable": {
        const { user_id } = body;
        if (!user_id) return json({ error: "user_id required" }, 400);
        if (user_id === user.id) return json({ error: "Cannot disable yourself" }, 400);
        // ban for 100 years
        const { error } = await admin.auth.admin.updateUserById(user_id, {
          ban_duration: "876000h",
        });
        if (error) return json({ error: error.message }, 400);
        await admin.from("profiles").update({ is_active: false }).eq("user_id", user_id);
        return json({ ok: true });
      }

      case "enable": {
        const { user_id } = body;
        if (!user_id) return json({ error: "user_id required" }, 400);
        const { error } = await admin.auth.admin.updateUserById(user_id, {
          ban_duration: "none",
        });
        if (error) return json({ error: error.message }, 400);
        await admin.from("profiles").update({ is_active: true }).eq("user_id", user_id);
        return json({ ok: true });
      }

      case "delete": {
        const { user_id } = body;
        if (!user_id) return json({ error: "user_id required" }, 400);
        if (user_id === user.id) return json({ error: "Cannot delete yourself" }, 400);
        const { error } = await admin.auth.admin.deleteUser(user_id);
        if (error) return json({ error: error.message }, 400);
        return json({ ok: true });
      }

      case "list_emails": {
        // returns map user_id -> email for given ids (or all)
        const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (error) return json({ error: error.message }, 400);
        const map: Record<string, { email: string; banned_until: string | null }> = {};
        for (const u of data.users) {
          map[u.id] = { email: u.email ?? "", banned_until: (u as { banned_until?: string | null }).banned_until ?? null };
        }
        return json({ users: map });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});