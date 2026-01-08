import { Router } from "express";
import healthRoutes from "./health.routes.js";
import deliveryRoutes from "./delivery.routes.js";

const router = Router();

router.use("/", healthRoutes);

router.use("/deliveries", deliveryRoutes);

export default router;
