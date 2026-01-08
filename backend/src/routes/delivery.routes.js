import express from "express";
import { 
  createDelivery,
  getAllDeliveries,
  getDeliveryById
} from "../controllers/delivery.controller.js"; 

const router = express.Router();

router.post("/", createDelivery);
router.get("/", getAllDeliveries);
router.get("/:id", getDeliveryById);

export default router;