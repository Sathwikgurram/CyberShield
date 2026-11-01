
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// Isolated Express application for security tests.
const createTestApp = (limiter) => {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "100kb" }));

  app.use("/api", limiter);

  app.get("/api/test", (req, res) => {
    res.status(200).json({ success: true });
  });

  return app;
};

test("Helmet adds security headers", async () => {
  const app = createTestApp((req, res, next) => next());

  const response = await request(app).get("/api/test");

  assert.equal(response.status, 200);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
  assert.ok(response.headers["content-security-policy"]);
});

test("General rate limiter blocks requests beyond its limit", async () => {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2,
    standardHeaders: "draft-8",
    legacyHeaders: false
  });

  const app = createTestApp(limiter);

  const first = await request(app).get("/api/test");
  const second = await request(app).get("/api/test");
  const third = await request(app).get("/api/test");

  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal(third.status, 429);
});

test("Event-specific rate limiter blocks requests beyond its limit", async () => {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 2,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many event submissions. Please try again later."
    }
  });

  const app = express();
  app.use(express.json());
  app.post("/api/events/analyze", limiter, (req, res) => {
    res.status(201).json({ success: true });
  });

  const first = await request(app).post("/api/events/analyze").send({});
  const second = await request(app).post("/api/events/analyze").send({});
  const third = await request(app).post("/api/events/analyze").send({});

  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(third.status, 429);
  assert.equal(
    third.body.message,
    "Too many event submissions. Please try again later."
  );
});

test("Oversized JSON requests return 413", async () => {
  const app = express();

  app.use(express.json({ limit: "100kb" }));

  app.post("/api/test", (req, res) => {
    res.status(200).json({ success: true });
  });

  const response = await request(app)
    .post("/api/test")
    .set("Content-Type", "application/json")
    .send({ data: "A".repeat(110 * 1024) });

  assert.equal(response.status, 413);
});
