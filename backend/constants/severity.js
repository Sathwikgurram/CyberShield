
export const SEVERITY = Object.freeze({
  NONE: "NONE",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL"
});

export const SEVERITY_RANK = Object.freeze({
  [SEVERITY.NONE]: 0,
  [SEVERITY.LOW]: 1,
  [SEVERITY.MEDIUM]: 2,
  [SEVERITY.HIGH]: 3,
  [SEVERITY.CRITICAL]: 4
});

export const SEVERITY_VALUES = Object.freeze(
  Object.values(SEVERITY)
);

// Returns the higher of two severity levels.
export const getHigherSeverity = (first, second) => {
  return SEVERITY_RANK[first] >= SEVERITY_RANK[second]
    ? first
    : second;
};

// Escalates severity by one level.
export const escalateSeverity = (severity) => {
  const nextRank = Math.min(
    SEVERITY_RANK[severity] + 1,
    SEVERITY_RANK.CRITICAL
  );

  return Object.keys(SEVERITY_RANK).find(
    (key) => SEVERITY_RANK[key] === nextRank
  );
};