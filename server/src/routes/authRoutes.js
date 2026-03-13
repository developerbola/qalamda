import {
  getMeController,
  syncProfileController,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

/**
 * ==================== AUTH ROUTES ====================
 * Simplified Auth Routes focusing on synchronization & state detection
 * All Auth actions (Login/Register) now happen directly via Supabase Client
 * for security & session consistency.
 */

export const authRoutes = (app) => {
  // GET: /api/auth/me (Returns the DB profile for the current session)
  app.get("/api/auth/me", authMiddleware, getMeController);

  // POST: /api/auth/sync (Ensures the public users table is in sync with auth.users)
  app.post("/api/auth/sync", authMiddleware, syncProfileController);
};
