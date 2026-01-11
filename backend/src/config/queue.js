import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
};

const testStub = {
    add: async () => Promise.resolve(),
    close: async () => Promise.resolve(),
};

export const deliveryQueue = process.env.NODE_ENV === 'test'
    ? testStub
    : new Queue('delivery-queue', { connection: redisConnection });

export const notificationQueue = process.env.NODE_ENV === 'test'
    ? testStub
    : new Queue('notification-queue', { connection: redisConnection });

export const queues = {
        delivery: deliveryQueue,
        notification: notificationQueue
};
