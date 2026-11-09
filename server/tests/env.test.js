
import {
  afterEach,
  describe,
  expect,
  it,
} from "@jest/globals";

import { validateEnv } from "../src/config/env.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Environment configuration validation", () => {
  it("accepts valid environment configuration", () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "sweety_db";
    process.env.DB_USER = "postgres";
    process.env.DB_PASSWORD = "test-password";
    process.env.JWT_SECRET = "a-secure-test-secret-with-more-than-32-characters";
    process.env.DB_PORT = "5432";

    expect(() => validateEnv()).not.toThrow();
  });

  it("rejects missing database configuration", () => {
    delete process.env.DB_HOST;

    expect(() => validateEnv()).toThrow(
      "Missing required environment variables"
    );
  });

  it("rejects a weak JWT secret", () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "sweety_db";
    process.env.DB_USER = "postgres";
    process.env.DB_PASSWORD = "test-password";
    process.env.JWT_SECRET = "short-secret";

    expect(() => validateEnv()).toThrow(
      "JWT_SECRET must contain at least 32 characters."
    );
  });

  it("rejects an invalid database port", () => {
    process.env.DB_HOST = "localhost";
    process.env.DB_NAME = "sweety_db";
    process.env.DB_USER = "postgres";
    process.env.DB_PASSWORD = "test-password";
    process.env.JWT_SECRET = "a-secure-test-secret-with-more-than-32-characters";
    process.env.DB_PORT = "invalid";

    expect(() => validateEnv()).toThrow(
      "DB_PORT must be a valid port number."
    );
  });
});
