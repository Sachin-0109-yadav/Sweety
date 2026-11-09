import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  addReading,
  listReadings,
  getSingleReading,
  editReading,
  removeReading,
} from "../controllers/reading.controller.js";

const router = Router();

// Every reading endpoint requires authentication
router.use(authenticate);

router.post("/", addReading);
router.get("/", listReadings);
router.get("/:id", getSingleReading);
router.put("/:id", editReading);
router.delete("/:id", removeReading);

export default router;