import { sequelize, Courier, Parcel, Delivery, Zone } from "../models/index.js";
import { Transaction } from "sequelize";
import { deliveryQueue } from "../config/queue.js";

export const createDeliveryTransaction = async ({
  userId,
  courierId,
  parcelData, 
}) => {
  return await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (t) => {
      const courier = await Courier.findOne({
        where: { id: courierId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!courier) {
        throw new Error("Courier not found");
      }
      if (courier.status === 'offline') {
        throw new Error("Courier is offline");
      }

      if (courier.currentLoad >= courier.maxCapacity) {
        throw new Error("Courier is at full capacity");
      }

      const trackingNumber = `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const parcel = await Parcel.create(
        {
          senderId: userId,
          zoneId: parcelData.zoneId,
          weight: parcelData.weight,
          recipientName: parcelData.recipientName,
          recipientPhone: parcelData.recipientPhone,
          recipientAddress: parcelData.recipientAddress,
          trackingNumber: trackingNumber,
          status: 'pending',
          priority: parcelData.priority || 'medium'
        },
        { transaction: t }
      );

      const delivery = await Delivery.create(
        {
          parcelId: parcel.id,
          courierId: courier.id,
          status: "assigned",
          assignedAt: new Date(),
        },
        { transaction: t }
      );

      courier.currentLoad += 1;

      if (courier.currentLoad >= courier.maxCapacity) {}

      await courier.save({ transaction: t });

      await deliveryQueue.add(
        'calculate-route',
        { deliveryId: delivery.id, startLocation: "Warehouse A", limit: 5 },
        { delay: 2000 } 
      );

      return { parcel, delivery, trackingNumber };
    }
  );
};
