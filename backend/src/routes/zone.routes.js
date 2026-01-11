import express from "express";
import { getZones } from "../controllers/zone.controller.js";

const router = express.Router();

router.get("/", getZones);

export default router;
