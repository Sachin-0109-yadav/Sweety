
import { getReportData } from "../repositories/report.repository.js";

const validPeriods = ["daily", "monthToDate", "previousMonth"];

export const generateReport = async (userId, period) => {
  if (!validPeriods.includes(period)) {
    const error = new Error(
      "Invalid report period. Use daily, monthToDate, or previousMonth."
    );

    error.statusCode = 400;
    throw error;
  }

  const report = await getReportData(userId, period);

  const summary = {
    totalReadings: report.summary.total_readings,
    highestGlucose: report.summary.highest_glucose,
    lowestGlucose: report.summary.lowest_glucose,
    averageGlucose:
      report.summary.average_glucose === null
        ? null
        : Number(report.summary.average_glucose),
  };

  return {
    period,
    summary,
    readings: report.readings,
  };
};
