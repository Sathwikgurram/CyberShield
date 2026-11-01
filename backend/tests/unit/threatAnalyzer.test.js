
import test from "node:test";
import assert from "node:assert/strict";

import {
  analyzeThreat,
  calculateSeverity
} from "../../services/threatAnalyzer.js";

test("Normal authentication event is classified NORMAL", () => {
  const result = analyzeThreat({
    category: "AUTHENTICATION",
    details: {
      failedAttempts: 2,
      timeWindowMinutes: 5
    }
  });

  assert.equal(result.classification, "NORMAL");
  assert.equal(result.overallSeverity, "NONE");
  assert.equal(result.totalRulesTriggered, 0);
});

test("Multiple authentication rules trigger escalation", () => {
  const result = analyzeThreat({
    category: "AUTHENTICATION",
    details: {
      failedAttempts: 25,
      timeWindowMinutes: 5
    }
  });

  assert.equal(result.classification, "SUSPICIOUS");
  assert.equal(result.totalRulesTriggered, 3);
  assert.equal(result.overallSeverity, "CRITICAL");
});

test("Single HIGH rule remains HIGH", () => {
  const result = analyzeThreat({
    category: "NETWORK",
    details: {
      connectionCount: 30,
      destinationPort: 22,
      timeWindowMinutes: 2
    }
  });

  assert.equal(result.overallSeverity, "HIGH");
  assert.equal(result.totalRulesTriggered, 1);
});

test("Three triggered rules escalate MEDIUM to HIGH", () => {
  const rules = [
    { severity: "MEDIUM" },
    { severity: "LOW" },
    { severity: "MEDIUM" }
  ];

  assert.equal(calculateSeverity(rules), "HIGH");
});

test("CRITICAL severity cannot escalate beyond CRITICAL", () => {
  const rules = [
    { severity: "CRITICAL" },
    { severity: "HIGH" },
    { severity: "MEDIUM" }
  ];

  assert.equal(calculateSeverity(rules), "CRITICAL");
});

test("Unknown event category is rejected", () => {
  assert.throws(
    () => analyzeThreat({
      category: "UNKNOWN",
      details: {}
    }),
    /Unsupported event category/
  );
});

test("Analyzer evaluates all three network rules", () => {
  const result = analyzeThreat({
    category: "NETWORK",
    details: {
      connectionCount: 600,
      destinationPort: 22,
      timeWindowMinutes: 1
    }
  });

  assert.equal(result.totalRulesEvaluated, 3);
  assert.equal(result.totalRulesTriggered, 3);
  assert.equal(result.overallSeverity, "CRITICAL");
});
