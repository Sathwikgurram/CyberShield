import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import {
  notFound,
  errorHandler
} from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/favicon.ico", (req, res) => {
  res.sendStatus(204);
});

app.use(notFound);
app.use(errorHandler);

export default app;