
import test from "node:test";
import assert from "node:assert/strict";

import {
  checkAcc01,
  checkAcc02
} from "../../services/rules/accessRules.js";

test("ACC-01: triggers at exactly 5 denied accesses", () => {
  const result = checkAcc01({
    deniedCount: 5,
    timeWindowMinutes: 10
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "MEDIUM");
});

test("ACC-01: does not trigger below 5 denied accesses", () => {
  const result = checkAcc01({
    deniedCount: 4,
    timeWindowMinutes: 10
  });

  assert.equal(result.triggered, false);
});

test("ACC-01: rejects a window greater than 10 minutes", () => {
  const result = checkAcc01({
    deniedCount: 10,
    timeWindowMinutes: 11
  });

  assert.equal(result.triggered, false);
});

test("ACC-02: detects admin resource", () => {
  const result = checkAcc02({
    resource: "/admin/settings"
  });

  assert.equal(result.triggered, true);
  assert.equal(result.severity, "HIGH");
});

test("ACC-02: detects sensitive resource case-insensitively", () => {
  const result = checkAcc02({
    resource: "/DATABASE/config"
  });

  assert.equal(result.triggered, true);
});

test("ACC-02: ignores ordinary resources", () => {
  const result = checkAcc02({
    resource: "/public/profile"
  });

  assert.equal(result.triggered, false);
});
