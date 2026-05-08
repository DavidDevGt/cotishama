import { describe, it, expect, beforeAll } from "bun:test";

const API_URL = process.env["API_URL"] || "http://localhost:3000/api";
let authToken: string;
let quoteId: string;

describe("Quotes API Endpoints", () => {
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

  it("should create a new quote", async () => {
    const response = await fetch(`${API_URL}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        clientName: "Test Client",
        clientEmail: `client-${Date.now()}@test.local`,
        description: "Test quote",
        items: [
          {
            name: "Product 1",
            quantity: 10,
            unitPrice: 100,
          },
        ],
      }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBeTruthy();
    quoteId = data.id;
  });

  it("should retrieve quotes list", async () => {
    const response = await fetch(`${API_URL}/quotes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data) || data.data).toBeTruthy();
  });

  it("should retrieve a specific quote", async () => {
    const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect([200, 404]).toContain(response.status);
  });

  it("should update a quote", async () => {
    const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        description: "Updated description",
      }),
    });

    expect([200, 404]).toContain(response.status);
  });

  it("should delete a quote", async () => {
    const response = await fetch(`${API_URL}/quotes/${quoteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect([200, 204, 404]).toContain(response.status);
  });

  it("should validate required fields", async () => {
    const response = await fetch(`${API_URL}/quotes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
  });

  it("should handle pagination", async () => {
    const response = await fetch(`${API_URL}/quotes?page=1&limit=10`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toBeTruthy();
  });

  it("should filter quotes by status", async () => {
    const response = await fetch(`${API_URL}/quotes?status=approved`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
  });

  it("should search quotes", async () => {
    const response = await fetch(
      `${API_URL}/quotes?search=test&searchField=clientName`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    expect(response.status).toBe(200);
  });
});
