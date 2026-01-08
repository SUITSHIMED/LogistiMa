import sequelize from "../config/db.js";
import { Transaction } from "sequelize";
import Courier from "../models/Courier.js";
import Parcel from "../models/Parcel.js";
import Delivery from "../models/Delivery.js";

export const createDeliveryTransaction = async ({
  userId,
  courierId,
  weight,
}) => {
  return await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
    async (t) => {
      const courier = await Courier.findOne({
        where: { id: courierId },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!courier || !courier.isAvailable) {
        throw new Error("Courier not available");
      }

      const parcel = await Parcel.create(
        { userId, weight },
        { transaction: t }
      );

      const delivery = await Delivery.create(
        {
          parcelId: parcel.id,
          courierId: courier.id,
          status: "pending",
        },
        { transaction: t }
      );
      
      courier.isAvailable = false;
      await courier.save({ transaction: t });

     
      return { parcel, delivery };
    }
  );
};
