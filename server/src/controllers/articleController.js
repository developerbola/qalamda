import { supabase } from "../supabase.js";

// Create article
export const createArticleController = async (c) => {
  const userPayload = c.get("user");
  const body = await c.req.json();

  if (!userPayload) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (typeof body?.title !== "string" || body.title.trim().length === 0) {
    return c.json({ error: "Title is required" }, 400);
  }
  if (typeof body?.content !== "string" || body.content.trim().length === 0) {
    return c.json({ error: "Content is required" }, 400);
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t) => typeof t === "string")
    : [];

  // Generate slug from title
  const slug =
    body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  // Calculate reading time (approx 200 words per minute)
  const wordCount = body.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const publishedAt = body.isPublished ? new Date() : null;

  // Insert article
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .insert({
      author_id: userPayload.id,
      title: body.title.trim(),
      slug,
      content: body.content.trim(),
      excerpt: typeof body.excerpt === "string" && body.excerpt.trim().length > 0 ? body.excerpt.trim() : null,
      cover_image: body.coverImage || null,
      likes_count: 0,
      reading_time_minutes: readingTime,
      is_published: body.isPublished,
      published_at: publishedAt,
    })
    .select("*")
    .maybeSingle();

  if (articleError) {
    return c.json({ error: articleError.message }, 500);
  }

  // Handle tags
  if (tags.length > 0) {
    for (const tagName of tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Get or create tag
      const { data: tag, error: tagError } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", tagSlug)
        .maybeSingle();

      if (tagError) {
        throw tagError;
      }

      let tagId;
      if (!tag) {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({
            name: tagName,
            slug: tagSlug,
          })
          .select("id")
          .maybeSingle();
        tagId = newTag.id;
      } else {
        tagId = tag.id;
      }

      // Link article to tag
      await supabase.from("article_tags").insert({
        article_id: article.id,
        tag_id: tagId,
      });
    }
  }

  // Get article with author info
  const { data: fullArticle } = await supabase
    .from("articles")
    .select("*")
    .eq("id", article.id)
    .maybeSingle();

  return c.json({ article: fullArticle });
};

// Get all articles (feed)
export const getArticlesController = async (c) => {
  const { page = "1", limit = "10", tag, author, search } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);
  // If tag filter provided, resolve article IDs for the tag
  let articleIds = null;
  if (tag) {
    const { data: t } = await supabase.from("tags").select("id").eq("slug", tag).maybeSingle();
    if (!t) return c.json({ articles: [], total: 0, page: parseInt(page), totalPages: 0 });
    const { data: ats } = await supabase.from("article_tags").select("article_id").eq("tag_id", t.id);
    articleIds = (ats || []).map((a) => a.article_id);
    if (articleIds.length === 0) return c.json({ articles: [], total: 0, page: parseInt(page), totalPages: 0 });
  }

  const selectStr = `id, title, slug, excerpt, cover_image, reading_time_minutes, published_at, likes_count, comments_count, author_id, users(username, full_name, avatar_url)`;

  // Resolve author filter to author_id if provided
  let authorId = null;
  if (author) {
    const { data: user, error: userErr } = await supabase.from("users").select("id").eq("username", author).maybeSingle();
    if (userErr || !user) return c.json({ articles: [], total: 0, page: parseInt(page), totalPages: 0 });
    authorId = user.id;
  }

  // Build query
  let query = supabase.from("articles").select(selectStr, { count: "exact" }).eq("is_published", true);
  if (authorId) query = query.eq("author_id", authorId);
  if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  if (articleIds) query = query.in("id", articleIds);

  const end = offset + parseInt(limit) - 1;
  const { data: articles, error, count } = await query.order("published_at", { ascending: false }).range(offset, end);
  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    articles: articles || [],
    total: count || 0,
    page: parseInt(page),
    totalPages: Math.ceil((count || 0) / parseInt(limit)),
  });
};

// Get article by slug
export const getArticleController = async (c) => {
  const { slug } = c.req.param();
  const { data: article, error } = await supabase
    .from("articles")
    .select(`id, title, slug, excerpt, cover_image, content, reading_time_minutes, published_at, likes_count, comments_count, author_id, users(username, full_name, avatar_url, bio)`)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !article) return c.json({ error: "Article not found" }, 404);

  // Get tags via article_tags
  const { data: articleTags } = await supabase.from("article_tags").select("tags(id, name, slug)").eq("article_id", article.id);
  const tags = (articleTags || []).map((at) => at.tags);

  return c.json({ article: { ...article, tags } });
};

// Update article
export const updateArticleController = async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();
  const body = await c.req.json();

  // First check if user owns the article
  const { data: existing, error: existingError } = await supabase
    .from("articles")
    .select("author_id")
    .eq("id", articleId)
    .maybeSingle();

  if (existingError || !existing) {
    return c.json({ error: "Article not found" }, 404);
  }

  if (existing.author_id !== userPayload.id) {
    return c.json({ error: "Not authorized to update this article" }, 403);
  }

  // Manual validation replacing Zod
  const validated = {};
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0 || body.title.length > 500) {
      return c.json({ error: "Invalid title" }, 400);
    }
    validated.title = body.title;
  }
  if (body.content !== undefined) {
    if (typeof body.content !== "string" || body.content.trim().length === 0) {
      return c.json({ error: "Invalid content" }, 400);
    }
    validated.content = body.content;
  }
  if (body.excerpt !== undefined) {
    if (body.excerpt !== null && typeof body.excerpt !== "string") {
      return c.json({ error: "Invalid excerpt" }, 400);
    }
    validated.excerpt = body.excerpt;
  }
  if (body.coverImage !== undefined) {
    if (body.coverImage !== null && typeof body.coverImage !== "string") {
      return c.json({ error: "Invalid coverImage" }, 400);
    }
    if (body.coverImage) {
      try {
        // basic URL validation
        new URL(body.coverImage);
      } catch (e) {
        return c.json({ error: "Invalid coverImage URL" }, 400);
      }
    }
    validated.coverImage = body.coverImage;
  }
  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === "string")) {
      return c.json({ error: "Invalid tags" }, 400);
    }
    validated.tags = body.tags;
  }
  if (body.isPublished !== undefined) {
    if (typeof body.isPublished !== "boolean") {
      return c.json({ error: "Invalid isPublished value" }, 400);
    }
    validated.isPublished = body.isPublished;
  }

  const updates = {};
  if (validated.title) updates.title = validated.title;
  if (validated.content) updates.content = validated.content;
  if (validated.excerpt !== undefined) updates.excerpt = validated.excerpt;
  if (validated.coverImage !== undefined)
    updates.cover_image = validated.coverImage;
  if (validated.isPublished !== undefined) {
    updates.is_published = validated.isPublished;
    updates.published_at = validated.isPublished ? new Date() : null;
  }
  updates.updated_at = new Date();

  // Update article
  const { data: updated, error: updateError } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", articleId)
    .select("*")
    .maybeSingle();

  if (updateError) {
    return c.json({ error: updateError.message }, 500);
  }

  // Update tags if provided
  if (validated.tags !== undefined) {
    // Remove existing tags
    await supabase.from("article_tags").delete().eq("article_id", articleId);

    // Add new tags
    for (const tagName of validated.tags) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // Get or create tag
      const { data: tag, error: tagError } = await supabase
        .from("tags")
        .select("id")
        .eq("slug", tagSlug)
        .maybeSingle();

      if (tagError) {
        throw tagError;
      }

      let tagId;
      if (!tag) {
        const { data: newTag } = await supabase
          .from("tags")
          .insert({
            name: tagName,
            slug: tagSlug,
          })
          .select("id")
          .maybeSingle();
        tagId = newTag.id;
      } else {
        tagId = tag.id;
      }

      await supabase.from("article_tags").insert({
        article_id: articleId,
        tag_id: tagId,
      });
    }
  }

  return c.json({ article: updated });
};

// Delete article
export const deleteArticleController = async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();

  // Check ownership
  const { data: existing, error: existingError } = await supabase
    .from("articles")
    .select("author_id")
    .eq("id", articleId)
    .maybeSingle();

  if (existingError || !existing) {
    return c.json({ error: "Article not found" }, 404);
  }

  if (existing.author_id !== userPayload.id) {
    return c.json({ error: "Not authorized to delete this article" }, 403);
  }

  await supabase.from("articles").delete().eq("id", articleId);
  return c.json({ message: "Article deleted" });
};
