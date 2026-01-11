import { Router } from "express";
import healthRoutes from "./health.routes.js";
import deliveryRoutes from "./delivery.routes.js";
import zoneRoutes from "./zone.routes.js";

const router = Router();

router.use("/", healthRoutes);

router.use("/deliveries", deliveryRoutes);

router.use("/zones", zoneRoutes);

export default router;
