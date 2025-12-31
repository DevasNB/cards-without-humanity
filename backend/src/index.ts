import express, { NextFunction, Request, Response } from "express";
import { createServer, Server as HttpServer } from "node:http"; // Import createServer and HttpServer type
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import roomsRoutes from "./routes/rooms.routes";
import decksRoutes from "./routes/decks.routes";

import { AppError } from "./utils/errors";
import { PORT } from "./configs/constants";
import { corsMiddleware, corsOptions } from "./configs/corsOptions";
import { initializeSocketIO } from "./socket";
import { IoInstance } from "./socket/config";

const app = express();

// Create an HTTP server instance from your Express app
const httpServer: HttpServer = createServer(app);

// Initialize Socket.io
const io: IoInstance = initializeSocketIO(httpServer);

// Middleware to parse JSON incoming requests
app.use(express.json());
app.use(corsMiddleware());
app.use(cors(corsOptions));

// --- Routes ---
app.use("/api/auth", authRoutes); // Mount authentication routes
app.use("/api/rooms", roomsRoutes); // Mount rooms routes
app.use("/api/decks", decksRoutes); // Mount decks routes

// You can also add a simple route to verify API is running
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", api: "running", sockets: io.engine.clientsCount });
});

// Default route
app.get("/", (req: Request, res: Response<string>) => {
  res.status(200).send("Hello, Node.js Backend 🚀");
});

// --- Error Handling Middleware ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log the error for debugging

  if (err instanceof AppError) {
    // If it's a known custom application error
    return res.status(err.statusCode).json({ error: err.message });
  }

  // For any other unexpected errors
  return res.status(500).json({ error: "An unexpected error occurred." });
});

// --- Start the Server ---
httpServer.listen(PORT, () => {
  // Listen on the HTTP server, not the Express app directly
  console.log(`HTTP Server running on port ${PORT}`);
  console.log(`Access API routes at http://localhost:${PORT}/api`);
  console.log("Socket.IO listening for connections.");
});
