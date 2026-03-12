import { authMiddleware } from "../middlewares/auth.middleware";
import { getUserController, updateProfileController, followController, unfollowController, followStatusController } from "../controllers/userController";

// ==================== USER ROUTES ====================

export const userRoutes = (app) => {
  // Get user profile by username
  app.get("/api/users/:username", getUserController);

  // Update user profile
  app.patch("/api/users/profile", authMiddleware, updateProfileController);

  // Follow a user
  app.post("/api/users/:userId/follow", authMiddleware, followController);

  // Unfollow a user
  app.delete("/api/users/:userId/follow", authMiddleware, unfollowController);

  // Check follow status
  app.get("/api/users/:userId/follow-status", authMiddleware, followStatusController);
};