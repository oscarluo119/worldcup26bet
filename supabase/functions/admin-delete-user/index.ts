import { createClient } from "npm:@supabase/supabase-js@2";
import { DeleteUserError, deleteUserAsAdmin } from "./handler.ts";

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ code: "server_not_configured", message: "server_not_configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: authData, error: authError } = await userClient.auth.getUser();
    if (authError || !authData?.user?.id) {
      throw new DeleteUserError("session_required", "session_required", 401);
    }

    const body = await req.json().catch(() => ({}));
    const targetUserId = String(body?.targetUserId || "").trim();

    const result = await deleteUserAsAdmin({
      async getActorProfile(userId) {
        const { data, error } = await adminClient
          .from("profiles")
          .select("id, is_admin")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      async getTargetProfile(userId) {
        const { data, error } = await adminClient
          .from("profiles")
          .select("id, is_admin")
          .eq("id", userId)
          .maybeSingle();
        if (error) throw error;
        return data;
      },
      async countAdmins() {
        const { count, error } = await adminClient
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_admin", true);
        if (error) throw error;
        return count || 0;
      },
      async deleteAuthUser(userId) {
        const { error } = await adminClient.auth.admin.deleteUser(userId);
        if (error) throw error;
      },
    }, {
      actorUserId: authData.user.id,
      targetUserId,
    });

    return jsonResponse(result, 200);
  } catch (error) {
    if (error instanceof DeleteUserError) {
      return jsonResponse({ code: error.code, message: error.message }, error.status);
    }

    if (error instanceof Error) {
      return jsonResponse({ code: "unknown_error", message: error.message }, 500);
    }

    return jsonResponse({ code: "unknown_error", message: "unknown_error" }, 500);
  }
});
