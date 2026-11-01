
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../../app.js";

const validAuthEvent = {
  category: "AUTHENTICATION",
  sourceIP: "192.168.1.10",
  timestamp: "2026-11-01T10:30:00.000Z",
  details: {
    eventType: "LOGIN_FAILURE",
    username: "admin",
    failedAttempts: 3,
    timeWindowMinutes: 5
  }
};

test("GET /api/health returns service health", async () => {
  const response = await request(app).get("/api/health");

  // The database is not connected during these isolated tests.
  assert.equal(response.status, 503);
});

test("Unknown API route returns 404", async () => {
  const response = await request(app).get("/api/unknown-route");

  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
});

test("Invalid event category returns 400", async () => {
  const response = await request(app)
    .post("/api/events/analyze")
    .send({
      ...validAuthEvent,
      category: "INVALID_CATEGORY"
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("Invalid source IP returns 400", async () => {
  const response = await request(app)
    .post("/api/events/analyze")
    .send({
      ...validAuthEvent,
      sourceIP: "not-an-ip"
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});

test("Missing authentication fields returns 400", async () => {
  const response = await request(app)
    .post("/api/events/analyze")
    .send({
      category: "AUTHENTICATION",
      sourceIP: "192.168.1.10",
      timestamp: "2026-11-01T10:30:00.000Z",
      details: {}
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
});
