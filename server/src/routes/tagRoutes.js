import {
  getTagsController,
  getArticlesByTagController,
  getHomeTagsController,
} from "../controllers/tagController.js";

export const tagRoutes = (app) => {
  // Get all tags
  app.get("/api/tags", getTagsController);
  app.get("/api/home-tags", getHomeTagsController);

  // Get articles by tag
  app.get("/api/tags/:tagSlug/articles", getArticlesByTagController);
};
