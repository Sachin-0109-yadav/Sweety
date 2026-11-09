
import { generateReport } from "../services/report.service.js";

export const getReport = async (req, res) => {
  try {
    const period = req.query.period || "daily";

    const report = await generateReport(
      req.user.userId,
      period
    );

    return res.status(200).json({
      success: true,
      message: "Health report retrieved successfully",
      data: report,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Report API error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate health report",
    });
  }
};
