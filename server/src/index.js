import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { z } from "zod";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", prettyJSON());

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Qalamda API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// ==================== AUTH MIDDLEWARE ====================

// Auth middleware to protect routes
const authMiddleware = async (c, next) => {
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

// ==================== AUTH ROUTES ====================

// Register
app.post("/api/auth/register", async (c) => {
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
});

// ==================== USER ROUTES ====================

// Get user profile by username
app.get("/api/users/:username", async (c) => {
  const { username } = c.req.param();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error) {
    return c.json({ error: "User not found" }, 404);
  }

  // Get follower/following counts
  const [followersCount, followingCount] = await Promise.all([
    supabase
      .from("follows")
      .select("id")
      .eq("following_id", user.id)
      .count("exact"),
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .count("exact"),
  ]);

  return c.json({
    user: {
      ...user,
      followers_count: followersCount.count,
      following_count: followingCount.count,
    },
  });
});

// Update user profile
app.patch("/api/users/profile", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Validate input
  if (!body.fullName && !body.bio && !body.avatarUrl) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const updates = {};
  if (body.fullName) updates.full_name = body.fullName;
  if (body.bio) updates.bio = body.bio;
  if (body.avatarUrl) updates.avatar_url = body.avatarUrl;

  const { data: updatedUser, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ user: updatedUser });
});

// Follow a user
app.post("/api/users/:userId/follow", authMiddleware, async (c) => {
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
    .single();

  if (targetError || !targetUser) {
    return c.json({ error: "User not found" }, 404);
  }

  // Check if already following
  const { data: existing, error: followError } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", userId)
    .single();

  if (followError && !followError.message.includes("No data")) {
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
});

// Unfollow a user
app.delete("/api/users/:userId/follow", authMiddleware, async (c) => {
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
});

// Check follow status
app.get("/api/users/:userId/follow-status", authMiddleware, async (c) => {
  const user = c.get("user");
  const { userId } = c.req.param();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [isFollowing, followersCount, followingCount] = await Promise.all([
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .single(),
    supabase
      .from("follows")
      .select("id")
      .eq("following_id", userId)
      .count("exact"),
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userId)
      .count("exact"),
  ]);

  return c.json({
    is_following: !!isFollowing,
    followers_count: followersCount.count,
    following_count: followingCount.count,
  });
});

// ==================== ARTICLE ROUTES ====================

// Create article
app.post("/api/articles", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const body = await c.req.json();

  const schema = z.object({
    title: z.string().min(1).max(500),
    content: z.string().min(1),
    excerpt: z.string().optional(),
    coverImage: z.string().url().optional(),
    tags: z.array(z.string()).optional().default([]),
    isPublished: z.boolean().optional().default(false),
  });

  const validated = schema.parse(body);

  // Generate slug from title
  const slug =
    validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
    "-" +
    Date.now().toString(36);

  // Calculate reading time (approx 200 words per minute)
  const wordCount = validated.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const publishedAt = validated.isPublished ? new Date() : null;

  const result = await db.transaction(async (trx) => {
    // Insert article
    const [article] = await trx.sql`
      INSERT INTO articles (
        author_id, title, slug, content, excerpt, cover_image, 
        reading_time_minutes, is_published, published_at
      )
      VALUES (
        ${userPayload.userId}, ${validated.title}, ${slug}, ${validated.content}, 
        ${validated.excerpt || null}, ${validated.coverImage || null},
        ${readingTime}, ${validated.isPublished}, ${publishedAt}
      )
      RETURNING *
    `;

    // Handle tags
    if (validated.tags.length > 0) {
      for (const tagName of validated.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Get or create tag
        let [tag] = await trx.sql`SELECT id FROM tags WHERE slug = ${tagSlug}`;

        if (tag.length === 0) {
          [tag] = await trx.sql`
            INSERT INTO tags (name, slug)
            VALUES (${tagName}, ${tagSlug})
            RETURNING id
          `;
        }

        // Link article to tag
        await trx.sql`
          INSERT INTO article_tags (article_id, tag_id)
          VALUES (${article.id}, ${tag[0].id})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Get article with author info
    const fullArticle = await trx.sql`
      SELECT 
        a.*,
        u.username as author_username,
        u.full_name as author_full_name,
        u.avatar_url as author_avatar_url
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ${article.id}
    `;

    return fullArticle[0];
  });

  return c.json({ article: result });
});

// Get all articles (feed)
app.get("/api/articles", async (c) => {
  const { page = "1", limit = "10", tag, author, search } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  let whereClause = "WHERE a.is_published = true";
  const params = [];
  let paramIndex = 0;

  if (tag) {
    whereClause += ` AND t.slug = $${++paramIndex}`;
    params.push(tag);
  }

  if (author) {
    whereClause += ` AND u.username = $${++paramIndex}`;
    params.push(author);
  }

  if (search) {
    whereClause += ` AND (a.title ILIKE $${++paramIndex} OR a.content ILIKE $${++paramIndex})`;
    params.push(`%${search}%`, `%${search}%`);
  }

  const query = `
    SELECT 
      a.*,
      u.username as author_username,
      u.full_name as author_full_name,
      u.avatar_url as author_avatar_url,
      COALESCE(COUNT(DISTINCT l.id), 0) as likes_count,
      COALESCE(COUNT(DISTINCT c.id), 0) as comments_count
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN likes l ON a.id = l.target_id AND l.target_type = 'article'
    LEFT JOIN comments c ON a.id = c.article_id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    ${whereClause}
    GROUP BY a.id, u.username, u.full_name, u.avatar_url
    ORDER BY a.published_at DESC
    LIMIT $${++paramIndex} OFFSET $${++paramIndex}
  `;

  params.push(parseInt(limit), offset);

  const [articles, total] = await Promise.all([
    db.query(query, params),
    db.query(
      `SELECT COUNT(*) FROM articles a JOIN users u ON a.author_id = u.id ${whereClause}`,
      params.slice(0, -2),
    ),
  ]);

  return c.json({
    articles,
    total: parseInt(total[0].count, 10),
    page: parseInt(page),
    totalPages: Math.ceil(parseInt(total[0].count, 10) / parseInt(limit)),
  });
});

// Get article by slug
app.get("/api/articles/:slug", async (c) => {
  const { slug } = c.req.param();

  const article = await db.query(
    `
    SELECT 
      a.*,
      u.username as author_username,
      u.full_name as author_full_name,
      u.avatar_url as author_avatar_url,
      u.bio as author_bio,
      COALESCE(COUNT(DISTINCT l.id), 0) as likes_count,
      COALESCE(COUNT(DISTINCT c.id), 0) as comments_count
    FROM articles a
    JOIN users u ON a.author_id = u.id
    LEFT JOIN likes l ON a.id = l.target_id AND l.target_type = 'article'
    LEFT JOIN comments c ON a.id = c.article_id
    WHERE a.slug = $1
    GROUP BY a.id, u.username, u.full_name, u.avatar_url, u.bio
  `,
    [slug],
  );

  if (article.length === 0) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Get tags
  const tags = await db.query(
    `
    SELECT t.*
    FROM tags t
    JOIN article_tags at ON t.id = at.tag_id
    JOIN articles a ON at.article_id = a.id
    WHERE a.slug = $1
  `,
    [slug],
  );

  return c.json({
    article: {
      ...article[0],
      tags,
    },
  });
});

// Update article
app.patch("/api/articles/:articleId", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();
  const body = await c.req.json();

  // First check if user owns the article
  const existing = await db.query(
    "SELECT author_id FROM articles WHERE id = $1",
    [articleId],
  );

  if (existing.length === 0) {
    return c.json({ error: "Article not found" }, 404);
  }

  if (existing[0].author_id !== userPayload.userId) {
    return c.json({ error: "Not authorized to update this article" }, 403);
  }

  const schema = z.object({
    title: z.string().min(1).max(500).optional(),
    content: z.string().min(1).optional(),
    excerpt: z.string().optional(),
    coverImage: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
  });

  const validated = schema.parse(body);

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

  const result = await db.transaction(async (trx) => {
    // Update article
    const setClause = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(", ");

    const values = Object.values(updates);

    await trx.sql`
      UPDATE articles 
      SET ${sql(setClause, ...values)}
      WHERE id = ${articleId}
    `;

    // Update tags if provided
    if (validated.tags !== undefined) {
      // Remove existing tags
      await trx.sql`
        DELETE FROM article_tags WHERE article_id = ${articleId}
      `;

      // Add new tags
      for (const tagName of validated.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        let [tag] = await trx.sql`SELECT id FROM tags WHERE slug = ${tagSlug}`;

        if (tag.length === 0) {
          [tag] = await trx.sql`
            INSERT INTO tags (name, slug)
            VALUES (${tagName}, ${tagSlug})
            RETURNING id
          `;
        }

        await trx.sql`
          INSERT INTO article_tags (article_id, tag_id)
          VALUES (${articleId}, ${tag[0].id})
        `;
      }
    }

    // Get updated article
    const [updated] = await trx.sql`
      SELECT 
        a.*,
        u.username as author_username,
        u.full_name as author_full_name,
        u.avatar_url as author_avatar_url
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.id = ${articleId}
    `;

    return updated;
  });

  return c.json({ article: result });
});

// Delete article
app.delete("/api/articles/:articleId", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();

  const result = await db.transaction(async (trx) => {
    // Check ownership
    const existing = await trx.sql(
      "SELECT author_id FROM articles WHERE id = $1",
      [articleId],
    );

    if (existing.length === 0) {
      throw new Error("Article not found");
    }

    if (existing[0].author_id !== userPayload.userId) {
      throw new Error("Not authorized to delete this article");
    }

    await trx.sql`DELETE FROM articles WHERE id = ${articleId}`;
    return { message: "Article deleted" };
  });

  return c.json(result);
});

// ==================== COMMENT ROUTES ====================

// Get comments for article
app.get("/api/articles/:articleId/comments", async (c) => {
  const { articleId } = c.req.param();

  const comments = await db.query(
    `
    SELECT 
      c.*,
      u.username,
      u.full_name,
      u.avatar_url
    FROM comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.article_id = $1
    ORDER BY c.created_at ASC
  `,
    [articleId],
  );

  return c.json({ comments });
});

// Create comment
app.post("/api/articles/:articleId/comments", authMiddleware, async (c) => {
  const user = c.get("user");
  const { articleId } = c.req.param();
  const body = await c.req.json();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Validate input
  if (!body.content) {
    return c.json({ error: "Content is required" }, 400);
  }

  if (body.content.length < 1 || body.content.length > 2000) {
    return c.json(
      { error: "Content must be between 1 and 2000 characters" },
      400,
    );
  }

  // Verify article exists
  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id")
    .eq("id", articleId)
    .single();

  if (articleError || !article) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Insert comment
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .insert({
      article_id: articleId,
      author_id: user.id,
      parent_id: body.parentId || null,
      content: body.content,
    })
    .select("*")
    .single();

  if (commentError) {
    return c.json({ error: commentError.message }, 500);
  }

  // Get author info
  const { data: author } = await supabase
    .from("users")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return c.json({
    comment: {
      ...comment,
      author,
    },
  });
});

// Delete comment
app.delete("/api/comments/:commentId", authMiddleware, async (c) => {
  const user = c.get("user");
  const { commentId } = c.req.param();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Verify comment exists and user owns it
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", commentId)
    .single();

  if (commentError || !comment) {
    return c.json({ error: "Comment not found" }, 404);
  }

  if (comment.author_id !== user.id) {
    return c.json({ error: "Not authorized to delete this comment" }, 403);
  }

  // Delete comment
  await supabase.from("comments").delete().eq("id", commentId);

  return c.json({ message: "Comment deleted" });
});

// ==================== LIKE ROUTES ====================

// Toggle like on article or comment
app.post("/api/:targetType/:targetId/like", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const { targetType, targetId } = c.req.param();

  if (!["article", "comment"].includes(targetType)) {
    return c.json({ error: "Invalid target type" }, 400);
  }

  // Check if target exists
  const table = targetType === "article" ? "articles" : "comments";
  const target = await db.query(`SELECT id FROM ${table} WHERE id = $1`, [
    targetId,
  ]);

  if (target.length === 0) {
    return c.json({ error: `${targetType} not found` }, 404);
  }

  // Check if already liked
  const existing = await db.query(
    `
    SELECT id FROM likes 
    WHERE user_id = $1 AND target_type = $2 AND target_id = $3
  `,
    [userPayload.userId, targetType, targetId],
  );

  if (existing.length > 0) {
    // Unlike
    await db.query("DELETE FROM likes WHERE id = $1", [existing[0].id]);

    const countResult = await db.query(
      "SELECT COUNT(*) FROM likes WHERE target_type = $1 AND target_id = $2",
      [targetType, targetId],
    );

    return c.json({
      liked: false,
      likes_count: parseInt(countResult[0].count, 10),
    });
  } else {
    // Like
    await db.query(
      `
      INSERT INTO likes (user_id, target_type, target_id)
      VALUES ($1, $2, $3)
    `,
      [userPayload.userId, targetType, targetId],
    );

    const countResult = await db.query(
      "SELECT COUNT(*) FROM likes WHERE target_type = $1 AND target_id = $2",
      [targetType, targetId],
    );

    return c.json({
      liked: true,
      likes_count: parseInt(countResult[0].count, 10),
    });
  }
});

// Check like status
app.get("/api/:targetType/:targetId/like-status", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const { targetType, targetId } = c.req.param();

  if (!["article", "comment"].includes(targetType)) {
    return c.json({ error: "Invalid target type" }, 400);
  }

  const [likedResult, countResult] = await Promise.all([
    db.query(
      `
      SELECT 1 FROM likes 
      WHERE user_id = $1 AND target_type = $2 AND target_id = $3
    `,
      [userPayload.userId, targetType, targetId],
    ),
    db.query(
      "SELECT COUNT(*) FROM likes WHERE target_type = $1 AND target_id = $2",
      [targetType, targetId],
    ),
  ]);

  return c.json({
    liked: likedResult.length > 0,
    likes_count: parseInt(countResult[0].count, 10),
  });
});

// ==================== BOOKMARK ROUTES ====================

// Toggle bookmark
app.post("/api/articles/:articleId/bookmark", authMiddleware, async (c) => {
  const userPayload = c.get("user");
  const { articleId } = c.req.param();

  // Check if article exists
  const article = await db.query("SELECT id FROM articles WHERE id = $1", [
    articleId,
  ]);

  if (article.length === 0) {
    return c.json({ error: "Article not found" }, 404);
  }

  // Check if already bookmarked
  const existing = await db.query(
    `
    SELECT id FROM bookmarks 
    WHERE user_id = $1 AND article_id = $2
  `,
    [userPayload.userId, articleId],
  );

  if (existing.length > 0) {
    // Remove bookmark
    await db.query("DELETE FROM bookmarks WHERE id = $1", [existing[0].id]);

    return c.json({ bookmarked: false });
  } else {
    // Add bookmark
    await db.query(
      `
      INSERT INTO bookmarks (user_id, article_id)
      VALUES ($1, $2)
    `,
      [userPayload.userId, articleId],
    );

    return c.json({ bookmarked: true });
  }
});

// Get user's bookmarks
app.get("/api/users/me/bookmarks", authMiddleware, async (c) => {
  const userPayload = c.get("user");

  const bookmarks = await db.query(
    `
    SELECT 
      a.*,
      u.username as author_username,
      u.full_name as author_full_name,
      u.avatar_url as author_avatar_url,
      COALESCE(COUNT(DISTINCT l.id), 0) as likes_count,
      COALESCE(COUNT(DISTINCT c.id), 0) as comments_count
    FROM bookmarks b
    JOIN articles a ON b.article_id = a.id
    JOIN users u ON a.author_id = u.id
    LEFT JOIN likes l ON a.id = l.target_id AND l.target_type = 'article'
    LEFT JOIN comments c ON a.id = c.article_id
    WHERE b.user_id = $1 AND a.is_published = true
    GROUP BY a.id, u.username, u.full_name, u.avatar_url
    ORDER BY b.created_at DESC
  `,
    [userPayload.userId],
  );

  return c.json({ bookmarks });
});

// ==================== TAG ROUTES ====================

// Get all tags
app.get("/api/tags", async (c) => {
  const tags = await db.query(`
    SELECT 
      t.*,
      COUNT(DISTINCT at.article_id) as article_count
    FROM tags t
    LEFT JOIN article_tags at ON t.id = at.tag_id
    LEFT JOIN articles a ON at.article_id = a.id AND a.is_published = true
    GROUP BY t.id
    ORDER BY article_count DESC, t.name ASC
    LIMIT 50
  `);

  return c.json({ tags });
});

// Get articles by tag
app.get("/api/tags/:tagSlug/articles", async (c) => {
  const { tagSlug } = c.req.param();
  const { page = "1", limit = "10" } = c.req.query();

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const [articles, total] = await Promise.all([
    db.query(
      `
      SELECT 
        a.*,
        u.username as author_username,
        u.full_name as author_full_name,
        u.avatar_url as author_avatar_url,
        COALESCE(COUNT(DISTINCT l.id), 0) as likes_count,
        COALESCE(COUNT(DISTINCT c.id), 0) as comments_count
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      JOIN articles a ON at.article_id = a.id
      JOIN users u ON a.author_id = u.id
      LEFT JOIN likes l ON a.id = l.target_id AND l.target_type = 'article'
      LEFT JOIN comments c ON a.id = c.article_id
      WHERE t.slug = $1 AND a.is_published = true
      GROUP BY a.id, u.username, u.full_name, u.avatar_url
      ORDER BY a.published_at DESC
      LIMIT $2 OFFSET $3
    `,
      [tagSlug, parseInt(limit), offset],
    ),
    db.query(
      `
      SELECT COUNT(DISTINCT a.id)
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      JOIN articles a ON at.article_id = a.id
      WHERE t.slug = $1 AND a.is_published = true
    `,
      [tagSlug],
    ),
  ]);

  return c.json({
    articles,
    total: parseInt(total[0].count, 10),
    page: parseInt(page),
    totalPages: Math.ceil(parseInt(total[0].count, 10) / parseInt(limit)),
  });
});

export default { 
  port: 3001, 
  fetch: app.fetch, 
} 