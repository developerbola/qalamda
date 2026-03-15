import { optionalAuthMiddleware } from "../middlewares/auth.middleware.js";
import {
  getTagsController,
  getArticlesByTagController,
  getHomeTagsController,
} from "../controllers/tagController.js";

export const tagRoutes = (app) => {
  // Get all tags
  app.get("/api/tags", getTagsController);
  app.get("/api/home-tags", optionalAuthMiddleware, getHomeTagsController);

  // Get articles by tag
  app.get("/api/tags/:tagSlug/articles", getArticlesByTagController);
};
