
import { Router } from "express";

import {
  analyzeEvent,
  getEvents,
  getEventById
} from "../controllers/eventController.js";

import validateRequest from "../middlewares/validateRequest.js";
import { eventSchema } from "../validators/eventValidator.js";

import { eventAnalysisLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Apply stricter rate limiting only to event submissions.
router.post(
  "/analyze",
  eventAnalysisLimiter,
  validateRequest(eventSchema),
  analyzeEvent
);

router.get("/", getEvents);
router.get("/:id", getEventById);

export default router;
