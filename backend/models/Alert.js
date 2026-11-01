
import mongoose from "mongoose";

import {
  SEVERITY_VALUES
} from "../constants/severity.js";

const noteSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: true
  }
);

const alertSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecurityEvent",
      required: true,
      unique: true
    },

    severity: {
      type: String,
      enum: SEVERITY_VALUES.filter(
        (value) => value !== "NONE"
      ),
      required: true
    },

    reason: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ["open", "investigating", "resolved"],
      default: "open"
    },

    notes: {
      type: [noteSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for alert filtering
alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ createdAt: -1 });

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
