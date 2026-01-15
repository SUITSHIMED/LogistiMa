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
    if (parseInt(courier.currentLoad) >= parseInt(courier.maxCapacity)) {
      const error = new Error("Courier capacity exceeded");
      error.code = "NO_COURIER_AVAILABLE";
      throw error;
    }

    // Increment courier load (atomic)
    courier.currentLoad = parseInt(courier.currentLoad) + 1;

    // Optional: mark busy if full
    if (courier.currentLoad >= parseInt(courier.maxCapacity)) {
      courier.status = 'busy';
    }

    await courier.save({ transaction });

    // Update parcel status
    // Update parcel status
    // Lock parcel to prevent concurrent assignment
    const parcel = await Parcel.findByPk(parcelId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!parcel) {
      const error = new Error("Parcel not found");
      error.code = "PARCEL_NOT_FOUND";
      throw error;
    }

    if (parcel.status !== 'pending') {
      const error = new Error("Parcel already assigned");
      error.code = "PARCEL_ALREADY_ASSIGNED";
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