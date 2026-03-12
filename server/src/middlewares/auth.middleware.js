import { supabase } from "../supabase.js";

const extractBearerToken = (c) => {
  const authHeader = c.req.header("Authorization") || c.req.header("authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
};

export const authMiddleware = async (c, next) => {
  try {
    const token = extractBearerToken(c);

    if (!token) {
      console.warn("[Auth Middleware] No token found in request headers");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error("[Auth Middleware] Supabase error:", error?.message || "User not found");
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", data.user);
    await next();
  } catch (err) {
    console.error("[Auth Middleware] Unexpected error:", err.message);
    return c.json({ error: "Unauthorized" }, 401);
  }
};
