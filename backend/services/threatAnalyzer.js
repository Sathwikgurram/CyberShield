
import {
  EVENT_CATEGORIES
} from "../constants/eventCategories.js";

import {
  SEVERITY,
  SEVERITY_RANK,
  escalateSeverity
} from "../constants/severity.js";

import {
  THRESHOLDS
} from "../constants/thresholds.js";

import {
  analyzeAuthentication
} from "./rules/authRules.js";

import {
  analyzeNetwork
} from "./rules/networkRules.js";

import {
  analyzeAccessControl
} from "./rules/accessRules.js";

const categoryAnalyzers = {
  [EVENT_CATEGORIES.AUTHENTICATION]: analyzeAuthentication,
  [EVENT_CATEGORIES.NETWORK]: analyzeNetwork,
  [EVENT_CATEGORIES.ACCESS_CONTROL]: analyzeAccessControl
};

// Executes all rules belonging to an event category.
export const dispatchRules = (event) => {
  const analyzer = categoryAnalyzers[event.category];

  if (!analyzer) {
    throw new Error(
      `Unsupported event category: ${event.category}`
    );
  }

  return analyzer(event.details);
};

// Finds the highest severity among triggered rules.
export const calculateSeverity = (triggeredRules) => {
  if (triggeredRules.length === 0) {
    return SEVERITY.NONE;
  }

  const highestSeverity = triggeredRules.reduce(
    (highest, current) => {
      return SEVERITY_RANK[current.severity] >
        SEVERITY_RANK[highest]
        ? current.severity
        : highest;
    },
    SEVERITY.NONE
  );

  // Escalate one level when three or more rules trigger.
  if (
    triggeredRules.length >=
    THRESHOLDS.AGGREGATION.escalationRuleCount
  ) {
    return escalateSeverity(highestSeverity);
  }

  return highestSeverity;
};

// Main entry point for threat analysis.
export const analyzeThreat = (event) => {
  const allRuleResults = dispatchRules(event);

  const triggeredRules = allRuleResults.filter(
    (rule) => rule.triggered
  );

  const classification =
    triggeredRules.length > 0
      ? "SUSPICIOUS"
      : "NORMAL";

  const overallSeverity =
    calculateSeverity(triggeredRules);

  return {
    classification,
    overallSeverity,
    triggeredRules,
    totalRulesEvaluated: allRuleResults.length,
    totalRulesTriggered: triggeredRules.length
  };
};
