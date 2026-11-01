
import mongoose from "mongoose";

import Alert from "../models/Alert.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  parsePagination,
  parseEnumFilter
} from "../utils/queryHelpers.js";

import { SEVERITY_VALUES } from "../constants/severity.js";


export const getAlerts = asyncHandler(async (req, res) => {
  const { status, severity } = req.query;

  const { pageNumber, pageSize } = parsePagination(req.query);

  const validatedStatus = parseEnumFilter(
    status,
    "status",
    ["open", "investigating", "resolved"]
  );

  const validatedSeverity = parseEnumFilter(
    severity,
    "severity",
    SEVERITY_VALUES
  );

  const filter = {};

  if (validatedStatus) {
    filter.status = validatedStatus;
  }

  if (validatedSeverity) {
    filter.severity = validatedSeverity;
  }

  const [alerts, total] = await Promise.all([
    Alert.find(filter)
      .populate("eventId")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),

    Alert.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    data: alerts,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});


export const getAlertById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid alert ID");
  }

  const alert = await Alert.findById(id)
    .populate("eventId");

  if (!alert) {
    throw new ApiError(404, "Alert not found");
  }

  res.status(200).json({
    success: true,
    data: alert
  });
});

export const updateAlertStatus = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { status } = req.validatedBody;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid alert ID");
    }

    const alert = await Alert.findByIdAndUpdate(
      id,
      { $set: { status } },
      {
        new: true,
        runValidators: true
      }
    ).populate("eventId");

    if (!alert) {
      throw new ApiError(404, "Alert not found");
    }

    res.status(200).json({
      success: true,
      message: "Alert status updated successfully",
      data: alert
    });
  }
);

export const addAlertNote = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { text } = req.validatedBody;

    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid alert ID");
    }

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: { text }
        }
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("eventId");

    if (!alert) {
      throw new ApiError(404, "Alert not found");
    }

    res.status(201).json({
      success: true,
      message: "Investigation note added successfully",
      data: alert
    });
  }
);
