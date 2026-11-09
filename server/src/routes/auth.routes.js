
import { Router } from "express";

import {
  register,
  login,
  getCurrentUser,
  editProfile,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getCurrentUser);
router.patch("/profile", authenticate, editProfile);

export default router;
