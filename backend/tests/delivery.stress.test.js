import request from "supertest";
import app from "../src/app.js";
import { sequelize, Zone, Courier, Parcel, Delivery } from "../src/models/index.js";
import redisClient from "../src/config/redis.js"; // Adjust path to your redis config
describe("Delivery System Stress Tests", () => {
  let zone;
  let parcels = [];

  /**
   * Seed database ONCE
   */
  beforeAll(async () => {
    // Synchronize and clear database
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await sequelize.sync({ force: true });

    // Create a Test Zone
    zone = await Zone.create({
      name: "Stress Test Zone",
      coordinates: {
        type: "Polygon",
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    });

    // Create 5 couriers with mandatory fields (fullName, phone, status)
    await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        Courier.create({
          fullName: `Courier Stress ${i + 1}`,
          phone: `12345678${i}`, // Must be unique and match regex
          currentZoneId: zone.id,
          maxCapacity: 1,
          currentLoad: 0,
          status: 'available' // Matches ENUM: available, busy, offline
        })
      )
    );
  });

  /**
   * Reset parcels + deliveries BEFORE EACH TEST
   */
  beforeEach(async () => {
    // Use destroy with truncate for clean slate
    await Delivery.destroy({ where: {}, cascade: true });
    await Parcel.destroy({ where: {}, cascade: true });

    // Reset Couriers to initial state
    await Courier.update(
      { currentLoad: 0, status: 'available' },
      { where: {} }
    );

    // Create 50 parcels with mandatory recipient fields
    parcels = await Promise.all(
      Array.from({ length: 50 }).map((_, i) =>
        Parcel.create({
          trackingNumber: `TEST-TRK-${Date.now()}-${i}`, // Manually provide to pass validation
          recipientName: `Recipient ${i}`,
          recipientPhone: `98765432${i}`,
          recipientAddress: `${i} Stress Test Lane`,
          zoneId: zone.id,
          status: 'pending'
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
      request(app).post("/api/deliveries").send({ // Added /api prefix based on your app.js
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    const responses = await Promise.all(requests);

    const success = responses.filter(r => r.status === 201);
    const conflicts = responses.filter(r => r.status === 409 || r.status === 400);

    expect(success.length).toBeGreaterThan(0);
    expect(success.length + conflicts.length).toBe(10);
  });

  test("should allow only 5 deliveries (5 couriers, capacity 1)", async () => {
    const requests = parcels.map(parcel =>
      request(app).post("/api/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    const responses = await Promise.all(requests);

    const success = responses.filter(r => r.status === 201);

    // We expect exactly 5 successes because we have 5 couriers with capacity 1
    expect(success.length).toBe(5);
  });

  test("should prevent assigning the same parcel twice", async () => {
    const parcel = parcels[0];

    const requests = Array.from({ length: 10 }).map(() =>
      request(app).post("/api/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    const responses = await Promise.all(requests);

    const success = responses.filter(r => r.status === 201);
    expect(success.length).toBe(1);
  });

  test("should keep courier load consistent", async () => {
    const requests = parcels.map(parcel =>
      request(app).post("/api/deliveries").send({
        parcelId: parcel.id,
        zoneId: zone.id
      })
    );

    await Promise.all(requests);

    const couriers = await Courier.findAll();
    couriers.forEach(courier => {
      // Model validation ensures currentLoad <= maxCapacity
      expect(courier.currentLoad).toBeLessThanOrEqual(courier.maxCapacity);
    });

  });
});