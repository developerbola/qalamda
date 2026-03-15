import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getUserController,
  updateProfileController,
  followController,
  unfollowController,
  followStatusController,
  getFollowingController,
  saveInterestsController,
} from "../controllers/userController.js";
import { getBookmarksController } from "../controllers/bookmarkController.js";
import { getUserLikesController } from "../controllers/likeController.js";

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
  app.get(
    "/api/users/:userId/follow-status",
    authMiddleware,
    followStatusController,
  );

  // Get current user's bookmarks
  app.get("/api/users/me/bookmarks", authMiddleware, getBookmarksController);

  // Get current user's likes
  app.get("/api/users/me/likes", authMiddleware, getUserLikesController);

  // Get current user's following list
  app.get("/api/users/me/following", authMiddleware, getFollowingController);

  // Save user interests
  app.post("/api/users/me/interests", authMiddleware, saveInterestsController);
};
