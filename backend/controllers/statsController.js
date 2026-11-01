
import SecurityEvent from "../models/SecurityEvent.js";
import Alert from "../models/Alert.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const [
    totalEvents,
    suspiciousEvents,
    eventsBySeverity,
    eventsByCategory,
    alertStatuses,
    eventsOverTime,
    recentActivity
  ] = await Promise.all([
    SecurityEvent.countDocuments(),

    SecurityEvent.countDocuments({
      classification: "SUSPICIOUS"
    }),

    SecurityEvent.aggregate([
      {
        $group: {
          _id: "$overallSeverity",
          count: { $sum: 1 }
        }
      }
    ]),

    SecurityEvent.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      }
    ]),

    Alert.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),

    SecurityEvent.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]),

    SecurityEvent.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("category sourceIP classification overallSeverity createdAt")
  ]);

  const severityCounts = {
    NONE: 0,
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0
  };

  eventsBySeverity.forEach((item) => {
    severityCounts[item._id] = item.count;
  });

  const categoryCounts = {
    AUTHENTICATION: 0,
    NETWORK: 0,
    ACCESS_CONTROL: 0
  };

  eventsByCategory.forEach((item) => {
    categoryCounts[item._id] = item.count;
  });

  const alertStatusCounts = {
    open: 0,
    investigating: 0,
    resolved: 0
  };

  alertStatuses.forEach((item) => {
    alertStatusCounts[item._id] = item.count;
  });

  const totalAlerts = await Alert.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalEvents,
      suspiciousEvents,
      normalEvents: totalEvents - suspiciousEvents,
      totalAlerts,
      severityCounts,
      categoryCounts,
      alertStatusCounts,
      eventsOverTime: eventsOverTime.map((item) => ({
        date: item._id,
        count: item.count
      })),
      recentActivity
    }
  });
});
