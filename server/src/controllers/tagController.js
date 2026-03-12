import { supabase } from "../supabase.js";

// Get all tags (simpler: return tags list)
export const getTagsController = async (c) => {
  const { data: tags, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true })
    .limit(50);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ tags });
};

// Get articles by tag
export const getArticlesByTagController = async (c) => {
  const { tagSlug } = c.req.param();
  const { page = "1", limit = "10" } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Find tag
  const { data: tag, error: tagError } = await supabase
    .from("tags")
    .select("id")
    .eq("slug", tagSlug)
    .single();

  if (tagError || !tag) return c.json({ articles: [], total: 0, page: parseInt(page), totalPages: 0 });

  // Get article IDs for this tag
  const { data: articleTags } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tag.id);

  const articleIds = (articleTags || []).map((at) => at.article_id);
  if (articleIds.length === 0) return c.json({ articles: [], total: 0, page: parseInt(page), totalPages: 0 });

  // Fetch articles with author info
  const selectStr = `id, title, slug, excerpt, cover_image, reading_time_minutes, published_at, likes_count, comments_count, author_id, users(username, full_name, avatar_url)`;

  const { data: articles, error: articlesError, count } = await supabase
    .from("articles")
    .select(selectStr, { count: "exact" })
    .in("id", articleIds)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(parseInt(limit))
    .offset(offset);

  if (articlesError) return c.json({ error: articlesError.message }, 500);

  return c.json({
    articles,
    total: count || 0,
    page: parseInt(page),
    totalPages: Math.ceil((count || 0) / parseInt(limit)),
  });
};