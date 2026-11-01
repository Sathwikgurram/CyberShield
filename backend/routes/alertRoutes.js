
import express from "express";

import {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  addAlertNote
} from "../controllers/alertController.js";

import {
  alertStatusSchema,
  alertNoteSchema
} from "../validators/alertValidator.js";

import validateRequest from "../middlewares/validateRequest.js";

const router = express.Router();

router.get("/", getAlerts);
router.get("/:id", getAlertById);

router.patch(
  "/:id/status",
  validateRequest(alertStatusSchema),
  updateAlertStatus
);

router.post(
  "/:id/notes",
  validateRequest(alertNoteSchema),
  addAlertNote
);

export default router;
