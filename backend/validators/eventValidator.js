
import { z } from "zod";
import { isIP } from "node:net";

const ipSchema = z.string().refine(
  (value) => isIP(value) !== 0,
  { message: "Invalid IP address" }
);

const timestampSchema = z.coerce.date().refine(
  (date) => !Number.isNaN(date.getTime()),
  { message: "Invalid timestamp" }
);

const positiveInteger = z.number().int().positive();

const timeWindow = z.number().positive().max(1440);

const baseEvent = {
  sourceIP: ipSchema,
  timestamp: timestampSchema
};

const authenticationSchema = z.object({
  ...baseEvent,
  category: z.literal("AUTHENTICATION"),
  details: z.object({
    eventType: z.literal("LOGIN_FAILURE"),
    username: z.string().trim().min(1).max(100),
    failedAttempts: positiveInteger,
    timeWindowMinutes: timeWindow
  }).strict()
}).strict();

const networkSchema = z.object({
  ...baseEvent,
  category: z.literal("NETWORK"),
  details: z.object({
    destinationIP: ipSchema,
    destinationPort: z.number().int().min(1).max(65535),
    protocol: z.enum(["TCP", "UDP", "ICMP"]),
    connectionCount: z.number().int().nonnegative(),
    timeWindowMinutes: timeWindow
  }).strict()
}).strict();

const accessControlSchema = z.object({
  ...baseEvent,
  category: z.literal("ACCESS_CONTROL"),
  details: z.object({
    username: z.string().trim().min(1).max(100),
    resource: z.string().trim().min(1).max(500),
    deniedCount: z.number().int().nonnegative(),
    timeWindowMinutes: timeWindow
  }).strict()
}).strict();

export const eventSchema = z.discriminatedUnion("category", [
  authenticationSchema,
  networkSchema,
  accessControlSchema
]);
