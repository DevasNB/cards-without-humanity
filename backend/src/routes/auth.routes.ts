// src/routes/auth.routes.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "cah-shared";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController(); // Instantiate the controller

// POST /api/auth/register - Route to create a new user
router.post(
  "/register",
  validate(createUserSchema), // 1. Validate the request body using the Zod schema
  asyncHandler(authController.createUser) // 2. Wrap the async controller method for error handling
);

// POST /api/auth/login - Authenticate user and get JWT
router.post(
  "/login/anonymous",
  validate(createUserSchema),
  asyncHandler(authController.loginAnonymous)
);

// --- Protected Routes (require JWT authentication) ---

// GET /api/auth/me - Get current authenticated user's profile
router.get(
  "/me",
  authenticate(), // This middleware runs first to verify the JWT
  asyncHandler(authController.getCurrentUser) // Then the controller logic
);

// POST /api/auth/logout - Log out the current user
router.post("/logout", authenticate(), asyncHandler(authController.logout));

export default router;
