import { supabase } from "../supabase.js";

export const authMiddleware = async (c, next) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.api.getUserByCookie(c.req);

    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", user);
    await next();
  } catch (error) {
    return c.json({ error: "Unauthorized" }, 401);
  }
};
