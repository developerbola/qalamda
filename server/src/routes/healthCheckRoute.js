// ==================== HEALTH CHECK ROUTE ====================

export const healthCheckRoute = (app) => {
  app.get("/", (c) => {
    return c.json({
      message: "Qalamda API",
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });
};
