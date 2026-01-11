import { assignCourierToParcel } from "../services/dispatcher.service.js";

export const createDelivery = async (req, res) => {
  try {
    const { parcelId, zoneId } = req.body;

    if (!parcelId || !zoneId) {
      return res.status(400).json({
        success: false,
        message: "parcelId and zoneId are required"
      });
    }

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
  }
};

export const getAllDeliveries = async (req, res) => {
  try {
    // (to be implemented later with DB)
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

export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;

    // (to be implemented later with DB)
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
