import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Vary": "Origin",
};

const attemptBuckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_KEY = 5;

function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    if (url.protocol === "http:" && (host === "localhost" || host === "127.0.0.1")) return true;
    if (url.protocol !== "https:") return false;
    if (host === "studybud-five-puce.vercel.app") return true;
    return host.startsWith("studybud-") && host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function jsonResponse(status: number, body: Record<string, unknown>, origin?: string | null) {
  const headers = new Headers(corsHeaders);
  if (origin && isAllowedOrigin(origin)) headers.set("Access-Control-Allow-Origin", origin);
  return new Response(JSON.stringify(body), { status, headers });
}

function consumeRateLimit(key: string): boolean {
  const now = Date.now();
  const current = attemptBuckets.get(key);
  if (!current || current.resetAt <= now) {
    attemptBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_PER_KEY;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    if (origin && !isAllowedOrigin(origin)) return new Response("Origin not allowed", { status: 403 });
    const headers = new Headers(corsHeaders);
    if (origin) headers.set("Access-Control-Allow-Origin", origin);
    return new Response("ok", { headers });
  }
  if (req.method !== "POST") return jsonResponse(405, { error: "Method not allowed." }, origin);
  if (origin && !isAllowedOrigin(origin)) return jsonResponse(403, { error: "Origin not allowed." });
  if (!req.headers.get("apikey")) return jsonResponse(401, { error: "Missing application key." }, origin);
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: "Account creation is not configured on the server." }, origin);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: "Invalid request body." }, origin);
  }
  if (!payload || typeof payload !== "object") {
    return jsonResponse(400, { error: "Invalid request body." }, origin);
  }

  const body = payload as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";

  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return jsonResponse(400, { error: "Enter a valid email address." }, origin);
  }
  if (password.length < 8 || password.length > 128) {
    return jsonResponse(400, { error: "Password must be between 8 and 128 characters." }, origin);
  }
  if (!fullName || fullName.length > 100) {
    return jsonResponse(400, { error: "Enter a name of 1–100 characters." }, origin);
  }

  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
  if (!consumeRateLimit("ip:" + forwardedFor) || !consumeRateLimit("email:" + email)) {
    return jsonResponse(429, { error: "Too many account attempts. Wait 10 minutes and try once more." }, origin);
  }

  try {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (
        message.includes("already registered") ||
        message.includes("already exists") ||
        message.includes("duplicate") ||
        message.includes("email_exists")
      ) {
        return jsonResponse(409, { error: "An account already exists for this email. Choose Sign in instead." }, origin);
      }
      console.error("StudyBud account creation failed:", error.code || "auth_admin_error");
      return jsonResponse(502, { error: "Supabase could not create the account. Try again once; if it persists, the server configuration needs attention." }, origin);
    }

    if (!data.user) {
      console.error("StudyBud account creation returned no user.");
      return jsonResponse(502, { error: "The account service returned no user record." }, origin);
    }

    return jsonResponse(201, { user: { id: data.user.id, email: data.user.email } }, origin);
  } catch (error) {
    console.error("StudyBud account endpoint failed:", error instanceof Error ? error.name : "UnknownError");
    return jsonResponse(500, { error: "The account service failed unexpectedly." }, origin);
  }
});
