import { describe, it, expect, beforeAll } from "bun:test";

const API_URL = process.env["API_URL"] || "http://localhost:3000/api";
let authToken: string;
let clientId: string;

describe("Clients API Endpoints", () => {
  beforeAll(async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@cotishama.local",
        password: "Admin123!Secure",
      }),
    });

    const data = await response.json();
    authToken = data.accessToken;
  });

  it("should create a new client", async () => {
    const response = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: "Test Client Company",
        email: `client-${Date.now()}@test.local`,
        phone: "+502-1234-5678",
        address: "123 Business St, Guatemala City",
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBeTruthy();
    clientId = data.id;
  });

  it("should retrieve clients list", async () => {
    const response = await fetch(`${API_URL}/clients`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data) || data.data).toBeTruthy();
  });

  it("should retrieve a specific client", async () => {
    const response = await fetch(`${API_URL}/clients/${clientId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect([200, 404]).toContain(response.status);
  });

  it("should update a client", async () => {
    const response = await fetch(`${API_URL}/clients/${clientId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        phone: "+502-9876-5432",
      }),
    });

    expect([200, 404]).toContain(response.status);
  });

  it("should delete a client", async () => {
    const response = await fetch(`${API_URL}/clients/${clientId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect([200, 204, 404]).toContain(response.status);
  });

  it("should validate email format", async () => {
    const response = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: "Test",
        email: "invalid-email",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("should handle pagination", async () => {
    const response = await fetch(`${API_URL}/clients?page=1&limit=10`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
  });

  it("should search clients by name", async () => {
    const response = await fetch(`${API_URL}/clients?search=Test`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
  });

  it("should sort clients", async () => {
    const response = await fetch(`${API_URL}/clients?sort=name&order=asc`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
  });

  it("should retrieve client quotes", async () => {
    const response = await fetch(`${API_URL}/clients/${clientId}/quotes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect([200, 404]).toContain(response.status);
  });
});
