import request from "supertest";
import app from "../src/app.js";

describe("Health check", () => {
  it("should return 200 for root", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  it("should return 200 for /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("UP");
  });
});
