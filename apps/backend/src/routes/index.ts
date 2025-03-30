import { Router } from "express";
import { authenticate, callback } from "../controllers/authController";
import { verify } from "../controllers/verifyController";

export const router = Router();

// OAuth routes
router.get("/auth", authenticate);
router.get("/auth/callback", callback);

router.get("/verify/:discordId", verify);
