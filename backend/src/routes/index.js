import { Router } from "express";
import healthRoutes from "./health.routes.js";
import deliveryRoutes from "./delivery.routes.js";

const router = Router();

// Health
router.use("/", healthRoutes);

// Deliveries
router.use("/deliveries", deliveryRoutes);

export default router;
