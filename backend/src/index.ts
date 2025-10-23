import express, { NextFunction, Request, Response } from "express";
import { createServer, Server as HttpServer } from "node:http"; // Import createServer and HttpServer type
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import { AppError } from "./utils/errors";
import { PORT } from "./configs/constants";
import { corsMiddleware, corsOptions } from "./configs/corsOptions";

const app = express();

// Create an HTTP server instance from your Express app
const httpServer: HttpServer = createServer(app);

// Middleware to parse JSON incoming requests
app.use(express.json());
app.use(corsMiddleware())
app.use(cors(corsOptions));


// --- Routes ---
app.use("/api/auth", authRoutes); // Mount authentication routes

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
});
