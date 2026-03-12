import { supabase } from "../supabase.js";

/**
 * Ensures the public.users table is in sync with Supabase Auth data.
 * Used as a "lazy landing" mechanism to create/update profiles
 * without requiring custom backend signup logic.
 */
const performProfileSync = async (supaUser) => {
  if (!supaUser) return null;

  const meta = supaUser.user_metadata || {};
  const email = supaUser.email || meta.email || null;

  // Deterministic username generation
  const username =
    meta.username ||
    (email ? email.split("@")[0] : `user_${supaUser.id.slice(0, 8)}`);

  const profile = {
    id: supaUser.id,
    email,
    username,
    full_name: meta.full_name || meta.name || null,
    avatar_url: meta.avatar_url || meta.picture || null,
    bio: meta.bio || null,
    created_at: supaUser.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error(`[Sync Error] ${error.message}`);
    throw error;
  }
  return data;
};

/**
 * Controller: Sync the current authenticated user's profile.
 * High reliability endpoint called by frontend after auth events.
 */
export const syncProfileController = async (c) => {
  try {
    const supaUser = c.get("user");
    const data = await performProfileSync(supaUser);
    return c.json({ user: data });
  } catch (err) {
    return c.json(
      { error: "Profile synchronization failed", message: err.message },
      500,
    );
  }
};

/**
 * Controller: Fetch current user profile from DB.
 */
export const getMeController = async (c) => {
  try {
    const supaUser = c.get("user");
    if (!supaUser) return c.json({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", supaUser.id)
      .maybeSingle();

    // If no DB profile exists, self-heal by syncing now
    const user = profile || (await performProfileSync(supaUser));

    return c.json({ user });
  } catch (err) {
    return c.json(
      { error: "Failed to fetch user state", message: err.message },
      500,
    );
  }
};
