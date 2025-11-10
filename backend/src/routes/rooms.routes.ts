// src/routes/rooms.routes.ts
import { Router } from "express";
import { RoomsController } from "../controllers/rooms.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const roomsController = new RoomsController(); // Instantiate the controller

// --- Protected Routes (require JWT authentication) ---

// POST /api/rooms/new - Create a new room
router.post(
  "/new",
  authenticate(), // This middleware runs first to verify the JWT
  asyncHandler(roomsController.createRoom) // Then the controller logic
);

// GET /api/rooms - Get all rooms
router.get("/", asyncHandler(roomsController.getAllRooms));

export default router;
