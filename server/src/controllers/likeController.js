import { supabase } from "../supabase.js";

// Toggle like on article or comment
export const toggleLikeController = async (c) => {
  const userPayload = c.get("user");
  const { targetType, targetId } = c.req.param();

  if (!['article', 'comment'].includes(targetType)) {
    return c.json({ error: 'Invalid target type' }, 400);
  }

  // Check if target exists
  const table = targetType === 'article' ? 'articles' : 'comments';
  const { data: target, error: targetError } = await supabase
    .from(table)
    .select("id")
    .eq("id", targetId)
    .single();

  if (targetError || !target) {
    return c.json({ error: `${targetType} not found` }, 404);
  }

  // Check if already liked
  const { data: existing, error: existingError } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userPayload.userId)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .single();

  if (existingError && !existingError.message.includes("No data")) {
    throw existingError;
  }

  if (existing) {
    // Unlike
    await supabase
      .from("likes")
      .delete()
      .eq("id", existing.id);
    const { data: _likes, error: countErr, count } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("target_type", targetType)
      .eq("target_id", targetId);

    const newCount = count || 0;
    // persist to target table
    await supabase.from(table).update({ likes_count: newCount }).eq("id", targetId);

    return c.json({
      liked: false,
      likes_count: newCount,
    });
  } else {
    // Like
    await supabase
      .from("likes")
      .insert({
        user_id: userPayload.userId,
        target_type: targetType,
        target_id: targetId,
      });
    const { data: _likes, error: countErr, count } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("target_type", targetType)
      .eq("target_id", targetId);

    const newCount = count || 0;
    // persist to target table
    await supabase.from(table).update({ likes_count: newCount }).eq("id", targetId);

    return c.json({
      liked: true,
      likes_count: newCount,
    });
  }
};

// Check like status
export const likeStatusController = async (c) => {
  const userPayload = c.get("user");
  const { targetType, targetId } = c.req.param();

  if (!['article', 'comment'].includes(targetType)) {
    return c.json({ error: 'Invalid target type' }, 400);
  }

  const [likedResult, countResult] = await Promise.all([
    supabase
      .from("likes")
      .select("id")
      .eq("user_id", userPayload.userId)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .single(),
    supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("target_type", targetType)
      .eq("target_id", targetId),
  ]);

  const likesCount = countResult.count || 0;
  return c.json({
    liked: !!likedResult,
    likes_count: likesCount,
  });
};