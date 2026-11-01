
import { THRESHOLDS } from "../../constants/thresholds.js";

const createResult = (
  triggered,
  ruleId,
  severity,
  explanation,
  recommendation
) => ({
  triggered,
  ruleId,
  severity: triggered ? severity : "NONE",
  explanation: triggered ? explanation : "",
  recommendation: triggered ? recommendation : ""
});

export const checkAuth01 = (details) => {
  const rule = THRESHOLDS.AUTH.AUTH_01;

  const triggered =
    details.failedAttempts >= rule.failedAttempts &&
    details.timeWindowMinutes > 0 &&
    details.timeWindowMinutes <= rule.maxWindowMinutes;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `Detected ${details.failedAttempts} failed login attempts within ${details.timeWindowMinutes} minutes. This exceeds the high-risk authentication threshold.`,
    "Investigate the source IP, review the affected account, and consider temporarily locking the account after verifying the activity."
  );
};

export const checkAuth02 = (details) => {
  const rule = THRESHOLDS.AUTH.AUTH_02;

  const triggered =
    details.failedAttempts >= rule.failedAttempts &&
    details.timeWindowMinutes > 0 &&
    details.timeWindowMinutes <= rule.maxWindowMinutes;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `Detected ${details.failedAttempts} failed login attempts within ${details.timeWindowMinutes} minutes. This indicates potentially suspicious authentication activity.`,
    "Review recent login activity and verify whether the attempts were legitimate."
  );
};

export const checkAuth03 = (details) => {
  const rule = THRESHOLDS.AUTH.AUTH_03;

  const attemptsPerMinute =
    details.timeWindowMinutes > 0
      ? details.failedAttempts / details.timeWindowMinutes
      : 0;

  const triggered =
    attemptsPerMinute >= rule.attemptsPerMinute;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `Authentication failure rate is ${attemptsPerMinute.toFixed(2)} attempts per minute, meeting the brute-force rate threshold.`,
    "Investigate repeated login attempts, examine source IP reputation, and review account protection controls."
  );
};

export const analyzeAuthentication = (details) => [
  checkAuth01(details),
  checkAuth02(details),
  checkAuth03(details)
];
