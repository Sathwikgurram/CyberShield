
import test from "node:test";
import assert from "node:assert/strict";

import {
  checkNet01,
  checkNet02,
  checkNet03
} from "../../services/rules/networkRules.js";

test("NET-01: triggers at 100 connections within 1 minute", () => {
  const result = checkNet01({
    connectionCount: 100,
    timeWindowMinutes: 1
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "MEDIUM");
});

test("NET-01: does not trigger at 99 connections", () => {
  const result = checkNet01({
    connectionCount: 99,
    timeWindowMinutes: 1
  });

  assert.equal(result.triggered, false);
});

test("NET-02: triggers on sensitive port 22", () => {
  const result = checkNet02({
    destinationPort: 22,
    connectionCount: 30
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "HIGH");
});

test("NET-02: does not trigger below 30 connections", () => {
  const result = checkNet02({
    destinationPort: 22,
    connectionCount: 29
  });

  assert.equal(result.triggered, false);
});

test("NET-02: does not trigger on ordinary port", () => {
  const result = checkNet02({
    destinationPort: 80,
    connectionCount: 100
  });

  assert.equal(result.triggered, false);
});

test("NET-03: triggers at exactly 500 connections", () => {
  const result = checkNet03({
    connectionCount: 500
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "CRITICAL");
});

test("NET-03: does not trigger at 499 connections", () => {
  const result = checkNet03({
    connectionCount: 499
  });

  assert.equal(result.triggered, false);
});
