
import mongoose from "mongoose";

import SecurityEvent from "../models/SecurityEvent.js";
import Alert from "../models/Alert.js";

import { analyzeThreat } from "../services/threatAnalyzer.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  parsePagination,
  parseEnumFilter,
  parseSearch,
  escapeRegex
} from "../utils/queryHelpers.js";

import { EVENT_CATEGORY_VALUES } from "../constants/eventCategories.js";
import { SEVERITY_VALUES } from "../constants/severity.js";

export const analyzeEvent = asyncHandler(async (req, res) => {
  const input = req.validatedBody;

  // Run the pure detection engine.
  const analysis = analyzeThreat({
    category: input.category,
    details: input.details
  });

  // Save every event, including normal events.
  const event = await SecurityEvent.create({
    category: input.category,
    sourceIP: input.sourceIP,
    details: input.details,
    timestamp: input.timestamp,
    triggeredRules: analysis.triggeredRules,
    classification: analysis.classification,
    overallSeverity: analysis.overallSeverity
  });

  let alert = null;

  // Create an alert only for suspicious events.
  if (analysis.classification === "SUSPICIOUS") {
    try {
      alert = await Alert.create({
        eventId: event._id,
        severity: analysis.overallSeverity,
        reason: analysis.triggeredRules
          .map((rule) => `${rule.ruleId}: ${rule.explanation}`)
          .join(" | ")
      });

      event.alertId = alert._id;
      await event.save();
    } catch (error) {
      // Avoid leaving an orphaned alert if event linking fails.
      if (alert?._id) {
        await Alert.findByIdAndDelete(alert._id).catch(() => {});
      }

      await SecurityEvent.findByIdAndDelete(event._id).catch(() => {});

      throw error;
    }
  }

  res.status(201).json({
    success: true,
    message: "Security event analyzed successfully",
    data: {
      event,
      alert,
      analysis: {
        totalRulesEvaluated: analysis.totalRulesEvaluated,
        totalRulesTriggered: analysis.totalRulesTriggered
      }
    }
  });
});


export const getEvents = asyncHandler(async (req, res) => {
  const { search, category, severity } = req.query;

  const { pageNumber, pageSize } = parsePagination(req.query);

  const validatedCategory = parseEnumFilter(
    category,
    "category",
    EVENT_CATEGORY_VALUES
  );

  const validatedSeverity = parseEnumFilter(
    severity,
    "severity",
    SEVERITY_VALUES
  );

  const validatedSearch = parseSearch(search);

  const filter = {};

  if (validatedCategory) {
    filter.category = validatedCategory;
  }

  if (validatedSeverity) {
    filter.overallSeverity = validatedSeverity;
  }

  if (validatedSearch) {
    const escaped = escapeRegex(validatedSearch);
    const searchRegex = new RegExp(escaped, "i");

    filter.$or = [
      { sourceIP: searchRegex },
      { "details.username": searchRegex },
      { "details.resource": searchRegex }
    ];
  }

  const [events, total] = await Promise.all([
    SecurityEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate("alertId"),

    SecurityEvent.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: events,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});


export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid event ID");
  }

  const event = await SecurityEvent.findById(id)
    .populate("alertId");

  if (!event) {
    throw new ApiError(404, "Security event not found");
  }

  res.status(200).json({
    success: true,
    data: event
  });
});
