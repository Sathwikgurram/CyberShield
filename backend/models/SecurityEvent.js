
import mongoose from "mongoose";

import {
  EVENT_CATEGORY_VALUES
} from "../constants/eventCategories.js";

import {
  SEVERITY_VALUES
} from "../constants/severity.js";

const triggeredRuleSchema = new mongoose.Schema(
  {
    ruleId: {
      type: String,
      required: true,
      trim: true
    },

    severity: {
      type: String,
      enum: SEVERITY_VALUES.filter(
        (value) => value !== "NONE"
      ),
      required: true
    },

    explanation: {
      type: String,
      required: true,
      trim: true
    },

    recommendation: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    _id: false
  }
);

const securityEventSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: EVENT_CATEGORY_VALUES,
      required: true
    },

    sourceIP: {
      type: String,
      required: true,
      trim: true
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },

    timestamp: {
      type: Date,
      required: true
    },

    triggeredRules: {
      type: [triggeredRuleSchema],
      default: []
    },

    classification: {
      type: String,
      enum: ["SUSPICIOUS", "NORMAL"],
      required: true
    },

    overallSeverity: {
      type: String,
      enum: SEVERITY_VALUES,
      required: true,
      default: "NONE"
    },

    alertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alert",
      default: null
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    },
    versionKey: false
  }
);

// Indexes for filtering and querying events
securityEventSchema.index({ category: 1 });
securityEventSchema.index({ overallSeverity: 1 });
securityEventSchema.index({ createdAt: -1 });

const SecurityEvent = mongoose.model(
  "SecurityEvent",
  securityEventSchema
);

export default SecurityEvent;
