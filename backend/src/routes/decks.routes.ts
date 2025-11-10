import { Router } from "express";
import { DecksController } from "../controllers/decks.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
const decksController = new DecksController(); // Instantiate the controller

// --- Protected Routes (require JWT authentication) ---

// GET /api/rooms - Get all rooms
router.get("/", asyncHandler(decksController.getAllDecks));

export default router;
