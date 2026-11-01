
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

export const checkAcc01 = (details) => {
  const rule = THRESHOLDS.ACCESS_CONTROL.ACC_01;

  const triggered =
    details.deniedCount >= rule.deniedCount &&
    details.timeWindowMinutes > 0 &&
    details.timeWindowMinutes <= rule.maxWindowMinutes;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `Detected ${details.deniedCount} denied access attempts within ${details.timeWindowMinutes} minutes.`,
    "Review the affected user account, access permissions, and repeated authorization failures."
  );
};

export const checkAcc02 = (details) => {
  const rule = THRESHOLDS.ACCESS_CONTROL.ACC_02;

  const resource = String(details.resource || "").toLowerCase();

  const sensitiveResource =
    rule.sensitiveResources.find((item) =>
      resource.includes(item.toLowerCase())
    );

  const triggered = Boolean(sensitiveResource);

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `An access attempt involving the sensitive resource "${details.resource}" was denied.`,
    "Investigate the user's access attempt and verify whether the request was authorized."
  );
};

export const analyzeAccessControl = (details) => [
  checkAcc01(details),
  checkAcc02(details)
];
