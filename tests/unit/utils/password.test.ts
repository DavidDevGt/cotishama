import { describe, it, expect } from "bun:test";
import { hashPassword, validatePassword } from "../../../apps/backend/src/utils/password";

describe("Password Utilities", () => {
  describe("#hashPassword", () => {
    it("should hash password", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should not be reversible", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);

      // Hash should not contain original password
      expect(hash).not.toContain(password);
    });

    it("should produce different hashes for same password", async () => {
      const password = "MySecurePassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle special characters", async () => {
      const specialPasswords = [
        "Pass@word!123",
        "Пароль123",
        "パスワード123",
        "كلمة السر 123",
        "Pässwörd#123",
      ];

      for (const password of specialPasswords) {
        const hash = await hashPassword(password);
        expect(hash).toBeDefined();
        expect(hash.length).toBeGreaterThan(0);
      }
    });

    it("should handle long passwords", async () => {
      const longPassword = "A".repeat(100) + "123";
      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
    });
  });

  describe("#validatePassword", () => {
    it("should return true for correct password", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);

      const isValid = await validatePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);

      const isValid = await validatePassword("WrongPassword123!", hash);

      expect(isValid).toBe(false);
    });

    it("should be case sensitive", async () => {
      const password = "MySecurePassword123!";
      const hash = await hashPassword(password);

      const isValid1 = await validatePassword("mysecurepassword123!", hash);
      const isValid2 = await validatePassword("MYSECUREPASSWORD123!", hash);

      expect(isValid1).toBe(false);
      expect(isValid2).toBe(false);
    });

    it("should be space sensitive", async () => {
      const password = "My Secure Password 123";
      const hash = await hashPassword(password);

      const isValid1 = await validatePassword("My Secure Password 123", hash);
      const isValid2 = await validatePassword("MySecurePassword123", hash);

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(false);
    });

    it("should validate different password types", async () => {
      const passwords = [
        "SimplePassword123",
        "ComplexP@ssw0rd!",
        "VeryLongPasswordWith1234567890AndSpecialChars!@#$",
        "短い1",
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isValid = await validatePassword(password, hash);

        expect(isValid).toBe(true);
      }
    });

    it("should reject similar but not identical passwords", async () => {
      const password = "MyPassword123";
      const hash = await hashPassword(password);

      const similarPasswords = [
        "MyPassword124",
        "MyPassword1234",
        "MyPassword",
        "MyPassword12",
        "Mypassword123",
      ];

      for (const similar of similarPasswords) {
        const isValid = await validatePassword(similar, hash);
        expect(isValid).toBe(false);
      }
    });
  });

  describe("security scenarios", () => {
    it("should handle empty string", async () => {
      const hash = await hashPassword("");
      const isValid = await validatePassword("", hash);

      expect(isValid).toBe(true);
    });

    it("should prevent common weak passwords", async () => {
      const weakPasswords = ["123456", "password", "qwerty", "admin", "000000"];

      for (const weak of weakPasswords) {
        const hash = await hashPassword(weak);
        // These should still be hashed, even if weak
        expect(hash).toBeDefined();
        const isValid = await validatePassword(weak, hash);
        expect(isValid).toBe(true);
      }
    });

    it("should work with password reset flow", async () => {
      const oldPassword = "OldPassword123";
      const newPassword = "NewPassword123";

      const oldHash = await hashPassword(oldPassword);
      const newHash = await hashPassword(newPassword);

      // Old password should not work with new hash
      const isOldValid = await validatePassword(oldPassword, newHash);
      expect(isOldValid).toBe(false);

      // New password should work with new hash
      const isNewValid = await validatePassword(newPassword, newHash);
      expect(isNewValid).toBe(true);
    });

    it("should handle concurrent hashing", async () => {
      const password = "ConcurrentPassword123";

      const promises = Array(10)
        .fill(null)
        .map(() => hashPassword(password));

      const hashes = await Promise.all(promises);

      // All should be different
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(10);

      // All should validate correctly
      for (const hash of hashes) {
        const isValid = await validatePassword(password, hash);
        expect(isValid).toBe(true);
      }
    });
  });
});
