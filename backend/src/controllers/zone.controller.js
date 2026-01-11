import { getZonesWithCache } from "../services/zone.service.js";

export const getZones = async (req, res) => {
    try {
        const zones = await getZonesWithCache();

        res.status(200).json({
            success: true,
            data: zones,
        });
    } catch (error) {
        console.error("Error fetching zones:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch zones",
            error: error.message,
        });
    }
};
