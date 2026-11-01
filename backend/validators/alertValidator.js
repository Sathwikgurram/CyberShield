
import { z } from "zod";

export const alertStatusSchema = z.object({
  status: z.enum(["open", "investigating", "resolved"])
}).strict();

export const alertNoteSchema = z.object({
  text: z.string().trim().min(1).max(2000)
}).strict();

export const alertIdSchema = z.string().regex(
  /^[a-f\d]{24}$/i,
  "Invalid alert ID"
);
