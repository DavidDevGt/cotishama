import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import app from "../../../apps/backend/src/index";
import { setupTestDB, teardownTestDB, TEST_DATA, responseValidation } from "../../setup";
import { AuthService } from "../../../apps/backend/src/services/AuthService";

describe("POST /api/v1/auth/login - Integration", () => {
  let authService: AuthService;

  beforeEach(async () => {
    await setupTestDB();
    authService = new AuthService();
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("successful login", () => {
    beforeEach(async () => {
      await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);
    });

    it("should return 200 with tokens on valid credentials", async () => {
      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: TEST_DATA.VALID_EMAIL,
          password: TEST_DATA.VALID_PASSWORD,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(responseValidation.isSuccessResponse(data)).toBe(true);
      expect(data.data.user).toBeDefined();
      expect(data.data.user.email).toBe(TEST_DATA.VALID_EMAIL);
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.accessToken.split(".").length).toBe(3);
    });

    it("should set refresh token in httpOnly cookie", async () => {
      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: TEST_DATA.VALID_EMAIL,
          password: TEST_DATA.VALID_PASSWORD,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const setCookieHeader = response.headers.get("set-cookie");
      expect(setCookieHeader).toContain("refreshToken");
      expect(setCookieHeader).toContain("HttpOnly");
      expect(setCookieHeader).toContain("Secure");
    });

    it("should return user without sensitive data", async () => {
      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: TEST_DATA.VALID_EMAIL,
          password: TEST_DATA.VALID_PASSWORD,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      const user = data.data.user;

      expect(user.passwordHash).toBeUndefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
    });
  });

  describe("error cases", () => {
    it("should return 401 for non-existent email", async () => {
      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: TEST_DATA.VALID_PASSWORD,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(responseValidation.isUnauthorized(data)).toBe(true);
    });

    it("should return 401 for invalid password", async () => {
      await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);

      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: TEST_DATA.VALID_EMAIL,
          password: "WrongPassword123",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(responseValidation.isUnauthorized(data)).toBe(true);
    });

    it("should return 400 for invalid format", async () => {
      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          password: "short",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for missing fields", async () => {
      const response = await app.request("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: TEST_DATA.VALID_EMAIL,
          // missing password
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(400);
    });
  });
});

describe("POST /api/v1/auth/register - Integration", () => {
  beforeEach(async () => {
    await setupTestDB();
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  it("should register new user with 201", async () => {
    const response = await app.request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@example.com",
        password: TEST_DATA.VALID_PASSWORD,
        firstName: "John",
        lastName: "Doe",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    expect(response.status).toBe(201);
    expect(responseValidation.isSuccessResponse(data)).toBe(true);
    expect(data.data.user.email).toBe("newuser@example.com");
    expect(data.data.user.role).toBe("VIEWER");
  });

  it("should return 400 for duplicate email", async () => {
    const registerData = {
      email: "duplicate@example.com",
      password: TEST_DATA.VALID_PASSWORD,
    };

    // First registration
    await app.request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
      headers: { "Content-Type": "application/json" },
    });

    // Duplicate registration
    const response = await app.request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/v1/auth/refresh - Integration", () => {
  let refreshToken: string;

  beforeEach(async () => {
    await setupTestDB();
    const authService = new AuthService();
    await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);

    const loginResult = await authService.login({
      email: TEST_DATA.VALID_EMAIL,
      password: TEST_DATA.VALID_PASSWORD,
    });

    refreshToken = loginResult.refreshToken;
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  it("should return new access token with 200", async () => {
    const response = await app.request("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(responseValidation.isSuccessResponse(data)).toBe(true);
    expect(data.data.accessToken).toBeDefined();
  });

  it("should return 401 for invalid refresh token", async () => {
    const response = await app.request("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: "invalid.token" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status).toBe(401);
  });
});

describe("POST /api/v1/auth/logout - Integration", () => {
  it("should return 200 with clear cookie", async () => {
    const response = await app.request("/api/v1/auth/logout", {
      method: "POST",
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(responseValidation.isSuccessResponse(data)).toBe(true);

    const setCookieHeader = response.headers.get("set-cookie");
    expect(setCookieHeader).toContain("refreshToken=");
    expect(setCookieHeader).toContain("Max-Age=0");
  });
});
