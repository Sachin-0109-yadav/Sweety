import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT id, name, email, password_hash, created_at
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );

  return result.rows[0] || null;
};

export const createUser = async ({ name, email, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );

  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, name, email, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
};


export const updateUserProfile = async (userId, name) => {
  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         updated_at = NOW()
     WHERE id = $2
     RETURNING id, name, email, created_at`,
    [name, userId]
  );

  return result.rows[0] || null;
};
