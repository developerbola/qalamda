import { supabase } from "../supabase.js";

// Get comments for article
export const getCommentsController = async (c) => {
  const { articleId } = c.req.param();

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      users(username, full_name, avatar_url)
    `)
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);

  return c.json({ comments: comments || [] });
};

// Create comment
export const createCommentController = async (c) => {
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

  // Update comments_count in articles table
  const { count: newCommentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId);

  await supabase
    .from("articles")
    .update({ comments_count: newCommentCount || 0 })
    .eq("id", articleId);

  // Get author info
  const { data: author } = await supabase
    .from("users")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return c.json({
    comment: {
      ...comment,
      author,
    },
  });
};

// Delete comment
export const deleteCommentController = async (c) => {
  const user = c.get("user");
  const { commentId } = c.req.param();

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Verify comment exists and user owns it
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("author_id, article_id")
    .eq("id", commentId)
    .maybeSingle();

  if (commentError || !comment) {
    return c.json({ error: "Comment not found" }, 404);
  }

  if (comment.author_id !== user.id) {
    return c.json({ error: "Not authorized to delete this comment" }, 403);
  }

  const articleId = comment.article_id;

  // Delete comment
  await supabase.from("comments").delete().eq("id", commentId);

  // Update comments_count in articles table
  const { count: newCommentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId);

  await supabase
    .from("articles")
    .update({ comments_count: newCommentCount || 0 })
    .eq("id", articleId);

  return c.json({ message: "Comment deleted" });
};