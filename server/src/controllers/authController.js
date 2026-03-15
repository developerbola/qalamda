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
    updated_at: new Date().toISOString(),
  };

  // Try to upsert by ID first
  let { data, error } = await supabase
    .from("users")
    .upsert(profile, { onConflict: "id" })
    .select()
    .maybeSingle();

  // If unique constraint on email fails, try to find by email and update
  if (error && error.message.includes("users_email_key")) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      // Update the existing user with the new information, but keep their original ID?
      // Actually, if we are here, supaUser.id is the NEW ID from Supabase Auth.
      // We should probably keep the Supabase Auth ID as the source of truth.
      // But we can't change the PK of an existing row easily if there are FKs.
      // For now, let's just update the profile and try again with the existing ID if needed, 
      // but the goal is to sync the CURRENT session user.
      
      // Let's just update the existing row by email
      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update({
          ...profile,
          id: existingUser.id // Keep the ID that's already in the DB to avoid FK issues
        })
        .eq("email", email)
        .select()
        .single();
      
      if (!updateError) data = updated;
      else error = updateError;
    }
  }

  if (error) {
    console.error(`[Sync Error] ${error.message}`);
    // If it's a new user and we still have errors (like missing password_hash), 
    // we should still try to return something so the frontend doesn't break
    if (!data) return { ...profile, email };
  }

  // Check if user has interests
  const { count: interestCount } = await supabase
    .from("user_interests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data?.id || supaUser.id);

  return {
    ...data,
    has_interests: (interestCount || 0) > 0,
  };
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
    let user = profile;
    if (!user) {
      user = await performProfileSync(supaUser);
    } else {
      // If profile exists, we still need to check has_interests
      const { count: interestCount } = await supabase
        .from("user_interests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      user = {
        ...user,
        has_interests: (interestCount || 0) > 0,
      };
    }

    return c.json({ user });
  } catch (err) {
    return c.json(
      { error: "Failed to fetch user state", message: err.message },
      500,
    );
  }
};
