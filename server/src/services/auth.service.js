import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateUserProfile } from "../repositories/user.repository.js";

import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    const error = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    name,
    email,
    passwordHash,
  });

  return {
    user,
    token: generateToken(user.id),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    token: generateToken(user.id),
  };
};


export const updateProfile = async (userId, name) => {
  const user = await updateUserProfile(userId, name);

  if (!user) {
    const error = new Error("User account not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};
