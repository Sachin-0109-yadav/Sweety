
import pool from "../config/db.js";

const periodConditions = {
  daily: "reading_date = CURRENT_DATE",

  monthToDate: `
    reading_date >= DATE_TRUNC('month', CURRENT_DATE)::date
    AND reading_date <= CURRENT_DATE
  `,

  previousMonth: `
    reading_date >= (
      DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    )::date
    AND reading_date < DATE_TRUNC('month', CURRENT_DATE)::date
  `,
};

export const getReportData = async (userId, period) => {
  const condition = periodConditions[period];

  if (!condition) {
    throw new Error("Invalid report period");
  }

  const summaryQuery = `
    SELECT
      COUNT(*)::int AS total_readings,
      MAX(glucose_level) AS highest_glucose,
      MIN(glucose_level) AS lowest_glucose,
      ROUND(AVG(glucose_level)::numeric, 1) AS average_glucose
    FROM glucose_readings
    WHERE user_id = $1
      AND ${condition}
  `;

  const readingsQuery = `
    SELECT
      id,
      reading_date,
      reading_slot,
      glucose_level,
      created_at
    FROM glucose_readings
    WHERE user_id = $1
      AND ${condition}
    ORDER BY
      reading_date DESC,
      CASE reading_slot
        WHEN 'Morning fasting' THEN 1
        WHEN 'After breakfast' THEN 2
        WHEN 'After lunch' THEN 3
        WHEN 'After dinner' THEN 4
      END ASC
  `;

  const [summaryResult, readingsResult] = await Promise.all([
    pool.query(summaryQuery, [userId]),
    pool.query(readingsQuery, [userId]),
  ]);

  return {
    summary: summaryResult.rows[0],
    readings: readingsResult.rows,
  };
};
