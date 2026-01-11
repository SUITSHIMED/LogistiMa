export async function assignCourierToParcel({ parcelId, zoneId }) {
  // Lazy import to avoid circular dependency issues
  const { sequelize, Courier, Parcel, Delivery } = await import("../models/index.js");
  
  return sequelize.transaction(async (transaction) => {
    // Lock one available courier in the zone
    const courier = await Courier.findOne({
      where: {
        currentZoneId: zoneId,
        status: 'available'
      },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    // No courier found → conflict
    if (!courier) {
      const error = new Error("No courier available");
      error.code = "NO_COURIER_AVAILABLE";
      throw error;
    }

    // Capacity check (inside lock)
    if (courier.currentLoad >= courier.maxCapacity) {
      const error = new Error("Courier capacity exceeded");
      error.code = "NO_COURIER_AVAILABLE";
      throw error;
    }

    // Increment courier load (atomic)
    courier.currentLoad += 1;

    // Optional: mark busy if full
    if (courier.currentLoad >= courier.maxCapacity) {
      courier.status = 'busy';
    }

    await courier.save({ transaction });

    // Update parcel status
    const parcel = await Parcel.findByPk(parcelId, { transaction });

    if (!parcel) {
      const error = new Error("Parcel not found");
      error.code = "PARCEL_NOT_FOUND";
      throw error;
    }

    parcel.status = "assigned";
    await parcel.save({ transaction });

    // Create delivery
    const delivery = await Delivery.create(
      {
        parcelId,
        courierId: courier.id,
        status: "assigned"
      },
      { transaction }
    );

    // Transaction COMMIT happens automatically here
    return delivery;
  });
}