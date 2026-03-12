import { supabase } from "../supabase.js";

// Get comments for article
export const getCommentsController = async (c) => {
  const { articleId } = c.req.param();

  const comments = await supabase
    .from("comments")
    .select(`
      comments.*,
      users.username,
      users.full_name,
      users.avatar_url
    `)
    .eq("article_id", articleId)
    .order("created_at", { ascending: true });

  return c.json({ comments });
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
};