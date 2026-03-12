import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { prettyJSON } from "hono/pretty-json";

// Import routes
import {
  healthCheckRoute,
  authRoutes,
  userRoutes,
  articleRoutes,
  commentRoutes,
  likeRoutes,
  tagRoutes,
} from "./routes/apiRoutes.js";

const app = new Hono();

// Middleware
app.use(
  "*",
  cors({
    origin: (origin) => origin,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
);
app.use("*", prettyJSON());

// Health Check
healthCheckRoute(app);

// Routes
authRoutes(app);
userRoutes(app);
articleRoutes(app);
commentRoutes(app);
likeRoutes(app);
tagRoutes(app);

// Export for Vercel
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
export const DELETE = handler;

// Also export default for some environments
export default app;
