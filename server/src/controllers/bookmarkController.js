import { supabase } from "../supabase.js";

// Toggle bookmark
export const toggleBookmarkController = async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();

  if (!userPayload) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Check if article exists
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError || !article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Check if already bookmarked
  const { data: existing, error: existingError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userPayload.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (existingError) {
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
        user_id: userPayload.id,
        article_id: articleId,
      });

    return c.json({ bookmarked: true });
  }
};

// Get user's bookmarks
export const getBookmarksController = async (c) => {
  const userPayload = c.get("user");

  if (!userPayload) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      article_id,
      articles(
        id,
        title,
        slug,
        excerpt,
        cover_image,
        reading_time_minutes,
        published_at,
        likes_count,
        comments_count,
        author_id,
        users(username, full_name, avatar_url)
      )
    `)
    .eq("user_id", userPayload.id)
    .eq("articles.is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  // Flatten the response so the frontend receives a clean list of articles
  const bookmarkedArticles = (bookmarks || [])
    .filter(b => b.articles)
    .map(b => b.articles);

  return c.json({ bookmarks: bookmarkedArticles });
};
