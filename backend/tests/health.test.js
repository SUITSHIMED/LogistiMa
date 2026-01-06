import request from "supertest";
import app from "../src/app.js";

describe("Health check", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
