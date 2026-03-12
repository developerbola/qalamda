import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

// Import controllers
import * as authController from "./controllers/authController";
import * as userController from "./controllers/userController";
import * as articleController from "./controllers/articleController";
import * as commentController from "./controllers/commentController";
import * as likeController from "./controllers/likeController";
import * as bookmarkController from "./controllers/bookmarkController";
import * as tagController from "./controllers/tagController";

// Import middleware
import * as middleware from "./middlewares/auth.middleware";

// Import routes
import { healthCheckRoute, authRoutes, userRoutes, articleRoutes, commentRoutes, likeRoutes, tagRoutes } from "./routes/apiRoutes";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", prettyJSON());

// Health check
healthCheckRoute(app);

// Auth routes
authRoutes(app);

// User routes
userRoutes(app);

// Article routes
articleRoutes(app);

// Comment routes
commentRoutes(app);

// Like routes
likeRoutes(app);

// Tag routes
tagRoutes(app);

export default {
  port: 3001,
  fetch: app.fetch,
};
