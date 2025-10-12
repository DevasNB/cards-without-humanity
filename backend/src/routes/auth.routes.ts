// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../types/auth";

const router = Router();
const authController = new AuthController(); // Instantiate the controller

// POST /api/auth/register - Route to create a new user
router.post(
  "/register",
  validate(createUserSchema), // 1. Validate the request body using the Zod schema
  asyncHandler(authController.createUser) // 2. Wrap the async controller method for error handling
);

export default router;
