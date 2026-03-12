import { getTagsController, getArticlesByTagController } from "../controllers/tagController";

// ==================== TAG ROUTES ====================

export const tagRoutes = (app) => {
  // Get all tags
  app.get("/api/tags", getTagsController);

  // Get articles by tag
  app.get("/api/tags/:tagSlug/articles", getArticlesByTagController);
};