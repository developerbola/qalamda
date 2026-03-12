import { supabase } from "../supabase.js";

// Register controller
export const registerController = async (c) => {
  try {
    const body = await c.req.json();

    // Validate input
    if (!body.email || !body.username || !body.password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if email or username already exists
    const { data: emailExists, error: emailError } = await supabase
      .from("users")
      .select("id")
      .eq("email", body.email)
      .single();

    const { data: usernameExists, error: usernameError } = await supabase
      .from("users")
      .select("id")
      .eq("username", body.username)
      .single();

    if (emailError && !emailError.message.includes("No data")) {
      throw emailError;
    }
    if (usernameError && !usernameError.message.includes("No data")) {
      throw usernameError;
    }

    if (emailExists) {
      return c.json({ error: "Email already registered" }, 400);
    }
    if (usernameExists) {
      return c.json({ error: "Username already taken" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.api.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          username: body.username,
          full_name: body.fullName,
        },
      },
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    // Upsert into users table
    const profile = {
      id: data.user.id,
      email: data.user.email,
      username: body.username,
      full_name: body.fullName || null,
      avatar_url: null,
      bio: null,
      created_at: data.user.created_at,
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("users")
      .upsert(profile, { onConflict: "id" })
      .select()
      .single();

    if (insertErr) {
      return c.json({ error: insertErr.message }, 500);
    }

    return c.json({ user: inserted, token: data.access_token });
  } catch (error) {
    return c.json({ error: error.message || "Registration failed" }, 500);
  }
};

// Return current user based on Bearer token
export const getMeController = async (c) => {
  try {
    const authHeader = c.req.headers.get("authorization") || c.req.header?.("authorization");
    if (!authHeader) return c.json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace(/^Bearer\s+/i, "");

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) return c.json({ error: "Unauthorized" }, 401);

    const { data: profile } = await supabase.from("users").select("*").eq("id", userData.user.id).single();

    return c.json({ user: profile || {
      id: userData.user.id,
      email: userData.user.email,
      username: userData.user.user_metadata?.username || (userData.user.email ? userData.user.email.split('@')[0] : null),
      full_name: userData.user.user_metadata?.full_name || userData.user.user_metadata?.name || null,
      avatar_url: userData.user.user_metadata?.avatar_url || userData.user.user_metadata?.picture || null,
      created_at: userData.user.created_at,
    } });
  } catch (err) {
    return c.json({ error: err.message || "Unauthorized" }, 401);
  }
};

// Login controller
export const loginController = async (c) => {
  try {
    const body = await c.req.json();

    if (!body.email || !body.password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    const { data, error } = await supabase.auth.api.signIn({
      email: body.email,
      password: body.password,
    });

    if (error) {
      return c.json({ error: error.message }, 400);
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: userProfile.username,
        full_name: userProfile.full_name,
        created_at: data.user.created_at,
      },
      token: data.access_token,
    });
  } catch (error) {
    return c.json({ error: error.message || "Login failed" }, 500);
  }
};

// Logout controller
export const logoutController = async (c) => {
  try {
    await supabase.auth.api.signOut(c.req, c.res);
    return c.json({ message: "Logged out successfully" });
  } catch (error) {
    return c.json({ error: error.message || "Logout failed" }, 500);
  }
};

// Ensure a canonical users row exists for the authenticated user
export const syncProfileController = async (c) => {
  try {
    const supaUser = c.get("user");
    if (!supaUser) return c.json({ error: "Unauthorized" }, 401);

    const meta = supaUser.user_metadata || {};
    const email = supaUser.email || meta.email || null;
    const username = meta.username || (email ? email.split("@")[0] : null);
    const full_name = meta.full_name || meta.name || null;
    const avatar_url = meta.avatar_url || meta.picture || null;

    const profile = {
      id: supaUser.id,
      email,
      username,
      full_name,
      avatar_url,
      bio: null,
      created_at: supaUser.created_at || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("users")
      .upsert(profile, { onConflict: "id" })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 500);

    return c.json({ user: data });
  } catch (err) {
    return c.json({ error: err.message || "Sync failed" }, 500);
  }
};
