import request from "supertest";
import app from "./app.js";
import sequelize from "../src/models/index.js";

import Zone from "../src/models/Zone.js";
import Courier from "../src/models/Courier.js";
import Parcel from "../src/models/Parcel.js";
import Delivery from "../src/models/Delivery.js";

describe("Delivery System Stress Tests", () => {
  let zone;
  let parcels = [];

  /**
   * Seed database ONCE
   */
  beforeAll(async () => {
    await sequelize.sync({ force: true });

    zone = await Zone.create({
      name: "Stress Test Zone",
      coordinates: {
        type: "Polygon",
        coordinates: [[[0, 0],[1, 0],[1, 1],[0, 1],[0, 0]]]
      }
    });

    // Create 5 couriers, capacity = 1 each
    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        Courier.create({
          name: `Courier ${i + 1}`,
          zoneId: zone.id,
          maxCapacity: 1,
          currentLoad: 0,
          available: true
        })
      )
    );
  });

  /**
   * Reset parcels + deliveries BEFORE EACH TEST
   */
  beforeEach(async () => {
    await Delivery.destroy({ where: {} });
    await Parcel.destroy({ where: {} });

    parcels = await Promise.all(
      Array.from({ length: 50 }).map((_, i) =>
        Parcel.create({
          reference: `PKG-${i}`,
          zoneId: zone.id
        })
      )
    );
  });

  /**
   * Cleanup DB connection
   */
  afterAll(async () => {
    await sequelize.close();
  });

  test("should handle 10 concurrent delivery requests safely", async () => {
    const requests = parcels.slice(0, 10).map(parcel =>
      request(app).post("/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    const responses = await Promise.all(requests);

    const success = responses.filter(r => r.status === 201);
    const conflicts = responses.filter(r => r.status === 409);

    expect(success.length).toBeGreaterThan(0);
    expect(success.length + conflicts.length).toBe(10);
  });

  test("should allow only 5 deliveries (5 couriers, capacity 1)", async () => {
    const requests = parcels.map(parcel =>
      request(app).post("/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    const responses = await Promise.all(requests);

    const success = responses.filter(r => r.status === 201);
    const conflicts = responses.filter(r => r.status === 409);

    expect(success.length).toBe(5);
    expect(conflicts.length).toBe(45);
  });

  test("should prevent assigning the same parcel twice", async () => {
    const parcel = parcels[0];

    const requests = Array.from({ length: 10 }).map(() =>
      request(app).post("/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    const responses = await Promise.all(requests);

    const success = responses.filter(r => r.status === 201);
    const conflicts = responses.filter(r => r.status === 409);

    expect(success.length).toBe(1);
    expect(conflicts.length).toBe(9);
  });

  test("should keep courier load consistent", async () => {
    const requests = parcels.map(parcel =>
      request(app).post("/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    await Promise.all(requests);

    const couriers = await Courier.findAll();

    couriers.forEach(courier => {
      expect(courier.currentLoad).toBeLessThanOrEqual(1);
    });
  });
});
