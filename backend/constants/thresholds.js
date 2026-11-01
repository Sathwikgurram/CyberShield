
export const THRESHOLDS = Object.freeze({

  AUTH: {
    AUTH_01: {
      ruleId: "AUTH-01",
      failedAttempts: 10,
      maxWindowMinutes: 5,
      severity: "HIGH"
    },

    AUTH_02: {
      ruleId: "AUTH-02",
      failedAttempts: 5,
      maxWindowMinutes: 5,
      severity: "MEDIUM"
    },

    AUTH_03: {
      ruleId: "AUTH-03",
      attemptsPerMinute: 5,
      severity: "HIGH"
    }
  },

  NETWORK: {
    NET_01: {
      ruleId: "NET-01",
      connectionCount: 100,
      maxWindowMinutes: 1,
      severity: "MEDIUM"
    },

    NET_02: {
      ruleId: "NET-02",
      sensitivePorts: [22, 23, 3389],
      connectionCount: 30,
      severity: "HIGH"
    },

    NET_03: {
      ruleId: "NET-03",
      connectionCount: 500,
      severity: "CRITICAL"
    }
  },

  ACCESS_CONTROL: {
    ACC_01: {
      ruleId: "ACC-01",
      deniedCount: 5,
      maxWindowMinutes: 10,
      severity: "MEDIUM"
    },

    ACC_02: {
      ruleId: "ACC-02",
      sensitiveResources: [
        "admin",
        "config",
        "/etc",
        "database"
      ],
      severity: "HIGH"
    }
  },

  AGGREGATION: {
    escalationRuleCount: 3,
    escalationLevels: 1
  }

});
