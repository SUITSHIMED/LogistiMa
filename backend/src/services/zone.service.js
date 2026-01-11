import redisClient from "../config/redis.js";
import { Zone } from "../models/index.js";

const CACHE_KEY = "zones:all";
const CACHE_TTL = 3600; 

export const getZonesWithCache = async () => {
    try {
        await redisClient.connect(); 
    } catch (e) {
    }

    try {
        const cachedZones = await redisClient.get(CACHE_KEY);
        if (cachedZones) {
            console.log(" Returning zones from Redis Cache");
            return JSON.parse(cachedZones);
        }

        console.log(" Fetching zones from Database");
        const zones = await Zone.findAll({
            where: { isActive: true }
        });

        if (zones) {
            await redisClient.setEx(CACHE_KEY, CACHE_TTL, JSON.stringify(zones));
        }

        return zones;
    } catch (error) {
        console.error("Cache Error:", error);
        return await Zone.findAll({ where: { isActive: true } });
    }
};

export const invalidateZoneCache = async () => {
    try {
        await redisClient.del(CACHE_KEY);
        console.log("Zone cache invalidated");
    } catch (error) {
        console.error("Failed to invalidate cache", error);
    }
};
