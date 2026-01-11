import { acquireLock, releaseLock } from "../utils/redisLock.js";
import { assignCourierToParcel } from "../services/dispatcher.service.js";

/* CREATE - Auto-assign courier to existing parcel */
export const createDelivery = async (req, res) => {
  const { parcelId, zoneId } = req.body;
  
  // Validation
  if (!parcelId || !zoneId) {
    return res.status(400).json({
      success: false,
      message: "parcelId and zoneId are required"
    });
  }

  // Use zone-based lock instead of courier-specific
  const lockKey = `lock:zone:${zoneId}`;
  let lockValue;

  try {
    // Acquire distributed lock
    lockValue = await acquireLock(lockKey, 5000);
    if (!lockValue) {
      return res.status(409).json({
        success: false,
        message: "Zone is being processed by another request. Please retry.",
      });
    }

    // Assign courier to parcel
    const delivery = await assignCourierToParcel({ parcelId, zoneId });

    return res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: delivery
    });

  } catch (error) {
    console.error("Error creating delivery:", error);

    // No courier available
    if (error.code === "NO_COURIER_AVAILABLE") {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    // Parcel not found
    if (error.code === "PARCEL_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    // Unknown error
    return res.status(500).json({
      success: false,
      message: "Failed to create delivery",
      error: error.message
    });

  } finally {
    // Always release lock
    if (lockValue) {
      await releaseLock(lockKey, lockValue);
    }
  }
};

/* READ ALL */
export const getAllDeliveries = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: [],
      message: "Deliveries retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deliveries",
      error: error.message
    });
  }
};

/* READ ONE */
export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    res.status(200).json({
      success: true,
      data: { id },
      message: "Delivery retrieved successfully"
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery",
      error: error.message
    });
  }
};