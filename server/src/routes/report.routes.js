
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getReport } from "../controllers/report.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getReport);

export default router;
