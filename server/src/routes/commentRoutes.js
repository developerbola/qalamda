import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getCommentsController, createCommentController, deleteCommentController } from "../controllers/commentController.js";

// ==================== COMMENT ROUTES ====================

export const commentRoutes = (app) => {
  // Get comments for article
  app.get("/api/articles/:articleId/comments", getCommentsController);

  // Create comment
  app.post("/api/articles/:articleId/comments", authMiddleware, createCommentController);

  // Delete comment
  app.delete("/api/comments/:commentId", authMiddleware, deleteCommentController);
};