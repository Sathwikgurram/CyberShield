
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

export const checkNet01 = (details) => {
  const rule = THRESHOLDS.NETWORK.NET_01;

  const triggered =
    details.connectionCount >= rule.connectionCount &&
    details.timeWindowMinutes > 0 &&
    details.timeWindowMinutes <= rule.maxWindowMinutes;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `${details.connectionCount} network connections were recorded within ${details.timeWindowMinutes} minutes. This exceeds the configured connection threshold.`,
    "Investigate the source and destination IP addresses and check for unusual connection patterns."
  );
};

export const checkNet02 = (details) => {
  const rule = THRESHOLDS.NETWORK.NET_02;

  const triggered =
    rule.sensitivePorts.includes(details.destinationPort) &&
    details.connectionCount >= rule.connectionCount;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `Detected ${details.connectionCount} connections targeting sensitive port ${details.destinationPort}.`,
    "Investigate potential scanning or unauthorized access attempts against the targeted service."
  );
};

export const checkNet03 = (details) => {
  const rule = THRESHOLDS.NETWORK.NET_03;

  const triggered =
    details.connectionCount >= rule.connectionCount;

  return createResult(
    triggered,
    rule.ruleId,
    rule.severity,
    `Detected ${details.connectionCount} network connections, meeting the critical connection-volume threshold.`,
    "Immediately investigate the traffic source, destination, and connection patterns for possible high-volume network abuse."
  );
};

export const analyzeNetwork = (details) => [
  checkNet01(details),
  checkNet02(details),
  checkNet03(details)
];
