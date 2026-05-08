import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { AuthService } from "../../../apps/backend/src/services/AuthService";
import { AuthenticationError } from "../../../apps/backend/src/types/errors";
import { UserFactory } from "../../factories";
import { setupTestDB, teardownTestDB, TEST_DATA } from "../../setup";
import { db } from "../../../apps/backend/src/db/client";
import { users } from "../../../apps/backend/src/db/schema";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(async () => {
    await setupTestDB();
    authService = new AuthService();
  });

  afterEach(async () => {
    await teardownTestDB();
  });

  describe("#register", () => {
    it("should create new user with hashed password", async () => {
      const result = await authService.register(
        TEST_DATA.VALID_EMAIL,
        TEST_DATA.VALID_PASSWORD,
        "John",
        "Doe",
      );

      expect(result).toBeDefined();
      expect(result.email).toBe(TEST_DATA.VALID_EMAIL);
      expect(result.firstName).toBe("John");
      expect(result.lastName).toBe("Doe");
      expect(result.role).toBe("VIEWER");
      expect(result.isActive).toBe(1);
      expect(result.passwordHash).not.toBe(TEST_DATA.VALID_PASSWORD); // Hashed
    });

    it("should throw error for duplicate email", async () => {
      await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);

      try {
        await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        expect((error as Error).message).toContain("already registered");
      }
    });

    it("should set default role to VIEWER", async () => {
      const result = await authService.register("test@example.com", TEST_DATA.VALID_PASSWORD);

      expect(result.role).toBe("VIEWER");
    });

    it("should accept optional first and last names", async () => {
      const result = await authService.register("test@example.com", TEST_DATA.VALID_PASSWORD);

      expect(result.firstName).toBeUndefined();
      expect(result.lastName).toBeUndefined();
    });
  });

  describe("#login", () => {
    beforeEach(async () => {
      await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);
    });

    it("should return user and tokens for valid credentials", async () => {
      const result = await authService.login({
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(TEST_DATA.VALID_EMAIL);
    });

    it("should update last login timestamp", async () => {
      const userBefore = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, TEST_DATA.VALID_EMAIL),
      });

      await new Promise((r) => setTimeout(r, 100));

      await authService.login({
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
      });

      const userAfter = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, TEST_DATA.VALID_EMAIL),
      });

      // lastLogin should be updated
      expect(userAfter?.lastLogin?.getTime()).toBeGreaterThan(
        userBefore?.lastLogin?.getTime() || 0,
      );
    });

    it("should throw error for invalid email", async () => {
      try {
        await authService.login({
          email: "nonexistent@example.com",
          password: TEST_DATA.VALID_PASSWORD,
        });
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should throw error for invalid password", async () => {
      try {
        await authService.login({
          email: TEST_DATA.VALID_EMAIL,
          password: "WrongPassword123",
        });
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should throw error for inactive user", async () => {
      // Create inactive user
      const inactiveFactory = await UserFactory.create({ isActive: 0 });
      await authService.register(inactiveFactory.email, TEST_DATA.VALID_PASSWORD);

      // Mark as inactive
      await db
        .update(users)
        .set({ isActive: 0 })
        .where((u) => u.email === inactiveFactory.email);

      try {
        await authService.login({
          email: inactiveFactory.email,
          password: TEST_DATA.VALID_PASSWORD,
        });
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should return valid JWT tokens", async () => {
      const result = await authService.login({
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
      });

      // JWT format: header.payload.signature
      const accessParts = result.accessToken.split(".");
      const refreshParts = result.refreshToken.split(".");

      expect(accessParts.length).toBe(3);
      expect(refreshParts.length).toBe(3);
    });
  });

  describe("#refreshToken", () => {
    let refreshToken: string;

    beforeEach(async () => {
      await authService.register(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);

      const loginResult = await authService.login({
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
      });

      refreshToken = loginResult.refreshToken;
    });

    it("should return new access token", async () => {
      const newAccessToken = await authService.refreshToken(refreshToken);

      expect(newAccessToken).toBeDefined();
      expect(newAccessToken).not.toBe(refreshToken);
      expect(newAccessToken.split(".").length).toBe(3);
    });

    it("should throw error for invalid refresh token", async () => {
      try {
        await authService.refreshToken("invalid.token.here");
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should throw error for expired refresh token", async () => {
      // Create an expired token (past date)
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjowfQ.signature";

      try {
        await authService.refreshToken(expiredToken);
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });

    it("should throw error if user no longer exists", async () => {
      // Get the user ID from the token
      // Then delete the user
      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, TEST_DATA.VALID_EMAIL),
      });

      if (user) {
        await db.delete(users).where((u) => u.id === user.id);
      }

      try {
        await authService.refreshToken(refreshToken);
        expect.unreachable("Should throw AuthenticationError");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });
  });

  describe("password security", () => {
    it("should never store plain text passwords", async () => {
      const email = "security@test.com";
      const password = "SecurePass123!";

      await authService.register(email, password);

      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, email),
      });

      expect(user?.passwordHash).not.toBe(password);
      expect(user?.passwordHash?.length).toBeGreaterThan(0);
    });

    it("should produce different hashes for same password", async () => {
      const password = "SamePassword123";

      await authService.register("user1@test.com", password);
      await authService.register("user2@test.com", password);

      const user1 = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, "user1@test.com"),
      });

      const user2 = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, "user2@test.com"),
      });

      expect(user1?.passwordHash).not.toBe(user2?.passwordHash);
    });
  });
});
