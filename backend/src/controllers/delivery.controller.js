import { acquireLock, releaseLock } from "../utils/redisLock.js";
import { createDeliveryTransaction } from "../services/delivery.service.js";

/* CREATE */
export const createDelivery = async (req, res) => {
  const { userId, courierId, parcelData } = req.body;
  const lockKey = `lock:courier:${courierId}`;

  let lockValue;

  try {
    lockValue = await acquireLock(lockKey, 5000);

    if (!lockValue) {
      return res.status(409).json({
        success: false,
        message: "Courier is being assigned by another request",
      });
    }

    const result = await createDeliveryTransaction({
      userId,
      courierId,
      parcelData,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    if (lockValue) {
      await releaseLock(lockKey, lockValue);
    }
  }
};

/* READ ALL */
export const getAllDeliveries = async (req, res) => {
  return res.status(501).json({ message: "Not implemented yet" });
};

/* READ ONE */
export const getDeliveryById = async (req, res) => {
  return res.status(501).json({ message: "Not implemented yet" });
};
