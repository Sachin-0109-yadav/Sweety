import jwt from "jsonwebtoken";
import { beforeAll } from "@jest/globals";
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("Sweety API health check", () => {
  it("returns a successful health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("healthy");
    expect(response.body.message).toBe(
      "Sweety API is running successfully!"
    );
  });
});

describe("Authentication API validation", () => {
  it("rejects registration with invalid details", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "A",
        email: "invalid-email",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid registration details"
    );
    expect(response.body.errors).toBeDefined();
  });

  it("rejects login with invalid details", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "invalid-email",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid login details"
    );
    expect(response.body.errors).toBeDefined();
  });

  it("rejects access to protected profile without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Authentication required"
    );
  });
});
describe("JWT authentication security", () => {
  const testSecret = "sweety-test-secret-for-jwt-verification";

  beforeAll(() => {
    process.env.JWT_SECRET = testSecret;
  });

  it("rejects an invalid JWT token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.value");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid or expired authentication token"
    );
  });

  it("rejects an expired JWT token", async () => {
    const expiredToken = jwt.sign(
      { userId: "test-user-123" },
      testSecret,
      {
        algorithm: "HS256",
        expiresIn: "-1s",
      }
    );

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid or expired authentication token"
    );
  });
});

describe("Glucose reading route security", () => {
  const readingId = "00000000-0000-4000-8000-000000000001";

  it("rejects listing readings without authentication", async () => {
    const response = await request(app).get("/api/readings");

    expect(response.status).toBe(401);
  });

  it("rejects creating readings without authentication", async () => {
    const response = await request(app)
      .post("/api/readings")
      .send({
        reading_date: "2026-11-08",
        reading_slot: "Morning fasting",
        glucose_level: 105,
      });

    expect(response.status).toBe(401);
  });

  it("rejects viewing a reading without authentication", async () => {
    const response = await request(app).get(
      `/api/readings/${readingId}`
    );

    expect(response.status).toBe(401);
  });

  it("rejects updating a reading without authentication", async () => {
    const response = await request(app)
      .put(`/api/readings/${readingId}`)
      .send({ glucose_level: 110 });

    expect(response.status).toBe(401);
  });

  it("rejects deleting a reading without authentication", async () => {
    const response = await request(app).delete(
      `/api/readings/${readingId}`
    );

    expect(response.status).toBe(401);
  });
});

describe("Health report route security", () => {
  it("rejects report access without authentication", async () => {
    const response = await request(app).get(
      "/api/reports?period=daily"
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Authentication required"
    );
  });

  it("rejects report access without a token for any period", async () => {
    const response = await request(app).get(
      "/api/reports?period=previousMonth"
    );

    expect(response.status).toBe(401);
  });

  it("rejects an invalid report period with authentication", async () => {
    const testToken = jwt.sign(
      { userId: "test-user-123" },
      "sweety-test-secret-for-jwt-verification",
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    const response = await request(app)
      .get("/api/reports?period=invalid")
      .set("Authorization", `Bearer ${testToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      "Invalid report period"
    );
  });
});
