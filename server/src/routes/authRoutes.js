import {
  registerController,
  loginController,
  logoutController,
} from "../controllers/authController";
import { authMiddleware } from "../middlewares/auth.middleware.js";

// ==================== AUTH ROUTES ====================

export const authRoutes = (app) => {
  // Register
  app.post("/api/auth/register", registerController);

  // Login
  app.post("/api/auth/login", loginController);

  // Logout
  app.post("/api/auth/logout", logoutController);
  // Sync profile (ensure user row exists)
  app.post("/api/auth/sync-profile", authMiddleware, async (c) => {
    const { syncProfileController } = await import("../controllers/authController.js");
    return syncProfileController(c);
  });
  // Get current user
  app.get("/api/auth/me", async (c) => {
    const { getMeController } = await import("../controllers/authController.js");
    return getMeController(c);
  });
};
