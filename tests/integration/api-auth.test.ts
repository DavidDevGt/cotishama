import { describe, it, expect, beforeAll, afterAll } from "bun:test";

const API_URL = process.env["API_URL"] || "http://localhost:3000/api";

describe("Authentication API Endpoints", () => {
  let authToken: string;
  let refreshToken: string;

  it("should register a new user", async () => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `user-${Date.now()}@cotishama.local`,
        password: "SecurePassword123!",
        firstName: "Test",
        lastName: "User",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.accessToken).toBeTruthy();
    expect(data.refreshToken).toBeTruthy();
  });

  it("should login with valid credentials", async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@cotishama.local",
        password: "Admin123!Secure",
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.accessToken).toBeTruthy();
    expect(data.refreshToken).toBeTruthy();
    authToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  it("should reject invalid credentials", async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@cotishama.local",
        password: "WrongPassword",
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should refresh access token", async () => {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.accessToken).toBeTruthy();
  });

  it("should validate JWT token", async () => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
  });

  it("should reject invalid token", async () => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer invalid.token.here",
      },
    });

    expect(response.status).toBe(401);
  });

  it("should require Bearer token for protected routes", async () => {
    const response = await fetch(`${API_URL}/quotes`, {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  it("should accept Bearer token in Authorization header", async () => {
    const response = await fetch(`${API_URL}/quotes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect([200, 400, 404]).toContain(response.status);
  });
});
