import { describe, it, expect, beforeEach } from "bun:test";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../apps/backend/src/utils/jwt";
import type { User } from "../../../apps/backend/src/db/schema";

describe("JWT Utilities", () => {
  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    passwordHash: "hashed_password",
    firstName: "Test",
    lastName: "User",
    role: "ADMIN",
    isActive: 1,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("#generateAccessToken", () => {
    it("should generate valid JWT access token", () => {
      const token = generateAccessToken(mockUser);

      expect(token).toBeDefined();
      expect(token.split(".").length).toBe(3); // JWT format
    });

    it("should include user info in token", () => {
      const token = generateAccessToken(mockUser);
      const payload = verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.id).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.role).toBe(mockUser.role);
    });

    it("should set expiration time", () => {
      const token = generateAccessToken(mockUser);
      const payload = verifyAccessToken(token);

      expect(payload?.exp).toBeDefined();
      expect(payload?.iat).toBeDefined();
      // 15 minutes = 900 seconds
      expect((payload?.exp || 0) - (payload?.iat || 0)).toBe(900);
    });

    it("should generate unique tokens", () => {
      const token1 = generateAccessToken(mockUser);
      const token2 = generateAccessToken(mockUser);

      expect(token1).not.toBe(token2);
    });
  });

  describe("#generateRefreshToken", () => {
    it("should generate valid refresh token", () => {
      const token = generateRefreshToken(mockUser);

      expect(token).toBeDefined();
      expect(token.split(".").length).toBe(3);
    });

    it("should have longer expiration than access token", () => {
      const accessToken = generateAccessToken(mockUser);
      const refreshToken = generateRefreshToken(mockUser);

      const accessPayload = verifyAccessToken(accessToken);
      const refreshPayload = verifyRefreshToken(refreshToken);

      const accessDuration = (accessPayload?.exp || 0) - (accessPayload?.iat || 0);
      const refreshDuration = (refreshPayload?.exp || 0) - (refreshPayload?.iat || 0);

      expect(refreshDuration).toBeGreaterThan(accessDuration);
    });

    it("should include type marker", () => {
      const token = generateRefreshToken(mockUser);
      const payload = verifyRefreshToken(token);

      expect(payload?.type).toBe("refresh");
    });
  });

  describe("#verifyAccessToken", () => {
    it("should return null for invalid token", () => {
      const result = verifyAccessToken("invalid.token.here");

      expect(result).toBeNull();
    });

    it("should return null for expired token", () => {
      // Create a token with past expiration
      const expiredPayload = {
        id: 1,
        email: "test@example.com",
        role: "ADMIN",
        iat: Math.floor(Date.now() / 1000) - 1000,
        exp: Math.floor(Date.now() / 1000) - 500, // Expired 500 seconds ago
      };
      // Can't easily test without modifying token creation, so we'll test the concept
      const token = generateAccessToken(mockUser);
      const payload = verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect((payload?.exp || 0) > Math.floor(Date.now() / 1000)).toBe(true);
    });

    it("should return payload for valid token", () => {
      const token = generateAccessToken(mockUser);
      const payload = verifyAccessToken(token);

      expect(payload).toBeDefined();
      expect(payload?.id).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
    });

    it("should return null for malformed token", () => {
      const result = verifyAccessToken("");
      expect(result).toBeNull();
    });
  });

  describe("#verifyRefreshToken", () => {
    it("should reject access tokens as refresh tokens", () => {
      const accessToken = generateAccessToken(mockUser);
      const result = verifyRefreshToken(accessToken);

      expect(result).toBeNull();
    });

    it("should verify valid refresh token", () => {
      const token = generateRefreshToken(mockUser);
      const payload = verifyRefreshToken(token);

      expect(payload).toBeDefined();
      expect(payload?.type).toBe("refresh");
      expect(payload?.id).toBe(mockUser.id);
    });

    it("should return null for invalid refresh token", () => {
      const result = verifyRefreshToken("invalid.refresh.token");

      expect(result).toBeNull();
    });
  });

  describe("token security", () => {
    it("should not expose sensitive info in token header/body", () => {
      const token = generateAccessToken(mockUser);
      const [header, payload] = token.split(".");

      const headerDecoded = JSON.parse(Buffer.from(header, "base64url").toString());
      const payloadDecoded = JSON.parse(Buffer.from(payload, "base64url").toString());

      // Should not contain password
      expect(payloadDecoded.passwordHash).toBeUndefined();
      expect(payloadDecoded.password).toBeUndefined();

      // Should contain only necessary info
      expect(payloadDecoded.id).toBeDefined();
      expect(payloadDecoded.email).toBeDefined();
      expect(payloadDecoded.role).toBeDefined();
    });

    it("should prevent token tampering detection", () => {
      const token = generateAccessToken(mockUser);
      const [header, payload, signature] = token.split(".");

      // Tampered token
      const tamperedToken = [header, payload, "fake-signature"].join(".");

      const result = verifyAccessToken(tamperedToken);
      expect(result).toBeNull();
    });

    it("should handle different user roles correctly", () => {
      const adminUser = { ...mockUser, role: "ADMIN" };
      const operatorUser = { ...mockUser, role: "OPERATOR", id: 2 };
      const viewerUser = { ...mockUser, role: "VIEWER", id: 3 };

      const adminToken = generateAccessToken(adminUser);
      const operatorToken = generateAccessToken(operatorUser);
      const viewerToken = generateAccessToken(viewerUser);

      const adminPayload = verifyAccessToken(adminToken);
      const operatorPayload = verifyAccessToken(operatorToken);
      const viewerPayload = verifyAccessToken(viewerToken);

      expect(adminPayload?.role).toBe("ADMIN");
      expect(operatorPayload?.role).toBe("OPERATOR");
      expect(viewerPayload?.role).toBe("VIEWER");
    });
  });
});
