import { supabase } from "../supabase.js";

// Get user profile by username
export const getUserController = async (c) => {
  const { username } = c.req.param();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return c.json({ error: "User not found" }, 404);
  }

  // Get follower/following counts
  const [{ count: followersCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id),
    ]);

  return c.json({
    user: {
      ...user,
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
    },
  });
};

// Update user profile
export const updateProfileController = async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Validate input
  if (!body.fullName && !body.bio && !body.avatarUrl && !body.username) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const updates = {};
  if (body.fullName) updates.full_name = body.fullName;
  if (body.bio) updates.bio = body.bio;
  if (body.avatarUrl) updates.avatar_url = body.avatarUrl;

  if (body.username) {
    const newUsername = body.username.trim().toLowerCase();

    // Check if username is taken
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", newUsername)
      .neq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      return c.json({ error: "Username is already taken" }, 400);
    }
    updates.username = newUsername;
  }

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user: updatedUser });
};

// Follow a user
export const followController = async (c) => {
  const user = c.get("user");
  const { userId } = c.req.param();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (userId === user.id) {
    return c.json({ error: "Cannot follow yourself" }, 400);
  }

  // Check if target user exists
  const { data: targetUser, error: targetError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (targetError || !targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  // Check if already following
  const { data: existing, error: followError } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .maybeSingle();

  if (followError) {
    throw followError;
  }

  if (existing) {
    return c.json({ error: "Already following this user" }, 400);
  }

  // Create follow relationship
  await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: userId,
  });

  return c.json({ message: "Followed successfully" });
};

// Unfollow a user
export const unfollowController = async (c) => {
  const user = c.get("user");
  const { userId } = c.req.param();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", userId);

  if (error) {
    return c.json({ error: "Not following this user" }, 400);
  }

  return c.json({ message: "Unfollowed successfully" });
};

// Check follow status
export const followStatusController = async (c) => {
  const user = c.get("user");
  const { userId } = c.req.param();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [isFollowing, { count: followersCount }, { count: followingCount }] =
    await Promise.all([
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle(),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId),
      supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId),
    ]);

  return c.json({
    is_following: !!isFollowing?.data,
    followers_count: followersCount || 0,
    following_count: followingCount || 0,
  });
};

// Get users I am following
export const getFollowingController = async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: following, error } = await supabase
    .from("follows")
    .select(`
      following_id,
      users:following_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("follower_id", user.id);

  if (error) {
    console.error("Error fetching following users:", error);
    return c.json({ error: "Failed to fetch following users" }, 500);
  }

  const formattedFollowing = following.map((f) => f.users);

  return c.json({ following: formattedFollowing });
};
