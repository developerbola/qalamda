import { authMiddleware } from "../middlewares/auth.middleware.js";
import { toggleLikeController, likeStatusController } from "../controllers/likeController.js";

// ==================== LIKE ROUTES ====================

export const likeRoutes = (app) => {
  // Toggle like on article or comment
  app.post("/api/:targetType/:targetId/like", authMiddleware, toggleLikeController);

  // Check like status
  app.get("/api/:targetType/:targetId/like-status", authMiddleware, likeStatusController);
};