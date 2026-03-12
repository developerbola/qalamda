import { supabase } from "../supabase.js";

// Toggle bookmark
export const toggleBookmarkController = async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();

  // Check if article exists
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .single();

  if (articleError || !article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Check if already bookmarked
  const { data: existing, error: existingError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userPayload.userId)
    .eq("article_id", articleId)
    .single();

  if (existingError && !existingError.message.includes("No data")) {
    throw existingError;
  }

  if (existing) {
    // Remove bookmark
    await supabase
      .from("bookmarks")
      .delete()
      .eq("id", existing.id);

    return c.json({ bookmarked: false });
  } else {
    // Add bookmark
    await supabase
      .from("bookmarks")
      .insert({
        user_id: userPayload.userId,
        article_id: articleId,
      });

    return c.json({ bookmarked: true });
  }
};

// Get user's bookmarks
export const getBookmarksController = async (c) => {
  const userPayload = c.get("user");

  const bookmarks = await supabase
    .from("bookmarks")
    .select(`
      bookmarks.*,
      articles.*,
      users.username as author_username,
      users.full_name as author_full_name,
      users.avatar_url as author_avatar_url,
      likes_count,
      comments_count
    `)
    .eq("user_id", userPayload.userId)
    .eq("articles.is_published", true)
    .order("created_at", { ascending: false });

  return c.json({ bookmarks });
};