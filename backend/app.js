
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";

import eventRoutes from "./routes/eventRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

import { apiLimiter } from "./middlewares/rateLimiter.js";

import {
  notFound,
  errorHandler
} from "./middlewares/errorMiddleware.js";

const app = express();

// Security headers.
app.use(
  helmet({
    strictTransportSecurity:
      process.env.NODE_ENV === "production"
        ? undefined
        : false
  })
);

// Configure permitted frontend origins.
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header include Postman and
      // server-to-server requests. CORS does not restrict these.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Browser requests from other origins receive no CORS permission.
      return callback(null, false);
    }
  })
);

// Request body limits.
app.use(express.json({ limit: "100kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb"
  })
);

// Health endpoint.
app.get("/api/health", (req, res) => {
  const databaseConnected =
    mongoose.connection.readyState === 1;

  if (!databaseConnected) {
    return res.status(503).json({
      success: false,
      message: "Database connection unavailable",
      database: "disconnected"
    });
  }

  res.status(200).json({
    success: true,
    message: "CyberShield API is running",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

// Rate limit API routes.
app.use("/api", apiLimiter);

// API routes.
app.use("/api/events", eventRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/stats", statsRoutes);

app.get("/favicon.ico", (req, res) => {
  res.sendStatus(204);
});

// Error handling.
app.use(notFound);
app.use(errorHandler);

export default app;
