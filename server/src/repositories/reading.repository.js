import pool from "../config/db.js";

export const createReading = async ({
  userId,
  reading_date,
  reading_slot,
  glucose_level,
}) => {
  const result = await pool.query(
    `INSERT INTO glucose_readings
      (user_id, reading_date, reading_slot, glucose_level)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, reading_date, reading_slot, glucose_level]
  );

  return result.rows[0];
};

export const getReadings = async (userId) => {
  const result = await pool.query(
    `SELECT *
     FROM glucose_readings
     WHERE user_id = $1
     ORDER BY reading_date DESC, created_at DESC`,
    [userId]
  );

  return result.rows;
};

export const getReadingById = async (userId, readingId) => {
  const result = await pool.query(
    `SELECT *
     FROM glucose_readings
     WHERE user_id = $1 AND id = $2`,
    [userId, readingId]
  );

  return result.rows[0] || null;
};

export const updateReading = async (
  userId,
  readingId,
  data
) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${index}`);
    values.push(value);
    index++;
  }

  fields.push("updated_at = NOW()");

  values.push(userId, readingId);

  const result = await pool.query(
    `UPDATE glucose_readings
     SET ${fields.join(", ")}
     WHERE user_id = $${index}
       AND id = $${index + 1}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

export const deleteReading = async (userId, readingId) => {
  const result = await pool.query(
    `DELETE FROM glucose_readings
     WHERE user_id = $1 AND id = $2
     RETURNING id`,
    [userId, readingId]
  );

  return result.rows[0] || null;
};