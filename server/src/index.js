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
} from "./routes/apiRoutes";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", prettyJSON());

healthCheckRoute(app);
authRoutes(app);
userRoutes(app);
articleRoutes(app);
commentRoutes(app);
likeRoutes(app);
tagRoutes(app);


export default {
  port: 3001,
  fetch: app.fetch,
};

// const handler = handle(app);

// export const GET = handler;
// export const POST = handler;
// export const PATCH = handler;
// export const PUT = handler;
// export const OPTIONS = handler;
// export const DELETE = handler;