import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createArticleController, getArticlesController, getArticleController, updateArticleController, deleteArticleController } from "../controllers/articleController.js";
import { toggleBookmarkController } from "../controllers/bookmarkController.js";

// ==================== ARTICLE ROUTES ====================

export const articleRoutes = (app) => {
  // Create article
  app.post("/api/articles", authMiddleware, createArticleController);

  // Get all articles (feed)
  app.get("/api/articles", getArticlesController);

  // Get article by slug
  app.get("/api/articles/:slug", getArticleController);

  // Update article
  app.patch("/api/articles/:articleId", authMiddleware, updateArticleController);

  // Delete article
  app.delete("/api/articles/:articleId", authMiddleware, deleteArticleController);

  // Toggle bookmark
  app.post("/api/articles/:articleId/bookmark", authMiddleware, toggleBookmarkController);
};