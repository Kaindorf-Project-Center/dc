import { Router } from "express";
import { authenticate, callback } from "../controllers/authController";
import { verifyUser } from "../controllers/userController";

export const router = Router();

// OAuth routes
router.get("/auth", authenticate);
router.get("/auth/callback", callback);

router.post("/verify/:discordId", verifyUser);
