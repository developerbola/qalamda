import { z } from "zod";

// Auth middleware to protect routes
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

// ==================== AUTH CONTROLLERS ====================

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

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        username: body.username,
        full_name: body.fullName,
        created_at: data.user.created_at,
      },
      token: data.access_token,
    });
  } catch (error) {
    return c.json({ error: error.message || "Registration failed" }, 500);
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