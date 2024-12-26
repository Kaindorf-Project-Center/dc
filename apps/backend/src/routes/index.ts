import { Router } from "express";
import { authenticate, callback } from "../controllers/authController";

export const router = Router();

// OAuth routes
router.get("/auth", authenticate);
router.get("/auth/callback", callback);
