import { Worker } from 'bullmq';
import { Delivery } from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
};

console.log("🚀 Worker Service Starting...");

const worker = new Worker('delivery-queue', async (job) => {
    console.log(`[Job ${job.id}] Processing ${job.name}...`);

    if (job.name === 'calculate-route') {
        const { deliveryId, startLocation } = job.data;

        // Simulate complex calculation (Story 5.3)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Update Delivery with Route Data
        try {
            const delivery = await Delivery.findByPk(deliveryId);
            if (delivery) {
                delivery.routeData = {
                    start: startLocation,
                    estimatedTime: "45 mins",
                    path: ["Warehouse", "Point A", "Point B", "Destination"]
                };
                await delivery.save();
                console.log(`[Job ${job.id}] Route calculated for Delivery ${deliveryId}`);
            }
        } catch (err) {
            console.error(`[Job ${job.id}] Failed to update delivery:`, err);
            throw err;
        }
    }
}, {
    connection: redisConnection,
    concurrency: 5
});

worker.on('completed', job => {
    console.log(`[Job ${job.id}] has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`[Job ${job.id}] has failed with ${err.message}`);
});

