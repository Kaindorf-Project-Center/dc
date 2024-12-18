import { Router } from "express";
import { getUser, createUser } from "../controllers/userController";

export const router = Router();

// Define routes
router.get("/user", getUser);
router.post("/user", createUser);
