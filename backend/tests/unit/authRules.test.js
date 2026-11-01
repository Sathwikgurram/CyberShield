
import test from "node:test";
import assert from "node:assert/strict";

import {
  checkAuth01,
  checkAuth02,
  checkAuth03
} from "../../services/rules/authRules.js";

test("AUTH-01: triggers at exactly 10 attempts", () => {
  const result = checkAuth01({
    failedAttempts: 10,
    timeWindowMinutes: 5
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "HIGH");
});

test("AUTH-01: does not trigger below 10 attempts", () => {
  const result = checkAuth01({
    failedAttempts: 9,
    timeWindowMinutes: 5
  });

  assert.equal(result.triggered, false);
});

test("AUTH-02: triggers at exactly 5 attempts", () => {
  const result = checkAuth02({
    failedAttempts: 5,
    timeWindowMinutes: 5
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "MEDIUM");
});

test("AUTH-02: does not trigger below 5 attempts", () => {
  const result = checkAuth02({
    failedAttempts: 4,
    timeWindowMinutes: 5
  });

  assert.equal(result.triggered, false);
});

test("AUTH-03: triggers at exactly 5 attempts per minute", () => {
  const result = checkAuth03({
    failedAttempts: 25,
    timeWindowMinutes: 5
  });

  assert.equal(result.triggered, true);
});

test("AUTH-03: does not trigger below 5 attempts per minute", () => {
  const result = checkAuth03({
    failedAttempts: 24,
    timeWindowMinutes: 5
  });

  assert.equal(result.triggered, false);
});

test("AUTH-01: rejects a window greater than 5 minutes", () => {
  const result = checkAuth01({
    failedAttempts: 15,
    timeWindowMinutes: 6
  });

  assert.equal(result.triggered, false);
});
